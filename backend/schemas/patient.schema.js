const { z } = require('zod')

const patientSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be at most 100 characters' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Name must contain only letters and spaces' }),
  age: z.number().int().min(10).max(60).optional(),
  village: z.string().max(200).optional(),
  gestational_week: z.number().int().min(0).max(45).optional(),
  assigned_worker: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
})

const vitalsSchema = z.object({
  bp_systolic: z.number().int().min(60).max(250),
  bp_diastolic: z.number().int().min(30).max(150),
  weight_kg: z.number().min(20).max(200).optional(),
  temperature_c: z.number().min(34).max(42).optional(),
  pulse: z.number().int().min(30).max(200).optional(),
  symptoms: z.array(z.string()).default([]),
  notes: z.string().max(1000).optional(),
})

const syncPayloadSchema = z.object({
  type: z.enum(['vitals', 'profile']),
  patient_id: z.string().uuid(),
  data: z.record(z.unknown()),
  local_timestamp: z.string().datetime().optional(),
})

const syncBatchSchema = z.object({
  items: z.array(syncPayloadSchema).min(1).max(100),
})

module.exports = { patientSchema, vitalsSchema, syncPayloadSchema, syncBatchSchema }
