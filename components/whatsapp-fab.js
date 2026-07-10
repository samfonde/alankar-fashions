'use client'
import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'

export default function WhatsAppFab() {
  const [phone, setPhone] = useState('919657093006')
  const [msg, setMsg] = useState('Hi Alankar Fashions! I have a question about your jewellery.')
  useEffect(() => {
    fetch('/api/brand').then(r=>r.json()).then(d => {
      if (d?.brand?.support_phone) setPhone(String(d.brand.support_phone).replace(/[^0-9]/g,''))
      if (d?.brand?.whatsapp_message) setMsg(d.brand.whatsapp_message)
    }).catch(()=>{})
  }, [])
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  return (
    <a href={href} target="_blank" rel="noopener" aria-label="Chat on WhatsApp" className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#1ea952] text-white shadow-lg grid place-items-center transition-transform hover:scale-105">
      <MessageCircle className="h-7 w-7" fill="currentColor" strokeWidth={0}/>
      <span className="sr-only">WhatsApp</span>
    </a>
  )
}
