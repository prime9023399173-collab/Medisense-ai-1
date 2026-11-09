import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { seed } from './db/seed'
import { authRoutes } from './routes/auth.routes'
import { patientRoutes } from './routes/patient.routes'
import { vaultRoutes } from './routes/vault.routes'
import { medicineRoutes } from './routes/medicine.routes'
import { appointmentRoutes } from './routes/appointment.routes'
import { aiDoctorRoutes } from './routes/ai-doctor.routes'
import { doctorRoutes } from './routes/doctor.routes'
import { insuranceRoutes } from './routes/insurance.routes'
import { sosRoutes } from './routes/sos.routes'
import { adminRoutes } from './routes/admin.routes'
import { eventsRoutes } from './routes/events.routes'
import { dispatchLogs, NOTIFICATION_TEMPLATES } from './services/notification-service'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))

// Health Check
app.get('/health', (c) => c.json({
  status: 'healthy',
  service: 'Medisense AI Backend Ecosystem',
  version: '1.0.0-PROD',
  timestamp: new Date().toISOString()
}))

// Live Notification Dispatch Log (for investor observability)
app.get('/api/notifications/live-feed', (c) => {
  return c.json(dispatchLogs)
})

// Multilingual Templates Reference
app.get('/api/notifications/templates', (c) => {
  return c.json(NOTIFICATION_TEMPLATES)
})

// Mount Modular Routes
app.route('/api/auth', authRoutes)
app.route('/api/patients', patientRoutes)
app.route('/api/vault', vaultRoutes)
app.route('/api/medicines', medicineRoutes)
app.route('/api/appointments', appointmentRoutes)
app.route('/api/ai-doctor', aiDoctorRoutes)
app.route('/api/doctors', doctorRoutes)
app.route('/api/insurance', insuranceRoutes)
app.route('/api/sos', sosRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/events', eventsRoutes)

// Error Handler
app.onError((err, c) => {
  console.error('Unhandled Application Error:', err)
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  }, 500)
})

const PORT = parseInt(process.env.PORT || '4000', 10)

// Auto-seed database on bootstrap
seed().catch((err) => {
  console.error('Failed to run initial seed:', err)
})

console.log(`🏥 Medisense AI Backend starting on http://localhost:${PORT}`)

serve({
  fetch: app.fetch,
  port: PORT
})
