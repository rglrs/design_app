'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyAuth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

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
  const auth = await verifyAuth()
  if (!auth) throw new Error('Akses ditolak')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = Number(formData.get('price'))
  const file = formData.get('image') as File

  if (!file || file.size === 0) throw new Error('Gambar tidak ditemukan')
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Format file harus JPG, PNG, atau WEBP')
  if (file.size > MAX_FILE_SIZE) throw new Error('Ukuran file maksimal 5MB')

  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('designs')
    .upload(filename, file, { cacheControl: '3600', upsert: false })

  if (uploadError) throw new Error('Gagal mengunggah gambar ke server')

  const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(filename)

  await prisma.design.create({
    data: { title, description, price, imageUrl: publicUrl }
  })

  revalidatePath('/')
  revalidatePath('/admin')
}

export async function editDesign(id: string, formData: FormData) {
  const auth = await verifyAuth()
  if (!auth) throw new Error('Akses ditolak')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = Number(formData.get('price'))
  const file = formData.get('image') as File | null

  type DataToUpdate = {
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
  }

  const dataToUpdate: DataToUpdate = { title, description, price }

  if (file && file.size > 0) {
    if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Format file harus JPG, PNG, atau WEBP')
    if (file.size > MAX_FILE_SIZE) throw new Error('Ukuran file maksimal 5MB')

    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('designs')
      .upload(filename, file, { cacheControl: '3600', upsert: false })

    if (uploadError) throw new Error('Gagal mengunggah gambar baru')

    const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(filename)
    dataToUpdate.imageUrl = publicUrl
  }

  await prisma.design.update({ where: { id }, data: dataToUpdate })

  revalidatePath('/')
  revalidatePath('/admin')
}

export async function deleteDesign(id: string) {
  const auth = await verifyAuth()
  if (!auth) throw new Error('Akses ditolak')

  await prisma.design.delete({ where: { id } })
  
  revalidatePath('/')
  revalidatePath('/admin')
}