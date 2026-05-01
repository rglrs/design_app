import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { uploadDesign, deleteDesign } from './actions'
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

export const metadata = {
  title: 'Admin Dashboard - Visual Archive',
}

export default async function AdminPage() {
  const designs = await prisma.design.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-[#fafafa] p-8 text-[#1a1a1a]">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <div className="flex items-center justify-between border-b border-black/5 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <a href="/" className="text-sm font-medium hover:text-orange-600 transition-colors">
            Lihat Website
          </a>
        </div>

        <section className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
          <h2 className="text-xl font-bold mb-6">Upload Desain Baru</h2>
          <form action={uploadDesign} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Judul Desain</label>
                <input 
                  type="text" 
                  name="title" 
                  placeholder="Contoh: Desain Logo Premium"
                  required
                  className="w-full p-3 border border-zinc-300 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Harga (Rp)</label>
                <input 
                  type="number" 
                  name="price" 
                  placeholder="Contoh: 150000"
                  required
                  className="w-full p-3 border border-zinc-300 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Deskripsi</label>
              <textarea 
                name="description" 
                rows={3} 
                placeholder="Jelaskan detail dan gaya desain Anda di sini..."
                required
                className="w-full p-3 border border-zinc-300 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">File Gambar</label>
              <input 
                type="file" 
                name="image" 
                accept="image/*" 
                required
                className="w-full p-3 border border-zinc-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-zinc-100 file:text-zinc-900 hover:file:bg-zinc-200 cursor-pointer"
              />
            </div>

            <button 
              type="submit"
              className="bg-zinc-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors w-full md:w-auto"
            >
              Upload Desain
            </button>
          </form>
        </section>

        <section className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
          <h2 className="text-xl font-bold mb-6">Daftar Desain</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-sm text-zinc-500">
                  <th className="py-4 font-medium">Gambar</th>
                  <th className="py-4 font-medium">Judul</th>
                  <th className="py-4 font-medium">Harga</th>
                  <th className="py-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {designs.map((design) => (
                  <tr key={design.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                    <td className="py-4">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-zinc-100">
                        <Image
                          src={design.imageUrl}
                          alt={design.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-4 font-medium text-zinc-900">{design.title}</td>
                    <td className="py-4 text-zinc-600">Rp {design.price.toLocaleString('id-ID')}</td>
                    <td className="py-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="text-red-500 font-medium hover:text-red-700 transition-colors">
                            Hapus
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-zinc-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-zinc-900">Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription className="text-zinc-500">
                              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus desain secara permanen dari database.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-zinc-200 hover:bg-zinc-100 text-zinc-900">
                              Batal
                            </AlertDialogCancel>
                            <form action={async () => {
                              'use server'
                              await deleteDesign(design.id)
                            }}>
                              <AlertDialogAction 
                                type="submit" 
                                className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                              >
                                Ya, Hapus
                              </AlertDialogAction>
                            </form>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
                {designs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500">
                      Belum ada desain yang diupload.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  )
}