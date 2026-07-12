'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, X, Upload } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminCategories(){
  const [items,setItems] = useState([])
  const [form,setForm] = useState(null)
  const load = () => fetch('/api/admin/categories').then(r=>r.json()).then(d=>setItems(d.categories||[]))
  useEffect(() => { load() }, [])

  const upload = async (file) => {
    const b64 = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(file) })
    const r = await fetch('/api/admin/upload', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ file: b64, filename: file.name, contentType: file.type }) })
    const d = await r.json()
    if (!r.ok) { toast.error(d.error||'Upload failed'); return null }
    return d.url
  }

  const save = async () => {
    if (!form.name || !form.slug) return toast.error('Name and slug required')
    const r = await fetch('/api/admin/categories', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    if (!r.ok) { const d = await r.json(); return toast.error(d.error||'Failed') }
    toast.success('Saved'); setForm(null); load()
  }
  const del = async (id) => { if(!confirm('Delete category?')) return; await fetch(`/api/admin/categories/${id}`, { method:'DELETE'}); load() }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="font-serif text-2xl">Categories</h1><p className="text-sm text-muted-foreground">{items.length} total</p></div>
        <button onClick={()=>setForm({ name:'', slug:'', parent_id:null, image_url:'', banner_url:'', description:'', is_featured:false, sort_order:0 })} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest" data-testid="admin-cat-new-btn"><Plus className="h-4 w-4"/> New</button>
      </div>
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3"></th><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Featured</th><th className="p-3">Sort</th><th className="p-3"></th></tr></thead>
          <tbody className="divide-y divide-border">
            {items.map(c=>(
              <tr key={c.id}>
                <td className="p-2">{c.image_url ? <img src={c.image_url} alt="" className="w-10 h-10 object-cover"/> : <div className="w-10 h-10 bg-muted"/>}</td>
                <td className="p-3">
                  <div className="font-medium">{c.name}</div>
                  {c.description && <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{c.description}</div>}
                </td>
                <td className="p-3 text-muted-foreground">/{c.slug}</td>
                <td className="p-3">{c.is_featured ? <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-800">Yes</span> : <span className="text-muted-foreground">—</span>}</td>
                <td className="p-3">{c.sort_order}</td>
                <td className="p-3 text-right"><button onClick={()=>setForm({ ...c })} className="text-primary p-2 hover:bg-muted mr-1" data-testid={`admin-cat-edit-${c.id}`}>Edit</button><button onClick={()=>del(c.id)} className="text-destructive p-2 hover:bg-muted" data-testid={`admin-cat-del-${c.id}`}><Trash2 className="h-4 w-4"/></button></td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No categories</td></tr>}
          </tbody>
        </table>
      </div>
      {form && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4 overflow-y-auto">
          <div className="bg-background w-full max-w-lg border border-border p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><h2 className="font-serif text-xl">{form.id ? 'Edit Category':'New Category'}</h2><button onClick={()=>setForm(null)}><X className="h-5 w-5"/></button></div>
            <div className="space-y-3">
              <F label="Name"><input placeholder="e.g. Kolhapuri Saj" value={form.name} onChange={e=>setForm({...form,name:e.target.value, slug: form.id?form.slug:e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')})} className="w-full h-10 px-3 border border-border" data-testid="admin-cat-name"/></F>
              <F label="Slug"><input placeholder="kolhapuri-saj" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} className="w-full h-10 px-3 border border-border" data-testid="admin-cat-slug"/></F>
              <F label="Short description (helps SEO — 1–3 sentences about this style)">
                <textarea rows={3} value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Kolhapuri Saj is a traditional Maharashtrian necklace…" className="w-full px-3 py-2 border border-border" data-testid="admin-cat-desc"/>
              </F>
              <F label="Thumbnail image (used in navigation & grids)">
                <div className="flex items-center gap-3">
                  {form.image_url ? <img src={form.image_url} alt="" className="h-16 w-16 object-cover border border-border"/> : <div className="h-16 w-16 border border-dashed border-border"/>}
                  <input placeholder="Paste URL" value={form.image_url||''} onChange={e=>setForm({...form,image_url:e.target.value})} className="flex-1 h-10 px-3 border border-border" data-testid="admin-cat-image"/>
                  <label className="inline-flex items-center gap-1 h-10 px-3 border border-border cursor-pointer text-xs uppercase tracking-widest"><Upload className="h-4 w-4"/><input type="file" accept="image/*" hidden onChange={async e => { const f = e.target.files?.[0]; if (!f) return; const url = await upload(f); if (url) setForm({...form, image_url: url}) }}/></label>
                </div>
              </F>
              <F label="Banner/hero image (shown at top of category page)">
                <div className="flex items-center gap-3">
                  {form.banner_url ? <img src={form.banner_url} alt="" className="h-16 w-32 object-cover border border-border"/> : <div className="h-16 w-32 border border-dashed border-border"/>}
                  <input placeholder="Paste URL" value={form.banner_url||''} onChange={e=>setForm({...form,banner_url:e.target.value})} className="flex-1 h-10 px-3 border border-border" data-testid="admin-cat-banner"/>
                  <label className="inline-flex items-center gap-1 h-10 px-3 border border-border cursor-pointer text-xs uppercase tracking-widest"><Upload className="h-4 w-4"/><input type="file" accept="image/*" hidden onChange={async e => { const f = e.target.files?.[0]; if (!f) return; const url = await upload(f); if (url) setForm({...form, banner_url: url}) }}/></label>
                </div>
              </F>
              <div className="flex items-center gap-4">
                <F label="Sort order"><input type="number" value={form.sort_order||0} onChange={e=>setForm({...form,sort_order:Number(e.target.value)})} className="w-24 h-10 px-3 border border-border" data-testid="admin-cat-sort"/></F>
                <label className="inline-flex items-center gap-2 text-sm mt-6"><input type="checkbox" checked={!!form.is_featured} onChange={e=>setForm({...form,is_featured:e.target.checked})} data-testid="admin-cat-featured"/> Featured (prioritize in nav & homepage)</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5"><button onClick={()=>setForm(null)} className="h-10 px-4 border border-border text-xs uppercase tracking-widest">Cancel</button><button onClick={save} className="h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest" data-testid="admin-cat-save-btn">Save</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

function F({ label, children }) { return <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label> }
