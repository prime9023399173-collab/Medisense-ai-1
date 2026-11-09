import { Hono } from 'hono'
import { getDb } from '../db/database'
import * as schema from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { computePatientRiskMetrics } from '../services/risk-engine'

export const patientRoutes = new Hono()

// Get all patients (for directory / switchers)
patientRoutes.get('/', async (c) => {
  const { db } = await getDb()
  const patientsList = await db.select({
    patient: schema.patients,
    user: schema.users
  })
  .from(schema.patients)
  .innerJoin(schema.users, eq(schema.patients.userId, schema.users.id))

  return c.json(patientsList.map(p => ({
    ...p.patient,
    name: p.user.name,
    email: p.user.email,
    phone: p.user.phone,
    avatarUrl: p.user.avatarUrl
  })))
})

// Get patient details by ID
patientRoutes.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const { db } = await getDb()

  const [patientData] = await db.select({
    patient: schema.patients,
    user: schema.users
  })
  .from(schema.patients)
  .innerJoin(schema.users, eq(schema.patients.userId, schema.users.id))
  .where(eq(schema.patients.id, id))
  .limit(1)

  if (!patientData) return c.json({ error: 'Patient not found' }, 404)

  // Fetch recent vitals
  const vitals = await db.select().from(schema.vitalsLogs).where(eq(schema.vitalsLogs.patientId, id)).orderBy(desc(schema.vitalsLogs.recordedAt)).limit(10)

  // Fetch active medicines
  const activeMeds = await db.select().from(schema.medicines).where(eq(schema.medicines.patientId, id))

  return c.json({
    ...patientData.patient,
    name: patientData.user.name,
    email: patientData.user.email,
    phone: patientData.user.phone,
    avatarUrl: patientData.user.avatarUrl,
    vitalsHistory: vitals,
    activeMedicines: activeMeds
  })
})

// Update patient profile (e.g. preferred language, emergency contacts, allergies)
patientRoutes.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json()
  const { db } = await getDb()

  await db.update(schema.patients).set({
    preferredLanguage: body.preferredLanguage,
    allergies: body.allergies,
    existingDiseases: body.existingDiseases,
    emergencyContacts: body.emergencyContacts,
    familyMembers: body.familyMembers,
    storageProvider: body.storageProvider
  }).where(eq(schema.patients.id, id))

  const [updated] = await db.select().from(schema.patients).where(eq(schema.patients.id, id)).limit(1)
  return c.json(updated)
})

// Get vitals
patientRoutes.get('/:id/vitals', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const { db } = await getDb()

  const vitals = await db.select().from(schema.vitalsLogs).where(eq(schema.vitalsLogs.patientId, id)).orderBy(desc(schema.vitalsLogs.recordedAt))
  return c.json(vitals)
})

// Log new vitals & recompute health risk scores
patientRoutes.post('/:id/vitals', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json()
  const { db } = await getDb()

  const [newVital] = await db.insert(schema.vitalsLogs).values({
    patientId: id,
    recordedAt: body.recordedAt || new Date().toISOString().split('T')[0],
    systolicBp: body.systolicBp ? parseInt(body.systolicBp, 10) : null,
    diastolicBp: body.diastolicBp ? parseInt(body.diastolicBp, 10) : null,
    bloodSugar: body.bloodSugar ? parseInt(body.bloodSugar, 10) : null,
    bloodSugarType: body.bloodSugarType || 'fasting',
    heartRate: body.heartRate ? parseInt(body.heartRate, 10) : null,
    spo2: body.spo2 ? parseInt(body.spo2, 10) : null,
    temperature: body.temperature ? parseFloat(body.temperature) : null,
    notes: body.notes || 'Patient self-reported telemetry'
  }).returning()

  // Recompute scores
  const allVitals = await db.select().from(schema.vitalsLogs).where(eq(schema.vitalsLogs.patientId, id)).orderBy(schema.vitalsLogs.recordedAt)
  const [patient] = await db.select().from(schema.patients).where(eq(schema.patients.id, id)).limit(1)

  const metrics = computePatientRiskMetrics(
    allVitals.map(v => ({
      systolicBp: v.systolicBp || undefined,
      diastolicBp: v.diastolicBp || undefined,
      bloodSugar: v.bloodSugar || undefined,
      heartRate: v.heartRate || undefined,
      spo2: v.spo2 || undefined,
      temp: v.temperature || undefined
    })),
    0, // missed count
    patient?.existingDiseases || [],
    35
  )

  await db.update(schema.patients).set({
    healthScore: metrics.healthScore,
    recoveryScore: metrics.recoveryScore,
    complianceScore: metrics.complianceScore,
    diseaseRiskScore: metrics.diseaseRiskScore,
    emergencyRiskScore: metrics.emergencyRiskScore
  }).where(eq(schema.patients.id, id))

  return c.json({
    vital: newVital,
    updatedMetrics: metrics
  })
})
