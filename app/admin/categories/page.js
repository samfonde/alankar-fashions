'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminCategories(){
  const [items,setItems] = useState([])
  const [form,setForm] = useState(null)
  const load = () => fetch('/api/admin/categories').then(r=>r.json()).then(d=>setItems(d.categories||[]))
  useEffect(load,[])
  const save = async () => { if (!form.name || !form.slug) return toast.error('Name and slug required'); const r = await fetch('/api/admin/categories', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) }); if (!r.ok) { const d = await r.json(); return toast.error(d.error||'Failed') } toast.success('Saved'); setForm(null); load() }
  const del = async (id) => { if(!confirm('Delete category?')) return; await fetch(`/api/admin/categories/${id}`, { method:'DELETE'}); load() }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="font-serif text-2xl">Categories</h1><p className="text-sm text-muted-foreground">{items.length} total</p></div>
        <button onClick={()=>setForm({ name:'', slug:'', parent_id:null, image_url:'', sort_order:0 })} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest"><Plus className="h-4 w-4"/> New</button>
      </div>
      <div className="bg-card border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Sort</th><th className="p-3"></th></tr></thead>
          <tbody className="divide-y divide-border">{items.map(c=>(<tr key={c.id}><td className="p-3">{c.name}</td><td className="p-3 text-muted-foreground">/{c.slug}</td><td className="p-3">{c.sort_order}</td><td className="p-3 text-right"><button onClick={()=>del(c.id)} className="text-destructive"><Trash2 className="h-4 w-4"/></button></td></tr>))}</tbody>
        </table>
      </div>
      {form && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4">
          <div className="bg-background w-full max-w-md border border-border p-5">
            <div className="flex justify-between items-center mb-4"><h2 className="font-serif text-xl">New Category</h2><button onClick={()=>setForm(null)}><X className="h-5 w-5"/></button></div>
            <div className="space-y-3">
              <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-')})} className="w-full h-10 px-3 border border-border"/>
              <input placeholder="Slug" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} className="w-full h-10 px-3 border border-border"/>
              <input placeholder="Image URL (optional)" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} className="w-full h-10 px-3 border border-border"/>
              <input type="number" placeholder="Sort order" value={form.sort_order} onChange={e=>setForm({...form,sort_order:Number(e.target.value)})} className="w-full h-10 px-3 border border-border"/>
            </div>
            <div className="flex justify-end gap-2 mt-5"><button onClick={()=>setForm(null)} className="h-10 px-4 border border-border text-xs uppercase tracking-widest">Cancel</button><button onClick={save} className="h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest">Save</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
