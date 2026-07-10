'use client'
import { useEffect, useState } from 'react'
import { dateFmt } from '@/lib/format'

export default function AdminCustomers(){
  const [items,setItems] = useState([])
  useEffect(()=>{ fetch('/api/admin/customers').then(r=>r.json()).then(d=>setItems(d.customers||[])) },[])
  return (
    <div className="space-y-4">
      <div><h1 className="font-serif text-2xl">Customers</h1><p className="text-sm text-muted-foreground">{items.length} total</p></div>
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Joined</th></tr></thead>
          <tbody className="divide-y divide-border">{items.map(c=>(<tr key={c.id}><td className="p-3">{c.full_name||'—'}</td><td className="p-3">{c.email}</td><td className="p-3"><span className={`text-xs uppercase tracking-widest ${c.role==='admin'?'text-primary':''}`}>{c.role}</span></td><td className="p-3 text-muted-foreground">{dateFmt(c.created_at)}</td></tr>))}</tbody>
        </table>
      </div>
    </div>
  )
}
