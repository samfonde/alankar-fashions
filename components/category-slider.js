'use client'
import Link from 'next/link'

export default function CategorySlider() {
  // Default categories with placeholders - these will be replaced when fetched from API
  const categories = [
    { name: 'Pearls', slug: '/products?category=pearls', icon: '📿' },
    { name: 'Traditionals', slug: '/products?category=traditionals', icon: '💍' },
    { name: 'Necklace', slug: '/products?category=necklace', icon: '💎' },
    { name: 'Bangles', slug: '/products?category=bangles', icon: '⭕' },
    { name: 'Earrings', slug: '/products?category=earrings', icon: '✨' },
  ]

  return (
    <section className="container-tight py-14 md:py-20">
      <div className="text-center mb-10">
        <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Shop by</div>
        <h2 className="font-serif text-3xl md:text-4xl mt-2">Categories</h2>
      </div>
      
      {/* Horizontal swipeable container */}
      <div className="no-scrollbar overflow-x-auto scroll-smooth" style={{ scrollSnapType: 'x mandatory' }}>
        <div className="flex gap-6 md:gap-8 px-4 md:px-0 pb-2">
          {categories.map((cat) => (
            <Link 
              key={cat.name}
              href={cat.slug}
              className="flex flex-col items-center flex-shrink-0 group"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Circular image container */}
              <div className="w-[90px] h-[90px] md:w-[140px] md:h-[140px] rounded-full overflow-hidden bg-gradient-to-br from-[#C7A25A] to-[#B08B3F] flex items-center justify-center text-4xl md:text-5xl shadow-md transition-transform duration-300 group-hover:scale-105">
                <span className="opacity-90">{cat.icon}</span>
              </div>
              {/* Category name */}
              <div className="mt-3 text-sm md:text-base font-medium text-center">{cat.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
