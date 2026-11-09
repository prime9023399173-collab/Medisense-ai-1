import { Hono } from 'hono'
import { getDb } from '../db/database'
import * as schema from '../db/schema'
import { eq, desc } from 'drizzle-orm'

export const adminRoutes = new Hono()

// Super Admin Overview Metrics
adminRoutes.get('/stats', async (c) => {
  const { db } = await getDb()

  const allUsers = await db.select().from(schema.users)
  const allPatients = await db.select().from(schema.patients)
  const allDoctors = await db.select().from(schema.doctors)
  const allInsurers = await db.select().from(schema.insuranceCompanies)
  const allClaims = await db.select().from(schema.insuranceClaims)
  const allSos = await db.select().from(schema.sosEvents)
  const allVault = await db.select().from(schema.healthVaultRecords)

  return c.json({
    totalUsers: allUsers.length,
    patientsCount: allPatients.length,
    doctorsCount: allDoctors.length,
    insurancePartnersCount: allInsurers.length,
    healthVaultRecordsCount: allVault.length,
    totalClaimsProcessed: allClaims.length,
    totalClaimsAmount: allClaims.reduce((acc, cl) => acc + cl.claimedAmount, 0),
    emergencyEventsCount: allSos.length,
    systemUptimePercentage: 99.98,
    activeNodesCount: 14,
    complianceAdherenceRate: 98.4
  })
})

// Audit Logs Explorer
adminRoutes.get('/audit-logs', async (c) => {
  const { db } = await getDb()
  const logs = await db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.createdAt)).limit(50)
  return c.json(logs)
})

// User Management List
adminRoutes.get('/users', async (c) => {
  const { db } = await getDb()
  const users = await db.select().from(schema.users).orderBy(desc(schema.users.createdAt))
  return c.json(users)
})

// Provider Networks (Hospitals & Insurers)
adminRoutes.get('/providers', async (c) => {
  const { db } = await getDb()
  const docs = await db.select({ doctor: schema.doctors, user: schema.users })
    .from(schema.doctors)
    .innerJoin(schema.users, eq(schema.doctors.userId, schema.users.id))

  const insurers = await db.select({ insurer: schema.insuranceCompanies, user: schema.users })
    .from(schema.insuranceCompanies)
    .innerJoin(schema.users, eq(schema.insuranceCompanies.userId, schema.users.id))

  return c.json({
    doctors: docs.map(d => ({ ...d.doctor, name: d.user.name, email: d.user.email, phone: d.user.phone })),
    insurers: insurers.map(i => ({ ...i.insurer, name: i.user.name, email: i.user.email, phone: i.user.phone }))
  })
})
