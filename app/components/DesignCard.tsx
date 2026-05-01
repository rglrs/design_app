"use client"

import Image from 'next/image'

type Design = {
  id: string
  title: string
  description: string
  imageUrl: string
  price: number
}

export default function DesignCard({ design }: { design: Design }) {
  return (
    <div className="group cursor-pointer">
      <div
        className="relative aspect-[4/5] overflow-hidden bg-zinc-200 rounded-2xl mb-6 shadow-sm"
        onContextMenu={(e) => e.preventDefault()}
      >
        <Image
          src={design.imageUrl}
          alt={design.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
          draggable={false}
          priority
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        <div className="absolute bottom-6 left-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <span className="bg-white px-4 py-2 rounded-full text-xs font-bold shadow-xl uppercase tracking-widest">
            Quick View
          </span>
        </div>
      </div>

      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-lg font-bold leading-tight mb-1 group-hover:text-orange-600 transition-colors">
            {design.title}
          </h3>
          <p className="text-sm text-zinc-500 line-clamp-1">{design.description}</p>
        </div>
        <div className="text-right">
          <span className="block text-lg font-bold">
            IDR {(design.price / 1000).toFixed(0)}K
          </span>
          <span className="text-[10px] text-zinc-400 uppercase tracking-tighter">License Inc.</span>
        </div>
      </div>
    </div>
  )
}