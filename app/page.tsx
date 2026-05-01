import { prisma } from '@/lib/prisma'
import DesignCard from './components/DesignCard'

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
  params: Promise<{}>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home(props: PageProps) {
  await props.params;

  const designs = await prisma.design.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#1a1a1a] selection:bg-orange-100 selection:text-orange-900">
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tighter">VISUAL ARCHIVE</span>
          <div className="flex gap-8 text-sm font-medium">
            <a href="#" className="hover:text-orange-600 transition-colors">Katalog</a>
            <a href="/login" className="hover:text-orange-600 transition-colors">Admin</a>
          </div>
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-24">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] mb-8">
          Elevate your <br />
          <span className="text-orange-600">visual</span> standards.
        </h1>
        <p className="max-w-xl text-lg text-zinc-500 leading-relaxed">
          Koleksi aset desain eksklusif yang dirancang untuk kebutuhan digital modern. 
          Kualitas premium tanpa kompromi untuk proyek kreatif Anda.
        </p>
      </header>

      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {designs.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      </section>

      <footer className="border-t border-black/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-zinc-400"> 2026 Visual Archive. All rights reserved.</p>
          <div className="flex gap-6">
            <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer">IG</div>
            <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer">TW</div>
          </div>
        </div>
      </footer>
    </main>
  )
}