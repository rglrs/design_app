"use client"

import { useState, useEffect, useRef } from 'react'
import { Send, User, MessageSquare, ChevronLeft, Trash2 } from 'lucide-react'
import { getAdminSessions, getChatHistory, sendMessage, markMessagesAsRead, deleteChatSession } from '@/app/actions/chat'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

type Message = {
  id: string
  sessionId: string
  content: string
  sender: string
  createdAt: Date
  isRead: boolean
}

type Session = {
  id: string
  guestId: string
  messages: Message[]
  updatedAt: Date
  unreadCount: number
}

export default function AdminChat() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  
  const bottomRef = useRef<HTMLDivElement>(null)
  const activeSessionRef = useRef<Session | null>(null)

  useEffect(() => {
    activeSessionRef.current = activeSession
  }, [activeSession])

  useEffect(() => {
    getAdminSessions().then(setSessions)
  }, [])

  useEffect(() => {
    if (!activeSession) return

    const loadSessionData = async () => {
      const history = await getChatHistory(activeSession.guestId)
      setMessages(history)
      await markMessagesAsRead(activeSession.guestId, 'ADMIN')
    }
    
    loadSessionData()
  }, [activeSession])

  useEffect(() => {
    const channel = supabase
      .channel('admin_global_chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ChatMessage'
      }, (payload) => {
        const newMsg = payload.new as Message
        newMsg.createdAt = new Date(newMsg.createdAt)

        setSessions((prev) => {
          const idx = prev.findIndex((s) => s.id === newMsg.sessionId)
          if (idx === -1) {
            getAdminSessions().then(setSessions)
            return prev
          }
          
          const session = prev[idx]
          const isActive = activeSessionRef.current?.id === session.id
          const isUnread = !isActive && newMsg.sender === 'GUEST'
          
          const updatedSession = {
            ...session,
            messages: [newMsg],
            unreadCount: isUnread ? session.unreadCount + 1 : session.unreadCount
          }
          
          const newSessions = [...prev]
          newSessions.splice(idx, 1)
          return [updatedSession, ...newSessions]
        })

        if (activeSessionRef.current?.id === newMsg.sessionId) {
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
          
          if (newMsg.sender === 'GUEST' && activeSessionRef.current) {
            markMessagesAsRead(activeSessionRef.current.guestId, 'ADMIN')
          }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !activeSession) return

    const messageContent = input
    setInput('')
    await sendMessage(activeSession.guestId, messageContent, 'ADMIN')
  }

  const handleDeleteSession = async (e: React.MouseEvent, guestId: string) => {
    e.stopPropagation()
    if (!confirm('Apakah Anda yakin ingin menghapus seluruh percakapan ini?')) return

    try {
      await deleteChatSession(guestId)
      setSessions((prev) => prev.filter((s) => s.guestId !== guestId))
      if (activeSession?.guestId === guestId) {
        setActiveSession(null)
        setMessages([])
      }
      toast.success('Percakapan berhasil dihapus')
    } catch {
      toast.error('Gagal menghapus percakapan')
    }
  }

  return (
    <div className="flex h-full bg-white relative">
      <div className={`w-full md:w-80 border-r border-zinc-200 bg-zinc-50 flex flex-col shrink-0 ${activeSession ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-zinc-200 bg-white">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Daftar Obrolan</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => {
                setActiveSession(session)
                setSessions((prev) => 
                  prev.map((s) => s.id === session.id ? { ...s, unreadCount: 0 } : s)
                )
              }}
              className={`group w-full text-left p-4 border-b border-zinc-100 hover:bg-zinc-100 transition-colors cursor-pointer relative ${activeSession?.id === session.id ? 'bg-zinc-100' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden pr-6">
                  <div className="flex justify-between items-center mb-0.5">
                    <div className="font-medium text-sm text-zinc-900 truncate">
                      {session.guestId.replace('guest_', 'Guest #')}
                    </div>
                    {session.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {session.unreadCount}
                      </span>
                    )}
                  </div>
                  {session.messages[0] && (
                    <div className={`text-xs truncate ${session.unreadCount > 0 ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}>
                      {session.messages[0].content}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteSession(e, session.guestId)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="p-6 text-center text-sm text-zinc-500">
              Belum ada riwayat percakapan.
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-white ${!activeSession ? 'hidden md:flex' : 'flex'}`}>
        {activeSession ? (
          <>
            <div className="p-4 md:p-6 border-b border-zinc-200 bg-white flex justify-between items-center">
              <div className="flex items-center gap-3 md:gap-4">
                <button 
                  onClick={() => setActiveSession(null)}
                  className="md:hidden p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                  <User className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-base md:text-lg font-bold text-zinc-900 truncate">
                    {activeSession.guestId.replace('guest_', 'Guest #')}
                  </h3>
                  <span className="text-[10px] md:text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Online
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteSession(e, activeSession.guestId)}
                className="p-2.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Hapus kontak"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-zinc-50/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 md:px-5 md:py-3 text-sm ${msg.sender === 'ADMIN' ? 'bg-zinc-900 text-white rounded-br-none' : 'bg-white border border-zinc-200 text-zinc-900 rounded-bl-none shadow-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 md:p-5 bg-white border-t border-zinc-200 flex gap-2 md:gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Balas pesan..."
                className="flex-1 bg-zinc-100 border-transparent rounded-xl px-4 py-3 md:px-5 md:py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
              />
              <button type="submit" disabled={!input.trim()} className="px-4 md:px-8 bg-zinc-900 text-white rounded-xl flex items-center justify-center gap-2 font-bold disabled:opacity-50 hover:bg-zinc-800 transition-colors">
                <span className="hidden md:inline">Kirim</span>
                <Send className="w-4 h-4 md:w-4 md:h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-4">
            <MessageSquare className="w-16 h-16 opacity-20" />
            <p>Pilih percakapan di samping untuk mulai merespons pelanggan.</p>
          </div>
        )}
      </div>
    </div>
  )
}