import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DesignCard from './components/DesignCard'
import SearchFilter from './components/SearchFilter'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export const metadata = {
  title: 'Visual Archive Premium Design Assets',
  description: 'Curated high-quality design assets for modern creators.',
  openGraph: {
    title: 'Visual Archive',
    description: 'Curated high-quality design assets for modern creators.',
    type: 'website',
  }
}

type PageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home(props: PageProps) {
  await props.params
  const searchParams = await props.searchParams
  const q = (searchParams.q as string) || ""
  const page = Number(searchParams.page) || 1
  const limit = 6
  const skip = (page - 1) * limit

  const where = q ? {
    OR: [
      { title: { contains: q, mode: 'insensitive' as const } },
      { description: { contains: q, mode: 'insensitive' as const } }
    ]
  } : {}

  const [designs, total] = await Promise.all([
    prisma.design.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.design.count({ where })
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#1a1a1a] selection:bg-orange-100 selection:text-orange-900">
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <span className="text-lg md:text-xl font-bold tracking-tighter">VISUAL ARCHIVE</span>
          <div className="flex gap-4 md:gap-8 text-sm font-medium">
            <Link href="#" className="hover:text-orange-600 transition-colors">Katalog</Link>
            <Link href="/login" className="hover:text-orange-600 transition-colors">Admin</Link>
          </div>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[1] md:leading-[0.9] mb-6 md:mb-8">
          Elevate your <br />
          <span className="text-orange-600">visual</span> standards.
        </h1>
        <p className="max-w-xl text-base md:text-lg text-zinc-500 leading-relaxed">
          Koleksi aset desain eksklusif yang dirancang untuk kebutuhan digital modern. 
          Kualitas premium tanpa kompromi untuk proyek kreatif Anda.
        </p>
      </header>

      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-8 md:pb-12">
        <SearchFilter />
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20 md:pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
          {designs.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
        
        {designs.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            Tidak ada desain yang cocok dengan pencarian &quot;{q}&quot;
          </div>
        )}

        <div className="mt-16">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href={page > 1 ? `/?q=${q}&page=${page - 1}` : "#"}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    href={`/?q=${q}&page=${i + 1}`}
                    isActive={page === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  href={page < totalPages ? `/?q=${q}&page=${page + 1}` : "#"}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>

      <footer className="border-t border-black/5 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-sm text-zinc-400">&copy; 2026 Visual Archive. All rights reserved.</p>
          <div className="flex gap-4 md:gap-6">
            <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer">IG</div>
            <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer">TW</div>
          </div>
        </div>
      </footer>
    </main>
  )
}