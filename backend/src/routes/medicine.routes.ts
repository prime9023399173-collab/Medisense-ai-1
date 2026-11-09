import { Hono } from 'hono'
import { getDb } from '../db/database'
import * as schema from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { simulateOcrExtraction } from '../services/ocr-service'
import { sendSimulatedNotification, NOTIFICATION_TEMPLATES, renderTemplate } from '../services/notification-service'
import { eventBus } from '../services/socket-service'

export const medicineRoutes = new Hono()

// Get all medicines for a patient
medicineRoutes.get('/patient/:patientId', async (c) => {
  const patientId = parseInt(c.req.param('patientId'), 10)
  const { db } = await getDb()

  const list = await db.select().from(schema.medicines)
    .where(eq(schema.medicines.patientId, patientId))
    .orderBy(desc(schema.medicines.createdAt))

  const reminders = await db.select().from(schema.medicineReminders)
    .where(eq(schema.medicineReminders.patientId, patientId))
    .orderBy(desc(schema.medicineReminders.createdAt))

  return c.json({
    medicines: list,
    reminders
  })
})

// Add new medicine
medicineRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const { db } = await getDb()

  const [med] = await db.insert(schema.medicines).values({
    patientId: parseInt(body.patientId, 10),
    name: body.name,
    dosage: body.dosage || '1 Tablet',
    form: body.form || 'tablet',
    frequency: body.frequency || 'Twice Daily',
    timing: body.timing || { morning: true, afternoon: false, evening: false, night: true },
    foodRelation: body.foodRelation || 'after_food',
    startDate: body.startDate || new Date().toISOString().split('T')[0],
    durationDays: body.durationDays ? parseInt(body.durationDays, 10) : 7,
    remainingQuantity: body.remainingQuantity ? parseInt(body.remainingQuantity, 10) : 14,
    prescribedByDoctor: body.prescribedByDoctor || 'Dr. Anjali Mehta, MD',
    ocrExtracted: body.ocrExtracted || false,
    isActive: true,
    instructions: body.instructions || ''
  }).returning()

  // Auto-generate initial reminder schedule
  const [reminder] = await db.insert(schema.medicineReminders).values({
    medicineId: med.id,
    patientId: med.patientId,
    scheduledTime: '09:00 AM',
    scheduledDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    escalationStage: '1_push',
    escalationHistory: [
      {
        stage: '1_push',
        timestamp: new Date().toISOString(),
        channel: 'Push Notification',
        status: 'scheduled',
        details: 'Dose reminder scheduled for morning intake'
      }
    ]
  }).returning()

  return c.json({ medicine: med, initialReminder: reminder })
})

// Update medicine
medicineRoutes.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json()
  const { db } = await getDb()

  await db.update(schema.medicines).set({
    name: body.name,
    dosage: body.dosage,
    form: body.form,
    frequency: body.frequency,
    timing: body.timing,
    foodRelation: body.foodRelation,
    durationDays: body.durationDays,
    remainingQuantity: body.remainingQuantity,
    instructions: body.instructions
  }).where(eq(schema.medicines.id, id))

  const [updated] = await db.select().from(schema.medicines).where(eq(schema.medicines.id, id)).limit(1)
  return c.json(updated)
})

// Delete medicine
medicineRoutes.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const { db } = await getDb()

  await db.delete(schema.medicineReminders).where(eq(schema.medicineReminders.medicineId, id))
  await db.delete(schema.medicines).where(eq(schema.medicines.id, id))

  return c.json({ success: true, message: 'Medicine removed successfully' })
})

// Prescription OCR Scanner
medicineRoutes.post('/ocr-scan', async (c) => {
  const body = await c.req.json()
  const result = simulateOcrExtraction(body.sampleType || body.rawText)
  return c.json(result)
})

// Acknowledge Dose Taken
medicineRoutes.post('/reminders/:reminderId/acknowledge', async (c) => {
  const reminderId = parseInt(c.req.param('reminderId'), 10)
  const { db } = await getDb()

  const [reminder] = await db.select().from(schema.medicineReminders).where(eq(schema.medicineReminders.id, reminderId)).limit(1)
  if (!reminder) return c.json({ error: 'Reminder not found' }, 404)

  const updatedHistory = [
    ...(reminder.escalationHistory || []),
    {
      stage: reminder.escalationStage || '1_push',
      timestamp: new Date().toISOString(),
      channel: 'Patient Confirmation',
      status: 'taken',
      details: 'Patient acknowledged taking dose via one-touch confirm'
    }
  ]

  await db.update(schema.medicineReminders).set({
    status: 'taken',
    acknowledgedAt: new Date(),
    escalationHistory: updatedHistory
  }).where(eq(schema.medicineReminders.id, reminderId))

  // Decrement remaining quantity
  const [med] = await db.select().from(schema.medicines).where(eq(schema.medicines.id, reminder.medicineId)).limit(1)
  if (med && med.remainingQuantity > 0) {
    await db.update(schema.medicines).set({
      remainingQuantity: med.remainingQuantity - 1
    }).where(eq(schema.medicines.id, med.id))
  }

  // Update compliance score upward
  const [patient] = await db.select().from(schema.patients).where(eq(schema.patients.id, reminder.patientId)).limit(1)
  if (patient) {
    const newScore = Math.min(100, (patient.complianceScore || 90) + 2)
    await db.update(schema.patients).set({ complianceScore: newScore }).where(eq(schema.patients.id, patient.id))
  }

  // Real-Time Socket Broadcast
  eventBus.broadcast({
    type: 'MEDICINE_ACKNOWLEDGED',
    portal: 'all',
    title: `💊 Medication Dose Confirmed: ${med?.name || 'Scheduled Medicine'}`,
    message: `Patient confirmed taking ${med?.name} (${med?.dosage}). Compliance score increased.`,
    patientId: reminder.patientId,
    data: { reminderId, medicineName: med?.name }
  })

  return c.json({ success: true, message: 'Dose acknowledged as taken! Compliance score refreshed.' })
})

// 5-Stage Reminder Escalation Engine (Push -> SMS1 -> SMS2 -> Voice -> IVRS -> Missed/Doctor alert)
medicineRoutes.post('/reminders/:reminderId/escalate', async (c) => {
  const reminderId = parseInt(c.req.param('reminderId'), 10)
  const body = await c.req.json().catch(() => ({}))
  const { db } = await getDb()

  const [reminder] = await db.select().from(schema.medicineReminders).where(eq(schema.medicineReminders.id, reminderId)).limit(1)
  if (!reminder) return c.json({ error: 'Reminder not found' }, 404)

  const [med] = await db.select().from(schema.medicines).where(eq(schema.medicines.id, reminder.medicineId)).limit(1)
  const [patient] = await db.select().from(schema.patients).where(eq(schema.patients.id, reminder.patientId)).limit(1)
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, patient.userId)).limit(1)

  const stages = ['1_push', '2_sms1', '3_sms2', '4_voice', '5_ivrs', '6_doctor_escalated']
  const currentIndex = stages.indexOf(reminder.escalationStage || '1_push')
  const nextStage = body.targetStage || (currentIndex < stages.length - 1 ? stages[currentIndex + 1] : stages[stages.length - 1])

  const lang = (patient.preferredLanguage as 'en' | 'hi' | 'mr') || 'en'
  const templateVars = {
    patientName: user.name,
    patientId: patient.patientCode,
    medicineName: med.name,
    dosage: med.dosage,
    foodRelation: med.foodRelation,
    scheduledTime: reminder.scheduledTime,
    doctorName: 'Dr. Anjali Mehta',
    reminderId: reminder.id,
    complianceScore: Math.max(50, (patient.complianceScore || 95) - 6)
  }

  let notificationDetails = ''
  let channelType: 'push' | 'sms' | 'voice' | 'ivrs' = 'push'

  if (nextStage === '1_push') {
    channelType = 'push'
    notificationDetails = renderTemplate(NOTIFICATION_TEMPLATES.medicineReminderPush[lang], templateVars)
    await sendSimulatedNotification('push', user.email, 'patient', notificationDetails)
  } else if (nextStage === '2_sms1') {
    channelType = 'sms'
    notificationDetails = renderTemplate(NOTIFICATION_TEMPLATES.medicineReminderSMS1[lang], templateVars)
    await sendSimulatedNotification('sms', user.phone, 'patient', notificationDetails)
  } else if (nextStage === '3_sms2') {
    channelType = 'sms'
    notificationDetails = renderTemplate(NOTIFICATION_TEMPLATES.medicineReminderSMS2[lang], templateVars)
    await sendSimulatedNotification('sms', user.phone, 'patient', notificationDetails)
  } else if (nextStage === '4_voice') {
    channelType = 'voice'
    notificationDetails = renderTemplate(NOTIFICATION_TEMPLATES.medicineVoiceCallScript[lang], templateVars)
    await sendSimulatedNotification('voice', user.phone, 'patient', notificationDetails)
  } else if (nextStage === '5_ivrs') {
    channelType = 'ivrs'
    notificationDetails = renderTemplate(NOTIFICATION_TEMPLATES.medicineIvrsScript[lang], templateVars)
    await sendSimulatedNotification('ivrs', user.phone, 'patient', notificationDetails)
  } else if (nextStage === '6_doctor_escalated') {
    channelType = 'sms'
    notificationDetails = renderTemplate(NOTIFICATION_TEMPLATES.medicineMissedDoctorEscalation[lang], templateVars)
    // Notify primary doctor & top family member
    await sendSimulatedNotification('sms', '+919811001122', 'doctor', notificationDetails)
    if (patient.emergencyContacts && patient.emergencyContacts.length > 0) {
      await sendSimulatedNotification('sms', patient.emergencyContacts[0].phone, 'family', notificationDetails)
    }

    // Mark as missed and penalize compliance score
    await db.update(schema.patients).set({
      complianceScore: templateVars.complianceScore
    }).where(eq(schema.patients.id, patient.id))

    await db.update(schema.medicineReminders).set({
      status: 'missed'
    }).where(eq(schema.medicineReminders.id, reminderId))

    // Real-Time Socket Broadcast to Doctor and Family
    eventBus.broadcast({
      type: 'MEDICINE_MISSED',
      portal: 'all',
      title: `⚠️ Medication Missed: ${med.name}`,
      message: `Patient ${user.name} missed scheduled dose of ${med.name}. 5-stage automated escalation concluded without response.`,
      patientId: patient.id,
      patientName: user.name,
      data: { reminderId, medicineName: med.name }
    })
  }

  const updatedHistory = [
    ...(reminder.escalationHistory || []),
    {
      stage: nextStage,
      timestamp: new Date().toISOString(),
      channel: channelType.toUpperCase(),
      status: nextStage === '6_doctor_escalated' ? 'escalated_to_doctor_and_family' : 'delivered',
      details: notificationDetails
    }
  ]

  await db.update(schema.medicineReminders).set({
    escalationStage: nextStage,
    escalationHistory: updatedHistory
  }).where(eq(schema.medicineReminders.id, reminderId))

  const [updatedReminder] = await db.select().from(schema.medicineReminders).where(eq(schema.medicineReminders.id, reminderId)).limit(1)

  return c.json({
    success: true,
    currentStage: nextStage,
    dispatchedChannel: channelType,
    notificationMessage: notificationDetails,
    reminder: updatedReminder
  })
})
