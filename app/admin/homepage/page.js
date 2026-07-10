'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Save, Upload, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

export default function AdminHomepage(){
  const [sections,setSections] = useState([])
  const [loading,setLoading] = useState(true)
  const load = () => fetch('/api/admin/homepage').then(r=>r.json()).then(d=>{setSections(d.sections||[]); setLoading(false)})
  useEffect(() => { load() }, [])
  const update = (id, patch) => setSections(sections.map(s => s.id===id ? { ...s, ...patch }:s))
  const save = async (s) => { const r = await fetch(`/api/admin/homepage/${s.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title: s.title, data: s.data, is_active: s.is_active, sort_order: s.sort_order }) }); if(!r.ok){const d=await r.json();return toast.error(d.error||'Failed')} toast.success('Saved') }

  const uploadImg = async (file) => { const b64 = await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.readAsDataURL(file)}); const r = await fetch('/api/admin/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({file:b64,filename:file.name,contentType:file.type})}); const d = await r.json(); if (!r.ok) { toast.error(d.error||'Upload failed'); return null } return d.url }

  if (loading) return <div className="skeleton h-32"/>
  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-2xl">Homepage</h1><p className="text-sm text-muted-foreground">Manage banners, sections and promotional content.</p></div>
      {sections.map(s => (
        <div key={s.id} className="bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.section_type}</div>
              <div className="font-serif text-lg">{s.title}</div>
            </div>
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={s.is_active} onChange={e=>update(s.id,{is_active:e.target.checked})}/> Active</label>
              <button onClick={()=>save(s)} className="inline-flex items-center gap-2 h-9 px-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest"><Save className="h-4 w-4"/> Save</button>
            </div>
          </div>

          {s.section_type === 'announcement' && (
            <input value={s.data?.text||''} onChange={e=>update(s.id,{data:{...s.data,text:e.target.value}})} placeholder="Announcement bar text" className="w-full h-10 px-3 border border-border"/>
          )}

          {s.section_type === 'hero' && (
            <div className="space-y-3">
              {(s.data?.slides||[]).map((sl,i)=>(
                <div key={i} className="border border-border p-3 space-y-2">
                  <div className="flex gap-3">
                    <img src={sl.image} className="w-24 h-16 object-cover bg-muted"/>
                    <div className="flex-1 grid md:grid-cols-2 gap-2">
                      <input value={sl.heading||''} onChange={e=>{const slides=[...s.data.slides];slides[i]={...sl,heading:e.target.value};update(s.id,{data:{...s.data,slides}})}} placeholder="Heading" className="h-9 px-3 border border-border"/>
                      <input value={sl.subheading||''} onChange={e=>{const slides=[...s.data.slides];slides[i]={...sl,subheading:e.target.value};update(s.id,{data:{...s.data,slides}})}} placeholder="Subheading" className="h-9 px-3 border border-border"/>
                      <input value={sl.image||''} onChange={e=>{const slides=[...s.data.slides];slides[i]={...sl,image:e.target.value};update(s.id,{data:{...s.data,slides}})}} placeholder="Image URL" className="h-9 px-3 border border-border md:col-span-2"/>
                      <input value={sl.cta_label||''} onChange={e=>{const slides=[...s.data.slides];slides[i]={...sl,cta_label:e.target.value};update(s.id,{data:{...s.data,slides}})}} placeholder="CTA Label" className="h-9 px-3 border border-border"/>
                      <input value={sl.cta_link||''} onChange={e=>{const slides=[...s.data.slides];slides[i]={...sl,cta_link:e.target.value};update(s.id,{data:{...s.data,slides}})}} placeholder="CTA Link" className="h-9 px-3 border border-border"/>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="inline-flex items-center justify-center h-8 w-8 border border-border cursor-pointer"><Upload className="h-4 w-4"/><input type="file" accept="image/*" hidden onChange={async e=>{const f=e.target.files?.[0];if(!f)return;const url=await uploadImg(f);if(url){const slides=[...s.data.slides];slides[i]={...sl,image:url};update(s.id,{data:{...s.data,slides}})}}}/></label>
                      <button onClick={()=>{const slides=(s.data.slides||[]).filter((_,j)=>j!==i);update(s.id,{data:{...s.data,slides}})}} className="h-8 w-8 border border-border text-destructive"><Trash2 className="h-4 w-4 mx-auto"/></button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={()=>update(s.id,{data:{...s.data, slides:[...(s.data.slides||[]),{heading:'New slide',subheading:'',image:'https://images.unsplash.com/photo-1596993100471-c3905dafa78e?q=85&w=2000',cta_label:'Shop',cta_link:'/products'}]}})} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border border-border px-3 py-2"><Plus className="h-4 w-4"/> Add slide</button>
            </div>
          )}

          {s.section_type === 'categories' && (
            <div className="space-y-3">
              {(s.data?.items||[]).map((it,i)=>(
                <div key={i} className="flex gap-3 items-center border border-border p-2">
                  <img src={it.image} className="w-16 h-20 object-cover bg-muted"/>
                  <div className="flex-1 grid md:grid-cols-3 gap-2">
                    <input value={it.title||''} onChange={e=>{const items=[...s.data.items];items[i]={...it,title:e.target.value};update(s.id,{data:{...s.data,items}})}} placeholder="Title" className="h-9 px-3 border border-border"/>
                    <input value={it.image||''} onChange={e=>{const items=[...s.data.items];items[i]={...it,image:e.target.value};update(s.id,{data:{...s.data,items}})}} placeholder="Image URL" className="h-9 px-3 border border-border"/>
                    <input value={it.link||''} onChange={e=>{const items=[...s.data.items];items[i]={...it,link:e.target.value};update(s.id,{data:{...s.data,items}})}} placeholder="Link" className="h-9 px-3 border border-border"/>
                  </div>
                  <button onClick={()=>{const items=(s.data.items||[]).filter((_,j)=>j!==i);update(s.id,{data:{...s.data,items}})}} className="h-8 w-8 border border-border text-destructive"><Trash2 className="h-4 w-4 mx-auto"/></button>
                </div>
              ))}
              <button onClick={()=>update(s.id,{data:{...s.data, items:[...(s.data.items||[]),{title:'New',image:'',link:'/products'}]}})} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border border-border px-3 py-2"><Plus className="h-4 w-4"/> Add category</button>
            </div>
          )}

          {s.section_type === 'products' && (
            <div className="grid md:grid-cols-3 gap-3">
              <div><span className="text-xs text-muted-foreground">Section title</span><input value={s.title||''} onChange={e=>update(s.id,{title:e.target.value})} className="mt-1 w-full h-10 px-3 border border-border"/></div>
              <div><span className="text-xs text-muted-foreground">Filter</span><select value={s.data?.filter||'is_featured'} onChange={e=>update(s.id,{data:{...s.data,filter:e.target.value}})} className="mt-1 w-full h-10 px-3 border border-border"><option value="is_featured">Featured</option><option value="is_new">New Arrivals</option><option value="is_trending">Trending</option></select></div>
              <div><span className="text-xs text-muted-foreground">Limit</span><input type="number" value={s.data?.limit||8} onChange={e=>update(s.id,{data:{...s.data,limit:Number(e.target.value)}})} className="mt-1 w-full h-10 px-3 border border-border"/></div>
            </div>
          )}

          {s.section_type === 'editorial' && (
            <div className="grid md:grid-cols-2 gap-3">
              <input value={s.data?.heading||''} onChange={e=>update(s.id,{data:{...s.data,heading:e.target.value}})} placeholder="Heading" className="h-10 px-3 border border-border"/>
              <input value={s.data?.subheading||''} onChange={e=>update(s.id,{data:{...s.data,subheading:e.target.value}})} placeholder="Subheading" className="h-10 px-3 border border-border"/>
              <input value={s.data?.image||''} onChange={e=>update(s.id,{data:{...s.data,image:e.target.value}})} placeholder="Image URL" className="h-10 px-3 border border-border md:col-span-2"/>
              <input value={s.data?.cta_label||''} onChange={e=>update(s.id,{data:{...s.data,cta_label:e.target.value}})} placeholder="CTA Label" className="h-10 px-3 border border-border"/>
              <input value={s.data?.cta_link||''} onChange={e=>update(s.id,{data:{...s.data,cta_link:e.target.value}})} placeholder="CTA Link" className="h-10 px-3 border border-border"/>
            </div>
          )}

          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Sort order</span>
            <input type="number" value={s.sort_order||0} onChange={e=>update(s.id,{sort_order:Number(e.target.value)})} className="h-8 w-20 px-2 border border-border"/>
          </div>
        </div>
      ))}
    </div>
  )
}
