'use client'

import { useState, useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from './actions'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-orange-100 selection:text-orange-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-xl sm:text-2xl font-bold tracking-tighter block mb-2">DAFIS</span>
          <h1 className="text-sm sm:text-base text-zinc-500">Autentikasi Dashboard</h1>
        </div>
        <form action={formAction} className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-black/5 space-y-5 sm:space-y-6">
          {state?.error && (
            <div className="p-3 sm:p-4 bg-red-50 text-red-600 text-xs sm:text-sm font-medium rounded-xl border border-red-100">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-zinc-900">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Masukkan username admin"
              required
              className="w-full p-3 sm:p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-zinc-900">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Masukkan password"
                required
                className="w-full p-3 sm:p-4 pr-12 bg-zinc-50 border border-zinc-200 rounded-xl text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-orange-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#1a1a1a] text-white p-3 sm:p-4 rounded-xl text-sm sm:text-base font-bold tracking-wide hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isPending ? 'Memverifikasi...' : 'Akses Dashboard'}
          </button>
          
          <div className="text-center mt-4 sm:mt-6">
            <Link href="/" className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-orange-600 transition-colors">
              &larr; Kembali ke Katalog
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}