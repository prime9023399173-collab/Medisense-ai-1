import { Hono } from 'hono'
import { getDb } from '../db/database'
import * as schema from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { sendSimulatedNotification, NOTIFICATION_TEMPLATES, renderTemplate } from '../services/notification-service'
import { eventBus } from '../services/socket-service'

export const sosRoutes = new Hono()

// Get active SOS events
sosRoutes.get('/active', async (c) => {
  const { db } = await getDb()

  const list = await db.select({
    sos: schema.sosEvents,
    patient: schema.patients,
    user: schema.users
  })
  .from(schema.sosEvents)
  .innerJoin(schema.patients, eq(schema.sosEvents.patientId, schema.patients.id))
  .innerJoin(schema.users, eq(schema.patients.userId, schema.users.id))
  .where(eq(schema.sosEvents.status, 'active'))
  .orderBy(desc(schema.sosEvents.createdAt))

  return c.json(list.map(i => ({
    ...i.sos,
    patientName: i.user.name,
    patientEmail: i.user.email,
    patientPhone: i.user.phone
  })))
})

// Trigger Single-Tap SOS
sosRoutes.post('/trigger', async (c) => {
  const body = await c.req.json()
  const patientId = parseInt(body.patientId || '1', 10)
  const { db } = await getDb()

  const [patient] = await db.select().from(schema.patients).where(eq(schema.patients.id, patientId)).limit(1)
  if (!patient) return c.json({ error: 'Patient not found' }, 404)

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, patient.userId)).limit(1)
  const activeMeds = await db.select().from(schema.medicines).where(eq(schema.medicines.patientId, patient.id))

  const lat = body.latitude || 19.0760
  const lng = body.longitude || 72.8777
  const address = body.address || 'Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051'
  const nearestHospital = 'Lilavati Hospital & Research Centre, Bandra'

  // Construct Emergency Information Package
  const emergencyPackage = {
    patientName: user.name,
    patientId: patient.universalHealthId,
    bloodGroup: patient.bloodGroup,
    allergies: patient.allergies || [],
    existingDiseases: patient.existingDiseases || [],
    currentMedicines: activeMeds.map(m => `${m.name} (${m.dosage})`),
    insuranceDetails: `${patient.insuranceProvider} (Policy: ${patient.insurancePolicyNumber})`,
    primaryDoctor: 'Dr. Anjali Mehta, MD (+919811001122)',
    emergencyContacts: patient.emergencyContacts || []
  }

  const dispatchedChannels: any[] = []
  const lang = (patient.preferredLanguage as 'en' | 'hi' | 'mr') || 'en'
  const templateVars = {
    patientName: user.name,
    patientId: patient.patientCode,
    bloodGroup: patient.bloodGroup,
    address,
    latitude: lat,
    longitude: lng,
    allergies: patient.allergies?.join(', ') || 'None',
    currentMeds: activeMeds.map(m => m.name).join(', ') || 'None',
    doctorName: 'Dr. Anjali Mehta',
    diseases: patient.existingDiseases?.join(', ') || 'None'
  }

  // 1. Dispatch to Doctor
  const docSmsText = renderTemplate(NOTIFICATION_TEMPLATES.sosSMS[lang], templateVars)
  await sendSimulatedNotification('sms', '+919811001122', 'doctor', docSmsText)
  dispatchedChannels.push({ channel: 'sms', recipient: '+919811001122 (Dr. Anjali Mehta)', recipientType: 'doctor', status: 'delivered', timestamp: new Date().toISOString() })

  const docIvrsText = renderTemplate(NOTIFICATION_TEMPLATES.sosIvrsScript[lang], templateVars)
  await sendSimulatedNotification('ivrs', '+919811001122', 'doctor', docIvrsText)
  dispatchedChannels.push({ channel: 'ivrs', recipient: '+919811001122 (Dr. Anjali Mehta)', recipientType: 'doctor', status: 'connected', timestamp: new Date().toISOString() })

  // 2. Dispatch to Nearest Hospital ER
  await sendSimulatedNotification('push', `${nearestHospital} Emergency Triage Desk`, 'hospital', docSmsText)
  dispatchedChannels.push({ channel: 'push', recipient: `${nearestHospital} ER Desk`, recipientType: 'hospital', status: 'delivered', timestamp: new Date().toISOString() })

  // 3. Dispatch to Insurance Company
  await sendSimulatedNotification('email', 'claims-emergency@starhealth.in', 'insurance', docSmsText, 'CRITICAL SOS CLAIM NOTICE')
  dispatchedChannels.push({ channel: 'email', recipient: 'claims-emergency@starhealth.in', recipientType: 'insurance', status: 'sent', timestamp: new Date().toISOString() })

  // 4. Dispatch to Family Members & Emergency Contacts
  if (patient.emergencyContacts && patient.emergencyContacts.length > 0) {
    for (const contact of patient.emergencyContacts) {
      await sendSimulatedNotification('sms', contact.phone, 'family', docSmsText)
      await sendSimulatedNotification('ivrs', contact.phone, 'family', docIvrsText)
      dispatchedChannels.push({ channel: 'sms', recipient: `${contact.phone} (${contact.name} - ${contact.relationship})`, recipientType: 'family', status: 'delivered', timestamp: new Date().toISOString() })
      dispatchedChannels.push({ channel: 'ivrs', recipient: `${contact.phone} (${contact.name})`, recipientType: 'family', status: 'connected', timestamp: new Date().toISOString() })
    }
  }

  // Record SOS Event in DB
  const [sosEvent] = await db.insert(schema.sosEvents).values({
    patientId: patient.id,
    status: 'active',
    latitude: lat,
    longitude: lng,
    address,
    primaryDoctorId: 1,
    nearestHospital,
    ambulanceEtaMinutes: 6,
    emergencyPackage,
    dispatchedChannels,
    liveTrackingActive: true,
    trackingUpdates: [
      { timestamp: new Date().toISOString(), latitude: lat, longitude: lng, statusNote: '🚨 SOS Activated by Patient' },
      { timestamp: new Date(Date.now() + 10000).toISOString(), latitude: lat + 0.0004, longitude: lng + 0.0003, statusNote: 'Emergency dispatch confirmed. Ambulance DL-01-MH-9412 assigned.' },
      { timestamp: new Date(Date.now() + 20000).toISOString(), latitude: lat + 0.0009, longitude: lng + 0.0008, statusNote: 'Ambulance en route. Speed: 48 km/h. ETA 5 minutes.' }
    ]
  }).returning()

  // Real-Time Socket Broadcast across all portals
  eventBus.broadcast({
    type: 'EMERGENCY_SOS',
    portal: 'all',
    title: `🚨 CRITICAL EMERGENCY SOS: ${user.name}`,
    message: `Patient triggered SOS at ${address}. Dispatched Lilavati ER Ambulance (ETA 6m), Dr. Anjali Mehta, Star Health & Family kin!`,
    patientId: patient.id,
    patientName: user.name,
    data: { sosId: sosEvent.id, coordinates: [lat, lng], address }
  })

  // Audit log
  await db.insert(schema.auditLogs).values({
    actorId: user.id,
    actorName: user.name,
    actorRole: 'patient',
    action: 'EMERGENCY_SOS_TRIGGERED',
    resourceType: 'sos_events',
    resourceId: String(sosEvent.id),
    details: { address, coordinates: [lat, lng], channelsCount: dispatchedChannels.length }
  })

  return c.json({
    success: true,
    message: '🚨 Emergency SOS Dispatched across all 5 channels: Doctor, Hospital, Insurance & Family notified!',
    sosEvent
  })
})

// Real-time GPS location update (simulates 30-second moving beacon)
sosRoutes.post('/:id/update-gps', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json()
  const { db } = await getDb()

  const [sos] = await db.select().from(schema.sosEvents).where(eq(schema.sosEvents.id, id)).limit(1)
  if (!sos) return c.json({ error: 'SOS event not found' }, 404)

  const newLat = body.latitude || (sos.latitude + 0.0004)
  const newLng = body.longitude || (sos.longitude + 0.0003)
  const newEta = Math.max(1, (sos.ambulanceEtaMinutes || 6) - 1)

  const updatedUpdates = [
    ...(sos.trackingUpdates || []),
    {
      timestamp: new Date().toISOString(),
      latitude: newLat,
      longitude: newLng,
      statusNote: body.statusNote || `Live GPS Beacon update. Distance to hospital: ${((newEta * 0.4).toFixed(1))} km. ETA: ${newEta} mins.`
    }
  ]

  await db.update(schema.sosEvents).set({
    latitude: newLat,
    longitude: newLng,
    ambulanceEtaMinutes: newEta,
    trackingUpdates: updatedUpdates
  }).where(eq(schema.sosEvents.id, id))

  const [updated] = await db.select().from(schema.sosEvents).where(eq(schema.sosEvents.id, id)).limit(1)
  return c.json(updated)
})

// Resolve SOS
sosRoutes.post('/:id/resolve', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const { db } = await getDb()

  await db.update(schema.sosEvents).set({
    status: 'resolved',
    liveTrackingActive: false,
    resolvedAt: new Date()
  }).where(eq(schema.sosEvents.id, id))

  const [resolved] = await db.select().from(schema.sosEvents).where(eq(schema.sosEvents.id, id)).limit(1)

  eventBus.broadcast({
    type: 'SOS_RESOLVED',
    portal: 'all',
    title: `✅ Emergency SOS Resolved`,
    message: `Emergency response concluded. Dispatched care teams and kin notified.`,
    data: { sosId: id }
  })

  return c.json({ success: true, message: 'SOS event marked as resolved.', sos: resolved })
})
