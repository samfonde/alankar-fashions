export const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0))
export const dateFmt = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
export function orderNumber() {
  const s = Math.random().toString(36).slice(2, 8).toUpperCase()
  const t = Date.now().toString(36).slice(-5).toUpperCase()
  return `AUR-${t}-${s}`
}
