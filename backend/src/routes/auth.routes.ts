import { Hono } from 'hono'
import { getDb } from '../db/database'
import * as schema from '../db/schema'
import { eq } from 'drizzle-orm'
import { SignJWT, jwtVerify } from 'jose'

export const authRoutes = new Hono()

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'medisense_ultra_secure_jwt_secret_key_2026_demo')

export async function createToken(payload: { id: number; email: string; role: string; name: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET)
  return payload
}

// Login via Email & Password
authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  const { db } = await getDb()

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1)
  if (!user) {
    return c.json({ error: 'User not found with this email' }, 401)
  }

  // In demo mode, accept any password or 'demo123'
  const token = await createToken({ id: user.id, email: user.email, role: user.role, name: user.name })

  // Find linked profile
  let patientProfile = null
  let doctorProfile = null
  let insuranceProfile = null

  if (user.role === 'patient') {
    const [p] = await db.select().from(schema.patients).where(eq(schema.patients.userId, user.id)).limit(1)
    patientProfile = p
  } else if (user.role === 'doctor') {
    const [d] = await db.select().from(schema.doctors).where(eq(schema.doctors.userId, user.id)).limit(1)
    doctorProfile = d
  } else if (user.role === 'insurance') {
    const [i] = await db.select().from(schema.insuranceCompanies).where(eq(schema.insuranceCompanies.userId, user.id)).limit(1)
    insuranceProfile = i
  }

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl
    },
    patientProfile,
    doctorProfile,
    insuranceProfile
  })
})

// Send OTP to phone/email
authRoutes.post('/send-otp', async (c) => {
  const { phone, email } = await c.req.json()
  const { db } = await getDb()

  // Generate 6-digit OTP
  const demoOtp = '882910'
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  // Update or record user
  return c.json({
    success: true,
    message: `OTP sent successfully to ${phone || email}`,
    demoOtp: demoOtp // For frictionless investor demo testing
  })
})

// Verify OTP Login
authRoutes.post('/verify-otp', async (c) => {
  const { phone, email, otp } = await c.req.json()
  const { db } = await getDb()

  if (otp !== '882910' && otp !== '123456') {
    return c.json({ error: 'Invalid or expired OTP code' }, 400)
  }

  // Find user by phone or email
  let usersList = []
  if (email) {
    usersList = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1)
  } else if (phone) {
    usersList = await db.select().from(schema.users).where(eq(schema.users.phone, phone)).limit(1)
  }

  const user = usersList[0] || (await db.select().from(schema.users).where(eq(schema.users.email, 'rahul@medisense.ai')))[0]

  const token = await createToken({ id: user.id, email: user.email, role: user.role, name: user.name })

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl
    }
  })
})

// Quick Persona Switcher for Investor Demonstrations
authRoutes.get('/demo-personas', async (c) => {
  const { db } = await getDb()
  const allUsers = await db.select().from(schema.users)
  const allPatients = await db.select().from(schema.patients)
  const allDoctors = await db.select().from(schema.doctors)
  const allInsurers = await db.select().from(schema.insuranceCompanies)

  return c.json({
    users: allUsers,
    patients: allPatients,
    doctors: allDoctors,
    insurers: allInsurers
  })
})

// Instant Switch to Persona
authRoutes.post('/switch-persona', async (c) => {
  const { email } = await c.req.json()
  const { db } = await getDb()

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1)
  if (!user) return c.json({ error: 'Persona not found' }, 404)

  const token = await createToken({ id: user.id, email: user.email, role: user.role, name: user.name })

  let patientProfile = null
  let doctorProfile = null
  let insuranceProfile = null

  if (user.role === 'patient') {
    const [p] = await db.select().from(schema.patients).where(eq(schema.patients.userId, user.id)).limit(1)
    patientProfile = p
  } else if (user.role === 'doctor') {
    const [d] = await db.select().from(schema.doctors).where(eq(schema.doctors.userId, user.id)).limit(1)
    doctorProfile = d
  } else if (user.role === 'insurance') {
    const [i] = await db.select().from(schema.insuranceCompanies).where(eq(schema.insuranceCompanies.userId, user.id)).limit(1)
    insuranceProfile = i
  }

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl
    },
    patientProfile,
    doctorProfile,
    insuranceProfile
  })
})
