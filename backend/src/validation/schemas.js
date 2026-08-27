import { z } from 'zod';

const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM 24h format');
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format');

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(80),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Include at least one letter')
    .regex(/[0-9]/, 'Include at least one number'),
  role: z.enum(['student', 'staff']).default('student'),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const createRideSchema = z.object({
  origin: z.string().min(2).max(120),
  destination: z.string().min(2).max(120),
  date: dateString,
  timeStart: timeString,
  timeEnd: timeString,
  seatsTotal: z.number().int().min(1).max(7),
  notes: z.string().max(500).optional().default(''),
}).refine((d) => d.timeEnd > d.timeStart, {
  message: 'End time must be after start time',
  path: ['timeEnd'],
});

export const searchRideSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  date: dateString.optional(),
  timeStart: timeString.optional(),
  timeEnd: timeString.optional(),
});

export const rideRequestSchema = z.object({
  rideId: z.string().min(1),
  message: z.string().max(300).optional().default(''),
});

export const requestDecisionSchema = z.object({
  decision: z.enum(['accepted', 'rejected']),
});

export const messageSchema = z.object({
  rideId: z.string().min(1),
  toUserId: z.string().min(1),
  body: z.string().min(1, 'Message cannot be empty').max(1000),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().max(20).optional(),
  homeArea: z.string().max(120).optional(),
});
