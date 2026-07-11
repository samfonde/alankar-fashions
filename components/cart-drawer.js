'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, ShoppingBag, Trash2 } from 'lucide-react'
import { inr } from '@/lib/format'

export default function CartDrawer() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const router = useRouter()

  const load = () => { try { setItems(JSON.parse(localStorage.getItem('cart') || '[]')) } catch { setItems([]) } }

  useEffect(() => {
    load()
    const onOpen = () => { load(); setOpen(true) }
    const onUpdate = () => load()
    window.addEventListener('cart:open', onOpen)
    window.addEventListener('cart:updated', onUpdate)
    return () => {
      window.removeEventListener('cart:open', onOpen)
      window.removeEventListener('cart:updated', onUpdate)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const persist = (arr) => { setItems(arr); localStorage.setItem('cart', JSON.stringify(arr)); window.dispatchEvent(new Event('cart:updated')) }
  const remove = (key) => persist(items.filter(i => i.key !== key))
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  const goCheckout = () => { setOpen(false); router.push('/checkout') }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      {/* Drawer — slides in from the RIGHT */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-[90%] max-w-md bg-background shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog" aria-label="Shopping bag"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border shrink-0">
          <h2 className="font-serif text-lg flex items-center gap-2"><ShoppingBag className="h-5 w-5"/> Your Bag ({items.length})</h2>
          <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 -mr-2"><X className="h-6 w-6"/></button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 grid place-items-center text-center p-6">
            <div>
              <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground"/>
              <p className="mt-3 text-muted-foreground">Your bag is empty</p>
              <button onClick={() => setOpen(false)} className="mt-4 px-6 py-2.5 border border-border text-xs uppercase tracking-widest">Continue Shopping</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto divide-y divide-border px-4">
              {items.map(i => (
                <div key={i.key} className="flex gap-3 py-4">
                  <Link href={`/products/${i.slug}`} onClick={() => setOpen(false)} className="w-16 h-20 bg-muted overflow-hidden shrink-0">
                    <img src={i.image} alt={i.name} className="w-full h-full object-cover"/>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <Link href={`/products/${i.slug}`} onClick={() => setOpen(false)} className="font-medium text-sm line-clamp-2">{i.name}</Link>
                      <button onClick={() => remove(i.key)} aria-label="Remove" className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-4 w-4"/></button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{[i.size, i.color].filter(Boolean).join(' · ') || 'One Size'} · Qty {i.quantity}</div>
                    <div className="text-sm font-semibold mt-1">{inr(i.price * i.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-4 shrink-0 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">{inr(subtotal)}</span></div>
              <button onClick={goCheckout} className="w-full h-12 bg-primary text-primary-foreground text-sm uppercase tracking-widest">Checkout</button>
              <Link href="/cart" onClick={() => setOpen(false)} className="block text-center text-xs uppercase tracking-widest text-muted-foreground">View Full Bag</Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}
