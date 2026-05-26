const { z } = require('zod')

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().min(8).max(20).optional(),
  password: z.string().min(6).max(128),
  role: z.enum(['patient', 'worker', 'admin']),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
})

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(1),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
})

module.exports = { registerSchema, loginSchema }
