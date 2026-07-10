import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const BRAND = process.env.BRAND_NAME || 'Aurelia'

export async function sendOrderConfirmation({ to, order }) {
  if (!resend || !to) return { skipped: true }
  const itemsHtml = (order.items || []).map((i) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eee">${escapeHtml(i.name)} ${i.size ? `<span style='color:#888'>· ${escapeHtml(i.size)}</span>`:''} ${i.color ? `<span style='color:#888'>· ${escapeHtml(i.color)}</span>`:''}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:right">₹${Number(i.subtotal).toLocaleString('en-IN')}</td>
    </tr>`).join('')
  const html = `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#faf7f2;padding:40px 0;color:#1c1917">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06)">
      <div style="padding:32px;background:#1c1917;color:#fff"><h1 style="margin:0;font-family:Georgia,serif;letter-spacing:2px">${BRAND}</h1></div>
      <div style="padding:32px">
        <h2 style="margin:0 0 8px;font-family:Georgia,serif">Thank you for your order</h2>
        <p style="color:#57534e;margin:0 0 20px">Order <strong>${order.order_number}</strong> · Placed ${new Date(order.created_at || Date.now()).toLocaleDateString('en-IN')}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <thead><tr style="text-align:left;color:#78716c;font-size:12px;text-transform:uppercase;letter-spacing:1px">
            <th style="padding:12px;border-bottom:1px solid #eee">Item</th>
            <th style="padding:12px;border-bottom:1px solid #eee;text-align:center">Qty</th>
            <th style="padding:12px;border-bottom:1px solid #eee;text-align:right">Amount</th>
          </tr></thead><tbody>${itemsHtml}</tbody>
        </table>
        <table style="width:100%;margin-top:16px">
          <tr><td style="padding:4px 12px;color:#57534e">Subtotal</td><td style="padding:4px 12px;text-align:right">₹${Number(order.subtotal).toLocaleString('en-IN')}</td></tr>
          ${order.discount>0?`<tr><td style="padding:4px 12px;color:#57534e">Discount</td><td style="padding:4px 12px;text-align:right;color:#059669">− ₹${Number(order.discount).toLocaleString('en-IN')}</td></tr>`:''}
          <tr><td style="padding:4px 12px;color:#57534e">Shipping</td><td style="padding:4px 12px;text-align:right">${order.shipping>0?'₹'+Number(order.shipping).toLocaleString('en-IN'):'Free'}</td></tr>
          <tr><td style="padding:12px;font-weight:700;border-top:1px solid #eee">Total</td><td style="padding:12px;text-align:right;font-weight:700;border-top:1px solid #eee">₹${Number(order.total).toLocaleString('en-IN')}</td></tr>
        </table>
        <div style="margin-top:24px;padding:16px;background:#faf7f2;border-radius:8px">
          <p style="margin:0 0 4px;font-weight:600">Shipping to</p>
          <p style="margin:0;color:#57534e;font-size:14px;line-height:1.6">${escapeHtml(order.shipping_address?.name||'')}<br>${escapeHtml(order.shipping_address?.line1||'')}${order.shipping_address?.line2?', '+escapeHtml(order.shipping_address.line2):''}<br>${escapeHtml(order.shipping_address?.city||'')}, ${escapeHtml(order.shipping_address?.state||'')} ${escapeHtml(order.shipping_address?.pincode||'')}<br>${escapeHtml(order.shipping_address?.phone||'')}</p>
        </div>
        <p style="margin-top:24px;color:#57534e;font-size:13px">We'll email you a tracking link when your order ships. Questions? Reply to this email.</p>
      </div>
      <div style="padding:20px;text-align:center;color:#a8a29e;font-size:12px">© ${new Date().getFullYear()} ${BRAND}</div>
    </div></body></html>`
  try {
    const r = await resend.emails.send({ from: `${BRAND} <${FROM}>`, to, subject: `Your ${BRAND} order ${order.order_number}`, html })
    return { ok: true, id: r?.data?.id }
  } catch (e) { console.error('email send failed', e); return { ok: false, error: e.message } }
}

export async function sendStatusUpdate({ to, order, status }) {
  if (!resend || !to) return { skipped: true }
  const label = { processing:'is being prepared', shipped:'has shipped', out_for_delivery:'is out for delivery', delivered:'has been delivered', cancelled:'has been cancelled', refunded:'has been refunded' }[status] || 'has been updated'
  const html = `<div style="font-family:-apple-system,sans-serif;max-width:520px;margin:24px auto;padding:24px;background:#fff;border-radius:12px">
    <h2 style="font-family:Georgia,serif">${BRAND}</h2>
    <p>Your order <strong>${order.order_number}</strong> ${label}.</p>
    <p style="color:#57534e;font-size:13px">Total: ₹${Number(order.total).toLocaleString('en-IN')}</p>
  </div>`
  try { await resend.emails.send({ from: `${BRAND} <${FROM}>`, to, subject: `Order ${order.order_number} update`, html }); return { ok: true } }
  catch(e){ return { ok:false, error:e.message } }
}

export async function sendLowStockAlert({ product }) {
  if (!resend) return { skipped:true }
  const to = process.env.ADMIN_LOW_STOCK_EMAIL
  if (!to) return { skipped:true }
  try { await resend.emails.send({ from:`${BRAND} <${FROM}>`, to, subject:`Low stock: ${product.name}`, html:`<p>Product <strong>${escapeHtml(product.name)}</strong> is low on stock (${product.stock} left).</p>` }); return { ok:true } } catch(e){ return { ok:false } }
}

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])) }
