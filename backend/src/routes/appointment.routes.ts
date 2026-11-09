import { Hono } from 'hono'
import { getDb } from '../db/database'
import * as schema from '../db/schema'
import { eq, desc } from 'drizzle-orm'

export const appointmentRoutes = new Hono()

// Get all appointments
appointmentRoutes.get('/', async (c) => {
  const { db } = await getDb()
  const list = await db.select({
    appointment: schema.appointments,
    doctor: schema.doctors,
    doctorUser: schema.users,
    patient: schema.patients,
    patientUser: schema.users
  })
  .from(schema.appointments)
  .innerJoin(schema.doctors, eq(schema.appointments.doctorId, schema.doctors.id))
  .innerJoin(schema.users, eq(schema.doctors.userId, schema.users.id))
  .orderBy(desc(schema.appointments.createdAt))

  return c.json(list.map(item => ({
    ...item.appointment,
    doctorName: item.doctorUser.name,
    doctorSpecialization: item.doctor.specialization,
    doctorHospital: item.doctor.hospitalName
  })))
})

// Get appointments for a patient
appointmentRoutes.get('/patient/:patientId', async (c) => {
  const patientId = parseInt(c.req.param('patientId'), 10)
  const { db } = await getDb()

  const list = await db.select({
    appointment: schema.appointments,
    doctor: schema.doctors,
    doctorUser: schema.users
  })
  .from(schema.appointments)
  .innerJoin(schema.doctors, eq(schema.appointments.doctorId, schema.doctors.id))
  .innerJoin(schema.users, eq(schema.doctors.userId, schema.users.id))
  .where(eq(schema.appointments.patientId, patientId))
  .orderBy(desc(schema.appointments.createdAt))

  return c.json(list.map(i => ({
    ...i.appointment,
    doctorName: i.doctorUser.name,
    doctorSpecialization: i.doctor.specialization,
    hospitalName: i.doctor.hospitalName
  })))
})

// Book new appointment
appointmentRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const { db } = await getDb()

  const roomId = `medisense-video-${Math.random().toString(36).substring(2, 9)}`

  const [appointment] = await db.insert(schema.appointments).values({
    patientId: parseInt(body.patientId, 10),
    doctorId: parseInt(body.doctorId, 10),
    date: body.date,
    timeSlot: body.timeSlot,
    type: body.type || 'video',
    status: 'confirmed',
    chiefComplaint: body.chiefComplaint || 'General Clinical Review',
    clinicalNotes: body.clinicalNotes || '',
    webrtcRoomId: roomId
  }).returning()

  return c.json(appointment)
})

// Update appointment status (e.g. reschedule, cancel, conduct)
appointmentRoutes.put('/:id/status', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const body = await c.req.json()
  const { db } = await getDb()

  await db.update(schema.appointments).set({
    status: body.status,
    date: body.date || undefined,
    timeSlot: body.timeSlot || undefined,
    clinicalNotes: body.clinicalNotes || undefined
  }).where(eq(schema.appointments.id, id))

  const [updated] = await db.select().from(schema.appointments).where(eq(schema.appointments.id, id)).limit(1)
  return c.json(updated)
})

// WebRTC video room signaling token / session descriptor
appointmentRoutes.get('/webrtc-room/:roomId', async (c) => {
  const roomId = c.req.param('roomId')
  return c.json({
    roomId,
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ],
    videoQuality: '1080p-HD-Medical-Grade',
    audioCodec: 'Opus-48kHz',
    encryption: 'DTLS-SRTP-End-to-End'
  })
})
