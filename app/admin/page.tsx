"use client"

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Toaster } from "@/components/ui/sonner"
import { uploadDesign, deleteDesign, editDesign, getDesigns } from './actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type Design = {
  id: string
  title: string
  description: string
  price: number
  imageUrl: string
}

export default function AdminPage() {
  const [designs, setDesigns] = useState<Design[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadDesigns = useCallback(async () => {
    try {
      const result = await getDesigns(search, page, 5)
      setDesigns(result.data)
      setTotalPages(result.totalPages)
    } catch {
      toast.error("Gagal memuat data desain")
    }
  }, [search, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDesigns()
    }, 400)
    return () => clearTimeout(timer)
  }, [loadDesigns])

  const resetForm = () => {
    setEditId(null)
    setTitle("")
    setPrice("")
    setDescription("")
    const fileInput = document.getElementById('image-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleEditClick = (design: Design) => {
    setEditId(design.id)
    setTitle(design.title)
    setPrice(design.price.toString())
    setDescription(design.description)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = editId 
        ? await editDesign(editId, formData) 
        : await uploadDesign(formData)

      if (result?.error) {
        toast.error(result.error) // Munculkan error asli ke layar
      } else {
        toast.success(editId ? "Desain berhasil diperbarui!" : "Desain berhasil ditambahkan!")
        resetForm()
        await loadDesigns()
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Terjadi kesalahan yang tidak diketahui")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteDesign(id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Desain berhasil dihapus!")
        await loadDesigns()
      }
    } catch {
      toast.error("Gagal menghapus desain")
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 sm:p-6 md:p-8 text-[#1a1a1a]">
      <Toaster position="top-center" richColors />
      <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/5 pb-4 md:pb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <Link href="/" className="text-sm font-medium hover:text-orange-600 transition-colors w-fit">
            Lihat Website &rarr;
          </Link>
        </div>

        <section className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-zinc-200">
          <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">{editId ? "Edit Desain" : "Upload Desain Baru"}</h2>
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Judul Desain</label>
                <input
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Desain Logo Premium"
                  required
                  className="w-full p-3 border border-zinc-300 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all text-sm md:text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Harga (Rp)</label>
                <input
                  type="number"
                  name="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Contoh: 150000"
                  required
                  className="w-full p-3 border border-zinc-300 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all text-sm md:text-base"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Deskripsi</label>
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Jelaskan detail dan gaya desain Anda di sini..."
                required
                className="w-full p-3 border border-zinc-300 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all text-sm md:text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 block">
                File Gambar {editId && <span className="text-zinc-400 font-normal block sm:inline mt-1 sm:mt-0">(Opsional: biarkan kosong jika tidak diubah)</span>}
              </label>
              <input
                id="image-upload"
                type="file"
                name="image"
                accept="image/*"
                required={!editId}
                className="w-full p-3 border border-zinc-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-bold file:bg-zinc-100 file:text-zinc-900 hover:file:bg-zinc-200 cursor-pointer text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-zinc-900 text-white px-6 sm:px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors w-full sm:w-auto disabled:opacity-50 text-sm md:text-base"
              >
                {isLoading ? "Memproses..." : (editId ? "Simpan Perubahan" : "Upload Desain")}
              </button>
              
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isLoading}
                  className="bg-zinc-200 text-zinc-900 px-6 sm:px-8 py-3 rounded-lg font-bold hover:bg-zinc-300 transition-colors w-full sm:w-auto disabled:opacity-50 text-sm md:text-base"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-zinc-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-4">
            <h2 className="text-lg md:text-xl font-bold">Daftar Desain</h2>
            
            <div className="relative w-full md:w-72">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Cari desain..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-9 pr-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-200 text-xs sm:text-sm text-zinc-500 whitespace-nowrap">
                  <th className="py-4 font-medium pl-2 sm:pl-0">Gambar</th>
                  <th className="py-4 font-medium">Judul</th>
                  <th className="py-4 font-medium">Harga</th>
                  <th className="py-4 font-medium pr-2 sm:pr-0">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {designs.map((design) => (
                  <tr key={design.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                    <td className="py-4 pl-2 sm:pl-0">
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden bg-zinc-100">
                        <Image
                          src={design.imageUrl}
                          alt={design.title}
                          fill
                          sizes="(max-width: 640px) 48px, 64px"
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-4 font-medium text-zinc-900 min-w-[150px]">{design.title}</td>
                    <td className="py-4 text-zinc-600 whitespace-nowrap">Rp {design.price.toLocaleString('id-ID')}</td>
                    <td className="py-4 pr-2 sm:pr-0">
                      <div className="flex items-center gap-3 sm:gap-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(design)}
                          className="text-blue-500 font-medium hover:text-blue-700 transition-colors text-xs sm:text-sm"
                        >
                          Edit
                        </button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger className="text-red-500 font-medium hover:text-red-700 transition-colors text-xs sm:text-sm">
                            Hapus
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white border-zinc-200 max-w-[90vw] sm:max-w-lg rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-zinc-900">Apakah Anda yakin?</AlertDialogTitle>
                              <AlertDialogDescription className="text-zinc-500 text-sm">
                                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus desain secara permanen dari database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4 sm:mt-0">
                              <AlertDialogCancel className="border-zinc-200 hover:bg-zinc-100 text-zinc-900 w-full sm:w-auto mt-0">
                                Batal
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(design.id)}
                                className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                              >
                                Ya, Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {designs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500 text-sm">
                      Belum ada data yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p => Math.max(1, p - 1));
                    }}
                    className={page <= 1 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i + 1);
                      }}
                      isActive={page === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p => Math.min(totalPages, p + 1));
                    }}
                    className={page >= totalPages ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </section>
      </div>
    </div>
  )
}