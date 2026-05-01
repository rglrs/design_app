"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get('q') || ''
      if (query !== currentQ) {
        const params = new URLSearchParams(searchParams.toString())
        if (query) {
          params.set('q', query)
        } else {
          params.delete('q')
        }
        params.set('page', '1')
        router.push(`/?${params.toString()}`, { scroll: false })
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query, router, searchParams])

  return (
    <div className="relative w-full max-w-xl mx-auto md:mx-0">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        type="text"
        placeholder="Cari desain..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-12 pr-4 py-3 border border-zinc-300 rounded-full text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-all text-sm md:text-base shadow-sm"
      />
    </div>
  )
}