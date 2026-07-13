'use client'
import { useEffect, useRef, useState } from 'react'

export default function BrandVideo() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="container-tight py-14 md:py-20">
      <div className="text-center mb-8">
        <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Our Craft</div>
        <h2 className="font-serif text-3xl md:text-4xl mt-2">Crafted with Care</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Every piece tells a story of Kolhapur's rich craftsmanship tradition
        </p>
      </div>
      
      {/* Responsive video container with aspect ratio */}
      <div className="relative w-full mx-auto max-w-5xl" style={{ aspectRatio: '16 / 9' }}>
        {isVisible ? (
          <iframe
            src="https://player.vimeo.com/video/1209327159?background=1&autoplay=1&loop=1&muted=1"
            className="absolute inset-0 w-full h-full rounded-lg shadow-lg"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Alankar Fashions Brand Video"
          />
        ) : (
          <div className="absolute inset-0 bg-muted rounded-lg skeleton" />
        )}
      </div>
    </section>
  )
}
