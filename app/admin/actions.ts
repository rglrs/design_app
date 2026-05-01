'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyAuth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

const getSupabase = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Kunci Supabase Service Role belum disetel di Vercel Environment Variables")
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/login')
}

export async function getDesigns(search: string = "", page: number = 1, limit: number = 5) {
  const skip = (page - 1) * limit
  const where = search ? {
    OR: [
      { title: { contains: search, mode: 'insensitive' as const } },
      { description: { contains: search, mode: 'insensitive' as const } }
    ]
  } : {}
  
  const [data, total] = await Promise.all([
    prisma.design.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.design.count({ where })
  ])
  
  return { data, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
}

export async function uploadDesign(formData: FormData) {
  try {
    const auth = await verifyAuth()
    if (!auth) return { error: 'Akses ditolak. Sesi tidak valid.' }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = Number(formData.get('price'))
    const file = formData.get('image') as File

    if (!file || file.size === 0) return { error: 'Gambar tidak ditemukan.' }
    if (!ALLOWED_TYPES.includes(file.type)) return { error: 'Format file harus JPG, PNG, atau WEBP.' }
    if (file.size > MAX_FILE_SIZE) return { error: 'Ukuran file maksimal 5MB.' }

    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    const supabase = getSupabase()
    
    const { error: uploadError } = await supabase.storage
      .from('designs')
      .upload(filename, file, { cacheControl: '3600', upsert: false })

    if (uploadError) return { error: 'Gagal mengunggah gambar ke Supabase: ' + uploadError.message }

    const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(filename)

    await prisma.design.create({
      data: { title, description, price, imageUrl: publicUrl }
    })

    revalidatePath('/')
    revalidatePath('/admin')
    
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message }
    return { error: 'Terjadi kesalahan sistem yang tidak diketahui.' }
  }
}

export async function editDesign(id: string, formData: FormData) {
  try {
    const auth = await verifyAuth()
    if (!auth) return { error: 'Akses ditolak. Sesi tidak valid.' }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = Number(formData.get('price'))
    const file = formData.get('image') as File | null

    type DataToUpdate = { title: string; description: string; price: number; imageUrl?: string; }
    const dataToUpdate: DataToUpdate = { title, description, price }

    if (file && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type)) return { error: 'Format file harus JPG, PNG, atau WEBP.' }
      if (file.size > MAX_FILE_SIZE) return { error: 'Ukuran file maksimal 5MB.' }

      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

      const supabase = getSupabase()
      const { error: uploadError } = await supabase.storage
        .from('designs')
        .upload(filename, file, { cacheControl: '3600', upsert: false })

      if (uploadError) return { error: 'Gagal mengunggah gambar baru: ' + uploadError.message }

      const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(filename)
      dataToUpdate.imageUrl = publicUrl
    }

    await prisma.design.update({ where: { id }, data: dataToUpdate })

    revalidatePath('/')
    revalidatePath('/admin')
    
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message }
    return { error: 'Terjadi kesalahan sistem yang tidak diketahui.' }
  }
}

export async function deleteDesign(id: string) {
  try {
    const auth = await verifyAuth()
    if (!auth) return { error: 'Akses ditolak. Sesi tidak valid.' }

    const design = await prisma.design.findUnique({ where: { id } })
    
    if (design && design.imageUrl) {
      const filename = design.imageUrl.split('/').pop()
      if (filename) {
        const supabase = getSupabase()
        await supabase.storage.from('designs').remove([filename])
      }
    }

    await prisma.design.delete({ where: { id } })
    
    revalidatePath('/')
    revalidatePath('/admin')
    
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message }
    return { error: 'Terjadi kesalahan sistem yang tidak diketahui.' }
  }
}