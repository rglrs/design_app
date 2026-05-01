'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { encrypt } from '@/lib/auth'

export async function loginAction(_prevState: unknown, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Username dan password wajib diisi.' }
  }

  const admin = await prisma.admin.findUnique({ where: { username } })

  if (!admin) return { error: 'Kredensial tidak valid.' }

  const isPasswordValid = await bcrypt.compare(password, admin.password)

  if (!isPasswordValid) return { error: 'Kredensial tidak valid.' }

  const sessionToken = await encrypt({ id: admin.id, username: admin.username })
  const cookieStore = await cookies()

  cookieStore.set('admin_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 4,
    path: '/'
  })

  redirect('/admin')
}