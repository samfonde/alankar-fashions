'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react'
import { toast } from 'sonner'

const emptyR = { product_id: '', reviewer_name: '', rating: 5, title: '', body: '', created_at: '' }

export default function AdminReviews() {
  const [items, setItems] = useState([])
  const [products, setProducts] = useState([])
  const [edit, setEdit] = useState(null)
  const [q, setQ] = useState('')

  const load = () => {
    fetch('/api/admin/reviews').then(r=>r.json()).then(d=>setItems(d.reviews||[]))
    fetch('/api/admin/products').then(r=>r.json()).then(d=>setProducts(d.products||[]))
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!edit.product_id) return toast.error('Select a product')
    if (!edit.reviewer_name.trim()) return toast.error('Reviewer name is required')
    const payload = { ...edit, rating: Number(edit.rating) }
    if (!payload.created_at) delete payload.created_at
    const url = edit.id ? `/api/admin/reviews/${edit.id}` : '/api/admin/reviews'
    const method = edit.id ? 'PATCH' : 'POST'
    const r = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    const d = await r.json()
    if (!r.ok) return toast.error(d.error || 'Failed')
    toast.success(edit.id ? 'Review updated' : 'Review added'); setEdit(null); load()
  }
  const del = async (r) => { if (!confirm('Delete this review?')) return; await fetch(`/api/admin/reviews/${r.id}`, { method: 'DELETE' }); toast.success('Deleted'); load() }

  const filtered = items.filter(r => !q || r.products?.name?.toLowerCase().includes(q.toLowerCase()) || r.reviewer_name?.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">Reviews</h1>
          <p className="text-sm text-muted-foreground">{items.length} total · Add credible reviews to any product before real customer reviews come in</p>
        </div>
        <div className="flex gap-2">
          <input placeholder="Search product or reviewer…" value={q} onChange={e=>setQ(e.target.value)} className="h-10 px-3 border border-border bg-background text-sm"/>
          <button onClick={()=>setEdit({...emptyR})} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest"><Plus className="h-4 w-4"/> New Review</button>
        </div>
      </div>

      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">Product</th><th className="p-3">Reviewer</th><th className="p-3">Rating</th><th className="p-3">Title</th><th className="p-3">Source</th><th className="p-3"></th></tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(r => (
              <tr key={r.id}>
                <td className="p-3">{r.products?.name || '—'}</td>
                <td className="p-3">{r.reviewer_name || 'Anonymous'}</td>
                <td className="p-3"><span className="inline-flex items-center gap-1">{r.rating} <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500"/></span></td>
                <td className="p-3 max-w-[200px] truncate">{r.title || '—'}</td>
                <td className="p-3"><span className={`text-xs px-2 py-1 uppercase tracking-widest ${r.is_admin_added ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>{r.is_admin_added ? 'Admin' : 'Customer'}</span></td>
                <td className="p-3 text-right">
                  <button onClick={()=>setEdit({ id:r.id, product_id:r.product_id, reviewer_name:r.reviewer_name||'', rating:r.rating, title:r.title||'', body:r.body||'', created_at: r.created_at?.slice(0,10)||'' })} className="p-2 hover:bg-muted"><Pencil className="h-4 w-4"/></button>
                  <button onClick={()=>del(r)} className="p-2 hover:bg-muted text-destructive"><Trash2 className="h-4 w-4"/></button>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No reviews yet</td></tr>}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4 overflow-y-auto">
          <div className="bg-background w-full max-w-lg border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background">
              <h2 className="font-serif text-xl">{edit.id ? 'Edit Review' : 'New Review'}</h2>
              <button onClick={()=>setEdit(null)}><X className="h-5 w-5"/></button>
            </div>
            <div className="p-5 space-y-4">
              <F label="Product">
                <select value={edit.product_id} onChange={e=>setEdit({...edit, product_id:e.target.value})} className="w-full h-10 px-3 border border-border bg-background">
                  <option value="">— Select product —</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </F>
              <F label="Reviewer Name"><input value={edit.reviewer_name} onChange={e=>setEdit({...edit, reviewer_name:e.target.value})} placeholder="e.g. Priya S." className="w-full h-10 px-3 border border-border bg-background"/></F>
              <F label="Rating">
                <select value={edit.rating} onChange={e=>setEdit({...edit, rating:e.target.value})} className="w-full h-10 px-3 border border-border bg-background">
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n>1?'s':''}</option>)}
                </select>
              </F>
              <F label="Title (optional)"><input value={edit.title} onChange={e=>setEdit({...edit, title:e.target.value})} className="w-full h-10 px-3 border border-border bg-background"/></F>
              <F label="Review Text"><textarea rows={4} value={edit.body} onChange={e=>setEdit({...edit, body:e.target.value})} className="w-full px-3 py-2 border border-border bg-background"/></F>
              <F label="Date (optional — leave blank for today)"><input type="date" value={edit.created_at} onChange={e=>setEdit({...edit, created_at:e.target.value})} className="w-full h-10 px-3 border border-border bg-background"/></F>
            </div>
            <div className="flex gap-2 justify-end p-4 border-t border-border sticky bottom-0 bg-background">
              <button onClick={()=>setEdit(null)} className="h-10 px-4 border border-border text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={save} className="h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function F({label, children}) { return <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label> }
