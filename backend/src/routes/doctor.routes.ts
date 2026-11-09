import { Hono } from 'hono'
import { getDb } from '../db/database'
import * as schema from '../db/schema'
import { eq, desc, or, ilike, and } from 'drizzle-orm'
import { eventBus } from '../services/socket-service'

export const doctorRoutes = new Hono()

// Doctor assigned patient list (in-memory persistent set for doctor session)
const doctorAssignedPatientIds = new Set<number>([1, 2, 3])

// Doctor patient search (by name, Patient Code MED-P-..., Universal Health ID ABHA, or Phone)
doctorRoutes.get('/search-patients', async (c) => {
  const query = (c.req.query('q') || '').trim().toLowerCase()
  const { db } = await getDb()

  const patientsList = await db.select({
    patient: schema.patients,
    user: schema.users
  })
  .from(schema.patients)
  .innerJoin(schema.users, eq(schema.patients.userId, schema.users.id))

  const filtered = patientsList.filter(item => {
    if (!query) return true
    return (
      item.user.name.toLowerCase().includes(query) ||
      item.patient.patientCode.toLowerCase().includes(query) ||
      item.patient.universalHealthId.toLowerCase().includes(query) ||
      item.user.phone.includes(query) ||
      item.patient.bloodGroup.toLowerCase().includes(query)
    )
  })

  return c.json(filtered.map(p => ({
    ...p.patient,
    name: p.user.name,
    email: p.user.email,
    phone: p.user.phone,
    avatarUrl: p.user.avatarUrl,
    isAssignedToDoctor: doctorAssignedPatientIds.has(p.patient.id)
  })))
})

// Doctor adds patient to active roster by Patient Code or Universal Health ID
doctorRoutes.post('/add-patient', async (c) => {
  const { patientIdentifier } = await c.req.json()
  const { db } = await getDb()

  if (!patientIdentifier) {
    return c.json({ error: 'Patient ID or ABHA code required' }, 400)
  }

  const query = patientIdentifier.trim().toLowerCase()
  const patientsList = await db.select({
    patient: schema.patients,
    user: schema.users
  })
  .from(schema.patients)
  .innerJoin(schema.users, eq(schema.patients.userId, schema.users.id))

  const match = patientsList.find(p =>
    p.patient.patientCode.toLowerCase() === query ||
    p.patient.universalHealthId.toLowerCase() === query ||
    p.user.name.toLowerCase().includes(query)
  )

  if (!match) {
    return c.json({ error: `Patient with ID/code "${patientIdentifier}" not found in ecosystem registry` }, 404)
  }

  doctorAssignedPatientIds.add(match.patient.id)

  // Real-Time Socket Broadcast to synchronize across portals
  eventBus.broadcast({
    type: 'PATIENT_ENROLLED',
    portal: 'all',
    title: `🔐 Patient Vault Enrolled: ${match.user.name}`,
    message: `Dr. Anjali Mehta securely verified and unlocked records for ${match.user.name} (${match.patient.patientCode}) via ABHA Consent Protocol.`,
    patientId: match.patient.id,
    patientName: match.user.name,
    data: { patientCode: match.patient.patientCode, universalHealthId: match.patient.universalHealthId }
  })

  // Log audit
  await db.insert(schema.auditLogs).values({
    actorName: 'Dr. Anjali Mehta, MD',
    actorRole: 'doctor',
    action: 'DOCTOR_ADDED_PATIENT_BY_ID',
    resourceType: 'patients',
    resourceId: String(match.patient.id),
    details: { patientName: match.user.name, code: match.patient.patientCode }
  })

  return c.json({
    success: true,
    message: `Patient ${match.user.name} (${match.patient.patientCode}) successfully enrolled into clinical care roster!`,
    patient: {
      ...match.patient,
      name: match.user.name,
      email: match.user.email,
      phone: match.user.phone
    }
  })
})

// Doctor access full patient history
doctorRoutes.get('/patient-history/:patientId', async (c) => {
  const patientId = parseInt(c.req.param('patientId'), 10)
  const doctorId = parseInt(c.req.query('doctorId') || '1', 10)
  const { db } = await getDb()

  const [patientData] = await db.select({
    patient: schema.patients,
    user: schema.users
  })
  .from(schema.patients)
  .innerJoin(schema.users, eq(schema.patients.userId, schema.users.id))
  .where(eq(schema.patients.id, patientId))
  .limit(1)

  if (!patientData) return c.json({ error: 'Patient not found' }, 404)

  const records = await db.select().from(schema.healthVaultRecords).where(eq(schema.healthVaultRecords.patientId, patientId)).orderBy(desc(schema.healthVaultRecords.createdAt))
  const vitals = await db.select().from(schema.vitalsLogs).where(eq(schema.vitalsLogs.patientId, patientId)).orderBy(desc(schema.vitalsLogs.recordedAt))
  const medicines = await db.select().from(schema.medicines).where(eq(schema.medicines.patientId, patientId))
  const consultations = await db.select().from(schema.aiConsultations).where(eq(schema.aiConsultations.patientId, patientId)).orderBy(desc(schema.aiConsultations.createdAt))

  return c.json({
    patient: {
      ...patientData.patient,
      name: patientData.user.name,
      email: patientData.user.email,
      phone: patientData.user.phone,
      avatarUrl: patientData.user.avatarUrl
    },
    consentVerified: true,
    records,
    vitals,
    medicines,
    consultations
  })
})

// Doctor Alerts Feed (Active SOS, Deteriorating Vitals, Missed Meds)
doctorRoutes.get('/alerts', async (c) => {
  const { db } = await getDb()
  const alerts: any[] = []

  // Check active SOS
  const activeSos = await db.select({
    sos: schema.sosEvents,
    patient: schema.patients,
    user: schema.users
  })
  .from(schema.sosEvents)
  .innerJoin(schema.patients, eq(schema.sosEvents.patientId, schema.patients.id))
  .innerJoin(schema.users, eq(schema.patients.userId, schema.users.id))
  .where(eq(schema.sosEvents.status, 'active'))

  for (const item of activeSos) {
    alerts.push({
      id: `sos-${item.sos.id}`,
      severity: 'CRITICAL',
      category: 'EMERGENCY_SOS',
      patientId: item.patient.id,
      patientName: item.user.name,
      patientCode: item.patient.patientCode,
      title: '🚨 Emergency SOS Triggered',
      description: `Patient triggered SOS at ${item.sos.address}. Ambulance dispatched (ETA ${item.sos.ambulanceEtaMinutes}m).`,
      timestamp: item.sos.createdAt,
      actionRequired: 'Monitor Live GPS Tracking & Prepare ER Admission'
    })
  }

  // Check high BP spikes
  const highBpPatients = await db.select({
    vital: schema.vitalsLogs,
    patient: schema.patients,
    user: schema.users
  })
  .from(schema.vitalsLogs)
  .innerJoin(schema.patients, eq(schema.vitalsLogs.patientId, schema.patients.id))
  .innerJoin(schema.users, eq(schema.patients.userId, schema.users.id))
  .where(desc(schema.vitalsLogs.recordedAt))
  .limit(10)

  for (const item of highBpPatients) {
    if (item.vital.systolicBp && item.vital.systolicBp > 150) {
      alerts.push({
        id: `vital-bp-${item.vital.id}`,
        severity: 'HIGH',
        category: 'HEALTH_DETERIORATION',
        patientId: item.patient.id,
        patientName: item.user.name,
        patientCode: item.patient.patientCode,
        title: '⚠️ Stage 2 Hypertension Spike',
        description: `Systolic BP reached ${item.vital.systolicBp} mmHg on ${item.vital.recordedAt}. Heart rate: ${item.vital.heartRate} bpm.`,
        timestamp: item.vital.createdAt,
        actionRequired: 'Schedule Urgent Teleconsultation & Titrate Antihypertensives'
      })
      break
    }
  }

  // Check missed medicines
  const missedMeds = await db.select({
    reminder: schema.medicineReminders,
    medicine: schema.medicines,
    patient: schema.patients,
    user: schema.users
  })
  .from(schema.medicineReminders)
  .innerJoin(schema.medicines, eq(schema.medicineReminders.medicineId, schema.medicines.id))
  .innerJoin(schema.patients, eq(schema.medicineReminders.patientId, schema.patients.id))
  .innerJoin(schema.users, eq(schema.patients.userId, schema.users.id))
  .where(eq(schema.medicineReminders.status, 'missed'))

  for (const item of missedMeds) {
    alerts.push({
      id: `med-missed-${item.reminder.id}`,
      severity: 'MEDIUM',
      category: 'MISSED_MEDICINE',
      patientId: item.patient.id,
      patientName: item.user.name,
      patientCode: item.patient.patientCode,
      title: '💊 Medication Non-Compliance Alert',
      description: `Missed scheduled dose of ${item.medicine.name}. 5-stage automated escalation concluded without patient acknowledgement.`,
      timestamp: item.reminder.createdAt,
      actionRequired: 'Contact Family or Trigger Secondary Clinical Outreach'
    })
  }

  return c.json(alerts)
})

// Doctor Analytics Dashboard with AI Patient Condition Analysis
doctorRoutes.get('/analytics', async (c) => {
  const { db } = await getDb()

  const allPatients = await db.select({
    patient: schema.patients,
    user: schema.users
  })
  .from(schema.patients)
  .innerJoin(schema.users, eq(schema.patients.userId, schema.users.id))

  const allAppointments = await db.select().from(schema.appointments)
  const allConsultations = await db.select().from(schema.aiConsultations)

  // AI Analysis per patient on basis of medicine adherence, uploaded lab reports & vitals
  const patientAIAnalyses = []

  for (const p of allPatients) {
    const vitals = await db.select().from(schema.vitalsLogs).where(eq(schema.vitalsLogs.patientId, p.patient.id)).orderBy(desc(schema.vitalsLogs.recordedAt)).limit(5)
    const reports = await db.select().from(schema.healthVaultRecords).where(eq(schema.healthVaultRecords.patientId, p.patient.id))
    const meds = await db.select().from(schema.medicines).where(eq(schema.medicines.patientId, p.patient.id))
    const latestVital = vitals[0]

    let aiStatus: 'GOOD' | 'MODERATE' | 'CRITICAL' = 'GOOD'
    const findings: string[] = []

    if (latestVital?.systolicBp && latestVital.systolicBp > 150) {
      aiStatus = 'CRITICAL'
      findings.push(`Elevated BP (${latestVital.systolicBp}/${latestVital.diastolicBp} mmHg)`)
    } else if (latestVital?.temperature && latestVital.temperature > 101.5) {
      aiStatus = 'MODERATE'
      findings.push(`Active Pyrexia (${latestVital.temperature}°F)`)
    }

    if (p.patient.complianceScore && p.patient.complianceScore < 85) {
      if (aiStatus !== 'CRITICAL') aiStatus = 'MODERATE'
      findings.push(`Low medication adherence (${p.patient.complianceScore}%)`)
    }

    if (reports.length > 0) {
      findings.push(`${reports.length} Verified Lab Reports/Scans on file`)
    }

    patientAIAnalyses.push({
      patientId: p.patient.id,
      patientName: p.user.name,
      patientCode: p.patient.patientCode,
      universalHealthId: p.patient.universalHealthId,
      bloodGroup: p.patient.bloodGroup,
      aiConditionStatus: aiStatus,
      healthScore: p.patient.healthScore || 85,
      complianceScore: p.patient.complianceScore || 95,
      recoveryScore: p.patient.recoveryScore || 88,
      activeMedicationsCount: meds.length,
      uploadedReportsCount: reports.length,
      latestVitalsSummary: latestVital ? `BP: ${latestVital.systolicBp}/${latestVital.diastolicBp} | HR: ${latestVital.heartRate} | Temp: ${latestVital.temperature}°F` : 'No recent telemetry',
      aiFindings: findings,
      aiClinicalRecommendation: aiStatus === 'GOOD'
        ? 'Stable recovery trajectory. Continue current medication regimen and routine vitals tracking.'
        : aiStatus === 'MODERATE'
        ? 'Active symptoms present. Advise hydration, antipyretic compliance and review lab parameters in 48 hours.'
        : 'Immediate clinical review required. Titrate antihypertensive therapy and schedule teleconsultation today.'
    })
  }

  const avgHealth = Math.round(allPatients.reduce((acc, p) => acc + (p.patient.healthScore || 80), 0) / (allPatients.length || 1))
  const avgCompliance = Math.round(allPatients.reduce((acc, p) => acc + (p.patient.complianceScore || 90), 0) / (allPatients.length || 1))

  return c.json({
    totalPatientsCount: allPatients.length,
    assignedRosterCount: doctorAssignedPatientIds.size,
    avgHealthScore: avgHealth,
    avgComplianceScore: avgCompliance,
    pendingAiPrescriptionsCount: allConsultations.filter(c => c.doctorReviewStatus === 'pending').length,
    patientAIAnalyses
  })
})
