"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MessageSquare, LogOut, ExternalLink, Menu, X } from 'lucide-react'
import { logoutAction } from './actions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const handleCloseMenu = async () => {
      setIsMobileOpen(false)
    }
    handleCloseMenu()
  }, [pathname])

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-zinc-200 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
        <button className="md:hidden text-zinc-500" onClick={() => setIsMobileOpen(false)}>
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link 
          href="/admin" 
          onClick={() => setIsMobileOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/admin' ? 'bg-zinc-100 font-bold text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Katalog Desain
        </Link>
        <Link 
          href="/admin/chat" 
          onClick={() => setIsMobileOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/admin/chat' ? 'bg-zinc-100 font-bold text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}
        >
          <MessageSquare className="w-5 h-5" />
          Live Chat
        </Link>
      </nav>

      <div className="p-4 border-t border-zinc-200 space-y-2 shrink-0">
        <Link 
          href="/" 
          target="_blank" 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          Lihat Website
        </Link>
        <button 
          onClick={async () => await logoutAction()} 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden text-[#1a1a1a]">
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col transform transition-transform duration-300 md:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col shrink-0">
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden bg-white border-b border-zinc-200 p-4 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
          <button onClick={() => setIsMobileOpen(true)} className="text-zinc-600 p-1">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}