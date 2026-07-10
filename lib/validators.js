import { z } from 'zod'

export const authSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(6).max(200),
  fullName: z.string().min(1).max(120).optional(),
})

export const addressSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(6).max(20),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional().nullable(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().min(4).max(10),
  country: z.string().max(60).optional(),
})

export const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().optional().nullable(),
  size: z.string().max(30).optional().nullable(),
  color: z.string().max(40).optional().nullable(),
  quantity: z.number().int().min(1).max(20),
})

export const checkoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(6).max(20),
  address: addressSchema,
  items: z.array(cartItemSchema).min(1).max(50),
  coupon: z.string().max(40).optional().nullable(),
})

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  price: z.coerce.number().min(0),
  discount_price: z.coerce.number().min(0).optional().nullable(),
  sku: z.string().max(80).optional().nullable(),
  images: z.array(z.string().url()).default([]),
  category_id: z.string().uuid().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  status: z.enum(['draft','published','archived']).default('published'),
  is_featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_trending: z.boolean().default(false),
  brand: z.string().max(80).optional().nullable(),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
})

export const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional().nullable(),
  body: z.string().max(2000).optional().nullable(),
})
