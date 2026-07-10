'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { inr, dateFmt } from '@/lib/format'
import { IndianRupee, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Dashboard(){
  const [stats,setStats] = useState(null)
  useEffect(()=>{ fetch('/api/admin/stats').then(r=>r.json()).then(setStats) },[])
  if (!stats) return <div className="skeleton h-32"/>
  const cards = [
    { label:'Revenue', value: inr(stats.revenue), Icon: IndianRupee },
    { label:'Orders', value: stats.orders_count || 0, Icon: ShoppingCart },
    { label:'Low Stock Items', value: stats.low_stock?.length || 0, Icon: AlertTriangle },
    { label:'Growth', value: '—', Icon: TrendingUp },
  ]
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your store</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-card border border-border p-5">
            <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</span><c.Icon className="h-4 w-4 text-muted-foreground"/></div>
            <div className="text-2xl font-semibold mt-2">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4"><h2 className="font-serif text-lg">Sales — Last 14 days</h2></div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.sales_daily||[]}><CartesianGrid strokeDasharray="3 3" opacity={0.3}/><XAxis dataKey="date" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip formatter={(v)=>inr(v)}/><Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false}/></LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4"><h2 className="font-serif text-lg">Recent Orders</h2><Link className="text-xs text-muted-foreground underline" href="/admin/orders">View all</Link></div>
          <div className="space-y-2">
            {(stats.recent||[]).slice(0,6).map(o => (
              <Link key={o.id} href={`/admin/orders`} className="flex justify-between items-center py-2 border-b border-border/60 text-sm">
                <div><div className="font-medium">{o.order_number}</div><div className="text-xs text-muted-foreground">{dateFmt(o.created_at)} · {o.status}</div></div>
                <div className="font-medium">{inr(o.total)}</div>
              </Link>
            ))}
            {!stats.recent?.length && <div className="text-sm text-muted-foreground">No orders yet.</div>}
          </div>
        </div>
        <div className="bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4"><h2 className="font-serif text-lg">Low Stock</h2><Link className="text-xs text-muted-foreground underline" href="/admin/products">Manage</Link></div>
          <div className="space-y-2">
            {(stats.low_stock||[]).slice(0,8).map(p => (
              <div key={p.id} className="flex justify-between items-center text-sm py-2 border-b border-border/60">
                <span>{p.name}</span><span className="text-destructive">{p.stock} left</span>
              </div>
            ))}
            {!stats.low_stock?.length && <div className="text-sm text-muted-foreground">All products well-stocked.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
