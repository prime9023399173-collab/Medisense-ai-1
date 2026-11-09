import { Hono } from 'hono'
import { getDb } from '../db/database'
import * as schema from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { consultAIHealthDoctor, MVP_SYMPTOM_TREES } from '../services/ai-service'
import { eventBus } from '../services/socket-service'

export const aiDoctorRoutes = new Hono()

// Get clinical symptom trees
aiDoctorRoutes.get('/symptom-trees', (c) => {
  return c.json(MVP_SYMPTOM_TREES)
})

// Main AI consultation endpoint
aiDoctorRoutes.post('/consult', async (c) => {
  const { patientId, query, history, language } = await c.req.json()
  const { db } = await getDb()

  const [patient] = await db.select().from(schema.patients).where(eq(schema.patients.id, parseInt(patientId, 10))).limit(1)
  if (!patient) return c.json({ error: 'Patient not found' }, 404)

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, patient.userId)).limit(1)
  const activeMeds = await db.select().from(schema.medicines).where(eq(schema.medicines.patientId, patient.id))
  const [latestVital] = await db.select().from(schema.vitalsLogs).where(eq(schema.vitalsLogs.patientId, patient.id)).orderBy(desc(schema.vitalsLogs.recordedAt)).limit(1)
  const vaultReports = await db.select().from(schema.healthVaultRecords).where(eq(schema.healthVaultRecords.patientId, patient.id))
  const previousConsultations = await db.select().from(schema.aiConsultations).where(eq(schema.aiConsultations.patientId, patient.id)).orderBy(desc(schema.aiConsultations.createdAt)).limit(5)

  const clinicalContext = {
    patientName: user.name,
    allergies: patient.allergies || [],
    existingDiseases: patient.existingDiseases || [],
    currentMedicines: activeMeds.map(m => `${m.name} (${m.dosage})`),
    recentVitals: {
      systolicBp: latestVital?.systolicBp || undefined,
      diastolicBp: latestVital?.diastolicBp || undefined,
      bloodSugar: latestVital?.bloodSugar || undefined,
      heartRate: latestVital?.heartRate || undefined,
      spo2: latestVital?.spo2 || undefined,
      temperature: latestVital?.temperature || undefined
    },
    recentLabReports: vaultReports.map(r => `${r.title} (${r.recordType}): ${r.description || 'No report summary recorded.'}`),
    consultationHistory: previousConsultations.map(consultation => {
      const previousPrescriptions = (consultation.suggestedPrescription || []).map(item => item.medicine).join(', ')
      return `${consultation.primarySymptom}: ${consultation.aiSummary || consultation.suggestedDiagnosis || 'No summary recorded.'}; previous prescription suggestions: ${previousPrescriptions || 'none'}`
    }),
    preferredLanguage: language || (patient.preferredLanguage as 'en' | 'hi' | 'mr') || 'en'
  }

  const aiResult = await consultAIHealthDoctor(query, history || [], clinicalContext)

  // Save consultation in DB
  const [consultRecord] = await db.insert(schema.aiConsultations).values({
    patientId: patient.id,
    primarySymptom: query.slice(0, 80),
    language: clinicalContext.preferredLanguage,
    conversationHistory: [
      ...(history || []),
      { sender: 'patient', message: query, timestamp: new Date().toLocaleTimeString() },
      { sender: 'ai', message: aiResult.reply, timestamp: new Date().toLocaleTimeString() }
    ],
    triageLevel: aiResult.triageLevel,
    aiSummary: aiResult.aiSummary,
    reviewedMedicalHistory: {
      allergiesChecked: clinicalContext.allergies,
      diseasesChecked: clinicalContext.existingDiseases,
      activeMedicationsChecked: clinicalContext.currentMedicines,
      recentVitalsChecked: clinicalContext.recentVitals
    },
    suggestedDiagnosis: aiResult.preliminaryDiagnosis,
    suggestedPrescription: aiResult.preliminaryPrescription,
    lifestyleAdvice: aiResult.recommendedCare,
    redFlagsDetected: aiResult.redFlagsDetected,
    doctorReviewStatus: 'pending',
    assignedDoctorId: 1
  }).returning()

  return c.json({
    ...aiResult,
    consultationId: consultRecord.id,
    reviewedAllergies: clinicalContext.allergies,
    reviewedDiseases: clinicalContext.existingDiseases
  })
})

// Forward prescription explicitly to doctor portal
aiDoctorRoutes.post('/prescriptions/:id/forward', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const { db } = await getDb()

  await db.update(schema.aiConsultations).set({
    doctorReviewStatus: 'pending',
    assignedDoctorId: 1
  }).where(eq(schema.aiConsultations.id, id))

  const [consultation] = await db.select().from(schema.aiConsultations).where(eq(schema.aiConsultations.id, id)).limit(1)

  // Real-Time Socket Broadcast to Doctor Portal
  eventBus.broadcast({
    type: 'PRESCRIPTION_FORWARDED',
    portal: 'doctor',
    title: '💊 AI Prescription Awaiting Physician Authorization',
    message: `Patient forwarded preliminary AI prescription for ${consultation?.suggestedDiagnosis || 'clinical pyrexia'} to Dr. Anjali Mehta's queue.`,
    patientId: consultation?.patientId,
    data: { consultationId: id, suggestedDiagnosis: consultation?.suggestedDiagnosis }
  })

  // Create audit log
  await db.insert(schema.auditLogs).values({
    actorName: 'Patient Triage Forwarder',
    actorRole: 'patient',
    action: 'AI_PRESCRIPTION_FORWARDED_TO_DOCTOR',
    resourceType: 'ai_consultations',
    resourceId: String(id),
    details: { consultationId: id, patientId: consultation?.patientId }
  })

  return c.json({
    success: true,
    message: 'Preliminary prescription forwarded successfully to Dr. Anjali Mehta for clinical review & approval!'
  })
})

// Get all pending prescriptions for Doctor Review Queue
aiDoctorRoutes.get('/pending-prescriptions', async (c) => {
  const { db } = await getDb()

  const pendingList = await db.select({
    consultation: schema.aiConsultations,
    patient: schema.patients,
    patientUser: schema.users
  })
  .from(schema.aiConsultations)
  .innerJoin(schema.patients, eq(schema.aiConsultations.patientId, schema.patients.id))
  .innerJoin(schema.users, eq(schema.patients.userId, schema.users.id))
  .where(eq(schema.aiConsultations.doctorReviewStatus, 'pending'))
  .orderBy(desc(schema.aiConsultations.createdAt))

  return c.json(pendingList.map(item => ({
    ...item.consultation,
    patientName: item.patientUser.name,
    patientCode: item.patient.patientCode,
    universalHealthId: item.patient.universalHealthId,
    bloodGroup: item.patient.bloodGroup,
    allergies: item.patient.allergies,
    existingDiseases: item.patient.existingDiseases
  })))
})

// Doctor approves or modifies AI Prescription
aiDoctorRoutes.post('/prescriptions/:id/review', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json()
  const { db } = await getDb()

  const [consultation] = await db.select().from(schema.aiConsultations).where(eq(schema.aiConsultations.id, id)).limit(1)
  if (!consultation) return c.json({ error: 'Consultation not found' }, 404)

  const finalStatus = body.status || 'approved'
  const approvedPrescriptions = body.modifiedPrescription || consultation.suggestedPrescription || []

  await db.update(schema.aiConsultations).set({
    doctorReviewStatus: finalStatus,
    doctorNotes: body.doctorNotes || 'Clinically verified, signed and authorized by attending physician.',
    reviewedAt: new Date(),
    suggestedPrescription: approvedPrescriptions
  }).where(eq(schema.aiConsultations.id, id))

  // If approved, automatically add approved medications to patient's active medicine regimen
  if (finalStatus === 'approved' || finalStatus === 'modified') {
    for (const item of approvedPrescriptions) {
      const [insertedMed] = await db.insert(schema.medicines).values({
        patientId: consultation.patientId,
        name: item.medicine,
        dosage: item.dosage,
        form: 'tablet',
        frequency: item.timing,
        timing: { morning: true, afternoon: false, evening: false, night: true },
        foodRelation: 'after_food',
        startDate: new Date().toISOString().split('T')[0],
        durationDays: 5,
        remainingQuantity: 10,
        prescribedByDoctor: 'Dr. Anjali Mehta, MD (Clinically Verified)',
        ocrExtracted: false,
        isActive: true,
        instructions: item.instructions
      }).returning()

      // Add corresponding reminder
      await db.insert(schema.medicineReminders).values({
        medicineId: insertedMed.id,
        patientId: consultation.patientId,
        scheduledTime: '09:00 AM',
        scheduledDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        escalationStage: '1_push',
        escalationHistory: [
          {
            stage: '1_push',
            timestamp: new Date().toISOString(),
            channel: 'System Generator',
            status: 'scheduled',
            details: 'Automatically generated from Dr. Anjali Mehta approved clinical prescription'
          }
        ]
      })
    }
  }

  // Audit log
  await db.insert(schema.auditLogs).values({
    actorName: 'Dr. Anjali Mehta, MD',
    actorRole: 'doctor',
    action: `AI_PRESCRIPTION_${finalStatus.toUpperCase()}`,
    resourceType: 'ai_consultations',
    resourceId: String(id),
    details: { patientId: consultation.patientId, status: finalStatus, count: approvedPrescriptions.length }
  })

  // Real-Time Socket Broadcast to Patient Portal
  eventBus.broadcast({
    type: 'CLAIM_DOCTOR_VERIFIED',
    portal: 'patient',
    title: '✅ Prescription Authorized by Dr. Anjali Mehta',
    message: `Your preliminary prescription has been clinically approved and added to your active medications vault.`,
    patientId: consultation.patientId,
    data: { consultationId: id, status: finalStatus, count: approvedPrescriptions.length }
  })

  return c.json({
    success: true,
    message: `Prescription ${finalStatus} successfully and delivered to patient portal!`,
    prescriptions: approvedPrescriptions
  })
})
