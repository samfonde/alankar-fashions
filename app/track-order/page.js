'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Package, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function TrackOrderPage() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleTrackOrder(e) {
    e.preventDefault()
    if (!orderNumber.trim() || !email.trim()) {
      toast.error('Please enter both order number and email')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/status?order_number=${encodeURIComponent(orderNumber.trim())}&email=${encodeURIComponent(email.trim())}`)
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Order not found. Please check your details.')
        setLoading(false)
        return
      }
      // If order found, redirect to order details or show inline
      toast.success('Order found! Redirecting...')
      setTimeout(() => {
        router.push(`/orders/${data.order?.id || orderNumber}`)
      }, 500)
    } catch (err) {
      toast.error('Failed to track order. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <SiteHeader/>
      <main className="container-tight py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Package className="h-12 w-12 mx-auto text-primary mb-4"/>
            <h1 className="font-serif text-4xl md:text-5xl mb-3">Track Your Order</h1>
            <p className="text-muted-foreground">Enter your order number and email to view order status and tracking details.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
              <CardDescription>For registered users, visit your <Link href="/account" className="text-primary underline">Account Dashboard</Link> to view all orders.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div>
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input 
                    id="orderNumber" 
                    type="text" 
                    placeholder="e.g., ALK-20250115-1234" 
                    value={orderNumber} 
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2"/>Tracking...</> : 'Track Order'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 p-6 bg-muted/30 rounded-lg space-y-3">
            <h3 className="font-semibold text-foreground">Need Help?</h3>
            <p className="text-sm text-muted-foreground">If you're unable to track your order or have any questions, please contact us:</p>
            <div className="text-sm space-y-1">
              <p>Phone: <a href="tel:+919657093006" className="text-primary underline">+91 9657093006</a></p>
              <p>Email: <a href="mailto:hello@alankarfashions.com" className="text-primary underline">hello@alankarfashions.com</a></p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter/>
    </>
  )
}
