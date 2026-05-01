'use server'

import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { revalidatePath } from 'next/cache'

export async function uploadDesign(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = Number(formData.get('price'))
  const file = formData.get('image') as File

  if (!file || file.size === 0) {
    throw new Error('Gambar tidak ditemukan')
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  const filepath = join(uploadDir, filename)
  
  await mkdir(uploadDir, { recursive: true })
  
  await writeFile(filepath, buffer)

  await prisma.design.create({
    data: {
      title,
      description,
      price,
      imageUrl: `/uploads/${filename}`
    }
  })

  revalidatePath('/')
  revalidatePath('/admin')
}

export async function deleteDesign(id: string) {
  await prisma.design.delete({
    where: { id }
  })
  
  revalidatePath('/')
  revalidatePath('/admin')
}