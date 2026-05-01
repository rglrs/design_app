"use client"

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send } from 'lucide-react'
import { initializeChat, sendMessage, getChatHistory, markMessagesAsRead, getUnreadGuestCount } from '@/app/actions/chat'
import { supabase } from '@/lib/supabase'

type Message = {
  id: string
  content: string
  sender: string
  createdAt: Date
  isRead: boolean
}

export default function GuestChat() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [guestId, setGuestId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [input, setInput] = useState('')
  
  const bottomRef = useRef<HTMLDivElement>(null)
  const isOpenRef = useRef(isOpen)

  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    let currentGuestId = localStorage.getItem('guest_id')
    if (!currentGuestId) {
      currentGuestId = `guest_${Math.random().toString(36).substring(2, 15)}`
      localStorage.setItem('guest_id', currentGuestId)
    }
    setGuestId(currentGuestId)

    initializeChat(currentGuestId).then(() => {
      getChatHistory(currentGuestId as string).then(setMessages)
      getUnreadGuestCount(currentGuestId as string).then(setUnreadCount)
    })
  }, [])

  useEffect(() => {
    if (!guestId) return

    const channel = supabase
      .channel(`guest_chat_${guestId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ChatMessage'
      }, (payload) => {
        const newMsg = payload.new as Message
        newMsg.createdAt = new Date(newMsg.createdAt)
        
        setMessages((prev) => {
          if (prev.find((m) => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })

        if (newMsg.sender === 'ADMIN') {
          if (!isOpenRef.current) {
            setUnreadCount(prev => prev + 1)
          } else {
            markMessagesAsRead(guestId, 'GUEST')
          }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [guestId])

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      if (guestId) markMessagesAsRead(guestId, 'GUEST')
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, guestId])

  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
    return null
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !guestId) return

    const messageContent = input
    setInput('')
    await sendMessage(guestId, messageContent, 'GUEST')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-[28rem] bg-white border border-zinc-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-zinc-900 text-white px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-sm">Customer Support</span>
            <button onClick={() => setIsOpen(false)} className="hover:text-zinc-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'GUEST' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'GUEST' ? 'bg-orange-600 text-white rounded-br-none' : 'bg-zinc-200 text-zinc-900 rounded-bl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-zinc-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 bg-zinc-100 border-transparent rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white transition-all"
            />
            <button type="submit" disabled={!input.trim()} className="w-9 h-9 bg-orange-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-orange-700 transition-colors">
              <Send className="w-4 h-4 -ml-0.5" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 hover:bg-orange-700 transition-all"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  )
}