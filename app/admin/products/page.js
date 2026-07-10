'use client'
import { useEffect, useState } from 'react'
import { inr } from '@/lib/format'
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react'
import { toast } from 'sonner'

const emptyP = { name:'', slug:'', description:'', price:0, discount_price:null, sku:'', images:[], category_id:null, stock:0, status:'published', is_featured:false, is_new:false, is_trending:false, brand:'Aurelia', sizes:[], colors:[], tags:[] }

export default function AdminProducts(){
  const [items,setItems] = useState([])
  const [cats,setCats] = useState([])
  const [edit,setEdit] = useState(null)
  const [q,setQ] = useState('')
  const load = () => { fetch('/api/admin/products').then(r=>r.json()).then(d=>setItems(d.products||[])); fetch('/api/categories').then(r=>r.json()).then(d=>setCats(d.categories||[])) }
  useEffect(load,[])
  const save = async () => {
    if (!edit.name || !edit.slug || edit.price <= 0) return toast.error('Name, slug and price are required')
    const payload = { ...edit, price: Number(edit.price), discount_price: edit.discount_price ? Number(edit.discount_price):null, stock: Number(edit.stock||0), sizes: Array.isArray(edit.sizes)?edit.sizes:String(edit.sizes||'').split(',').map(s=>s.trim()).filter(Boolean), colors: Array.isArray(edit.colors)?edit.colors:String(edit.colors||'').split(',').map(s=>s.trim()).filter(Boolean), tags: Array.isArray(edit.tags)?edit.tags:String(edit.tags||'').split(',').map(s=>s.trim()).filter(Boolean) }
    const url = edit.id ? `/api/admin/products/${edit.id}` : '/api/admin/products'
    const method = edit.id ? 'PATCH' : 'POST'
    const r = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    const d = await r.json()
    if (!r.ok) return toast.error(d.error||'Failed')
    toast.success(edit.id ? 'Updated' : 'Created'); setEdit(null); load()
  }
  const del = async (p) => { if (!confirm(`Delete ${p.name}?`)) return; await fetch(`/api/admin/products/${p.id}`, { method:'DELETE' }); toast.success('Deleted'); load() }

  const uploadImg = async (file) => {
    const b64 = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(file) })
    const r = await fetch('/api/admin/upload', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ file: b64, filename: file.name, contentType: file.type }) })
    const d = await r.json()
    if (!r.ok) { toast.error(d.error||'Upload failed'); return null }
    return d.url
  }

  const filtered = items.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div><h1 className="font-serif text-2xl">Products</h1><p className="text-sm text-muted-foreground">{items.length} total</p></div>
        <div className="flex gap-2">
          <input placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} className="h-10 px-3 border border-border bg-background text-sm"/>
          <button onClick={()=>setEdit({...emptyP})} className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-xs uppercase tracking-widest"><Plus className="h-4 w-4"/> New Product</button>
        </div>
      </div>
      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3"></th><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(p => (
              <tr key={p.id}>
                <td className="p-2"><img src={p.images?.[0]} alt="" className="w-12 h-14 object-cover"/></td>
                <td className="p-3"><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.sku}</div></td>
                <td className="p-3 text-muted-foreground">{p.categories?.name || '—'}</td>
                <td className="p-3">{inr(p.discount_price || p.price)}</td>
                <td className="p-3"><span className={p.stock<=5?'text-destructive':''}>{p.stock}</span></td>
                <td className="p-3"><span className={`text-xs px-2 py-1 uppercase tracking-widest ${p.status==='published'?'bg-emerald-50 text-emerald-800':'bg-muted text-muted-foreground'}`}>{p.status}</span></td>
                <td className="p-3 text-right"><button onClick={()=>setEdit({ ...p, sizes: p.sizes||[], colors: p.colors||[], tags: p.tags||[] })} className="p-2 hover:bg-muted"><Pencil className="h-4 w-4"/></button><button onClick={()=>del(p)} className="p-2 hover:bg-muted text-destructive"><Trash2 className="h-4 w-4"/></button></td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No products</td></tr>}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4 overflow-y-auto">
          <div className="bg-background w-full max-w-3xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background"><h2 className="font-serif text-xl">{edit.id ? 'Edit Product':'New Product'}</h2><button onClick={()=>setEdit(null)}><X className="h-5 w-5"/></button></div>
            <div className="p-5 grid md:grid-cols-2 gap-4">
              <F label="Name"><input value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value, slug: edit.id?edit.slug:e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')})} className="w-full h-10 px-3 border border-border bg-background"/></F>
              <F label="Slug"><input value={edit.slug} onChange={e=>setEdit({...edit,slug:e.target.value})} className="w-full h-10 px-3 border border-border bg-background"/></F>
              <F label="Price (₹)"><input type="number" value={edit.price} onChange={e=>setEdit({...edit,price:e.target.value})} className="w-full h-10 px-3 border border-border bg-background"/></F>
              <F label="Discount price (₹)"><input type="number" value={edit.discount_price||''} onChange={e=>setEdit({...edit,discount_price:e.target.value})} className="w-full h-10 px-3 border border-border bg-background"/></F>
              <F label="SKU"><input value={edit.sku||''} onChange={e=>setEdit({...edit,sku:e.target.value})} className="w-full h-10 px-3 border border-border bg-background"/></F>
              <F label="Stock"><input type="number" value={edit.stock} onChange={e=>setEdit({...edit,stock:e.target.value})} className="w-full h-10 px-3 border border-border bg-background"/></F>
              <F label="Category"><select value={edit.category_id||''} onChange={e=>setEdit({...edit,category_id:e.target.value||null})} className="w-full h-10 px-3 border border-border bg-background"><option value="">— None —</option>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></F>
              <F label="Status"><select value={edit.status} onChange={e=>setEdit({...edit,status:e.target.value})} className="w-full h-10 px-3 border border-border bg-background"><option>draft</option><option>published</option><option>archived</option></select></F>
              <F label="Brand"><input value={edit.brand||''} onChange={e=>setEdit({...edit,brand:e.target.value})} className="w-full h-10 px-3 border border-border bg-background"/></F>
              <F label="Sizes (comma separated)"><input value={Array.isArray(edit.sizes)?edit.sizes.join(','):edit.sizes||''} onChange={e=>setEdit({...edit,sizes:e.target.value})} className="w-full h-10 px-3 border border-border bg-background"/></F>
              <F label="Colors (comma separated)"><input value={Array.isArray(edit.colors)?edit.colors.join(','):edit.colors||''} onChange={e=>setEdit({...edit,colors:e.target.value})} className="w-full h-10 px-3 border border-border bg-background"/></F>
              <F label="Tags"><input value={Array.isArray(edit.tags)?edit.tags.join(','):edit.tags||''} onChange={e=>setEdit({...edit,tags:e.target.value})} className="w-full h-10 px-3 border border-border bg-background"/></F>
              <div className="md:col-span-2"><F label="Description"><textarea rows={4} value={edit.description||''} onChange={e=>setEdit({...edit,description:e.target.value})} className="w-full px-3 py-2 border border-border bg-background"/></F></div>
              <div className="md:col-span-2">
                <F label="Images">
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {(edit.images||[]).map((im,i)=>(<div key={i} className="relative aspect-square"><img src={im} className="w-full h-full object-cover"/><button onClick={()=>setEdit({...edit,images: edit.images.filter((_,j)=>j!==i)})} className="absolute top-1 right-1 bg-background rounded-full p-0.5"><X className="h-3 w-3"/></button></div>))}
                  </div>
                  <div className="flex gap-2">
                    <input placeholder="Paste image URL and press Enter" onKeyDown={e => { if (e.key==='Enter' && e.target.value) { setEdit({...edit, images:[...(edit.images||[]), e.target.value]}); e.target.value='' } }} className="flex-1 h-10 px-3 border border-border bg-background text-sm"/>
                    <label className="inline-flex items-center gap-2 h-10 px-4 border border-border cursor-pointer text-xs uppercase tracking-widest"><Upload className="h-4 w-4"/> Upload<input type="file" accept="image/*" hidden onChange={async e => { const f = e.target.files?.[0]; if (!f) return; const url = await uploadImg(f); if (url) setEdit({...edit, images:[...(edit.images||[]), url]}) }}/></label>
                  </div>
                </F>
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-4">
                {[['is_featured','Featured'],['is_new','New Arrival'],['is_trending','Trending']].map(([k,l])=>(
                  <label key={k} className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={!!edit[k]} onChange={e=>setEdit({...edit,[k]:e.target.checked})}/> {l}</label>
                ))}
              </div>
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
