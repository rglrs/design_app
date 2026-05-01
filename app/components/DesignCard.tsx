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
    <div className="group cursor-pointer w-full">
      <div
        className="relative aspect-square overflow-hidden bg-zinc-200 rounded-2xl mb-4 sm:mb-6 shadow-sm w-full"
        onContextMenu={(e) => e.preventDefault()}
      >
        <Image
          src={design.imageUrl}
          alt={design.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
          draggable={false}
          priority
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <span className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold shadow-xl uppercase tracking-widest">
            Quick View
          </span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
        <div className="w-full sm:w-auto">
          <h3 className="text-base sm:text-lg font-bold leading-tight mb-1 group-hover:text-orange-600 transition-colors">
            {design.title}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 line-clamp-1">{design.description}</p>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start">
          <span className="block text-base sm:text-lg font-bold">
            IDR {(design.price / 1000).toFixed(0)}K
          </span>
          <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase tracking-tighter">
            License Inc.
          </span>
        </div>
      </div>
    </div>
  )
}