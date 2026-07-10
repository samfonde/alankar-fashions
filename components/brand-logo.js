'use client'
import { useEffect, useState } from 'react'

export default function BrandLogo({ variant = 'dark', size = 'md', logoUrl }) {
  const [url, setUrl] = useState(logoUrl || null)
  useEffect(() => {
    if (logoUrl) return
    fetch('/api/brand').then(r=>r.json()).then(d => { if (d?.brand?.logo_url) setUrl(d.brand.logo_url) }).catch(()=>{})
  }, [logoUrl])

  const heights = { sm: 'h-8', md: 'h-10 md:h-12', lg: 'h-14 md:h-16' }
  if (url) return <img src={url} alt="Alankar Fashions" className={`${heights[size]} w-auto object-contain`}/>
  // Default SVG mark: Devanagari-style "अ" monogram in a circle + wordmark
  const gold = variant === 'dark' ? '#D9B767' : '#8A6C2E'
  const text = variant === 'dark' ? '#F5E9CE' : '#3B1F1A'
  return (
    <div className={`flex items-center gap-3 ${heights[size]}`}>
      <svg viewBox="0 0 64 64" className="h-full w-auto" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="none" stroke={gold} strokeWidth="1.5"/>
        <circle cx="32" cy="32" r="24" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.6"/>
        <text x="32" y="42" textAnchor="middle" fontFamily="'Noto Serif Devanagari', serif" fontSize="28" fill={gold} fontWeight="700">अ</text>
        <path d="M18 50 Q32 58 46 50" fill="none" stroke={gold} strokeWidth="1" opacity="0.7"/>
      </svg>
      <div className="flex flex-col justify-center leading-none">
        <span className="font-devanagari text-xl md:text-2xl font-bold tracking-wide" style={{ color: gold }}>अलंकार</span>
        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] mt-0.5" style={{ color: text, opacity: 0.85 }}>Fashions</span>
      </div>
    </div>
  )
}
