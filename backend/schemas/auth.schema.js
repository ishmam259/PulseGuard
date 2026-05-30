const { z } = require('zod')

const registerSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be at most 100 characters' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Name must contain only letters and spaces' }),
  email: z.string().email().optional(),
  phone: z.string()
    .regex(/^\d{11}$/, { message: 'Phone number must be exactly 11 digits' })
    .optional()
    .or(z.literal(''))
    .or(z.null()),
  password: z.string().min(6).max(128),
  role: z.enum(['patient', 'worker', 'admin']),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
})

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(1),
  role: z.enum(['patient', 'worker', 'admin']).optional(),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
})

const profileUpdateSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be at most 100 characters' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Name must contain only letters and spaces' }),
  email: z.string().email().optional().or(z.literal('')).or(z.null()),
  phone: z.string()
    .regex(/^\d{11}$/, { message: 'Phone number must be exactly 11 digits' })
    .optional()
    .or(z.literal(''))
    .or(z.null()),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
})

module.exports = { registerSchema, loginSchema, profileUpdateSchema }
