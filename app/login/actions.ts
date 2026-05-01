'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function loginAction(_prevState: any, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Username dan password wajib diisi.' }
  }

  const admin = await prisma.admin.findUnique({
    where: { username }
  })

  if (!admin) {
    return { error: 'Kredensial tidak valid. Silakan periksa kembali.' }
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password)

  if (!isPasswordValid) {
    return { error: 'Kredensial tidak valid. Silakan periksa kembali.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60
  })

  redirect('/admin')
}