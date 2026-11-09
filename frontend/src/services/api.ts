const configuredApiBase = ((import.meta as any).env?.VITE_API_BASE_URL || '').replace(/\/$/, '')
const API_BASE = `${configuredApiBase}/api`

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(errorBody.message || errorBody.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export const api = {
  // Auth & Personas
  getDemoPersonas: () => fetchApi<any>('/auth/demo-personas'),
  switchPersona: (email: string) => fetchApi<any>('/auth/switch-persona', { method: 'POST', body: JSON.stringify({ email }) }),
  login: (email: string, password?: string) => fetchApi<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password: password || 'demo123' }) }),
  sendOtp: (phone: string, email?: string) => fetchApi<any>('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone, email }) }),
  verifyOtp: (identifier: string, otp: string) => fetchApi<any>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(identifier.includes('@') ? { email: identifier, otp } : { phone: identifier, otp })
  }),

  // Patients
  getAllPatients: () => fetchApi<any[]>('/patients'),
  getPatient: (id: number) => fetchApi<any>(`/patients/${id}`),
  updatePatient: (id: number, data: any) => fetchApi<any>(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getVitals: (patientId: number) => fetchApi<any[]>(`/patients/${patientId}/vitals`),
  logVital: (patientId: number, data: any) => fetchApi<any>(`/patients/${patientId}/vitals`, { method: 'POST', body: JSON.stringify(data) }),

  // Health Vault
  getVault: (patientId: number) => fetchApi<any>(`/vault/patient/${patientId}`),
  addVaultRecord: (patientId: number, data: any) => fetchApi<any>(`/vault/patient/${patientId}/record`, { method: 'POST', body: JSON.stringify(data) }),
  requestConsent: (patientId: number, doctorId: number, purpose: string) => fetchApi<any>('/vault/request-consent', { method: 'POST', body: JSON.stringify({ patientId, doctorId, purpose }) }),
  verifyConsent: (consentId: number, otpCode: string) => fetchApi<any>('/vault/verify-consent', { method: 'POST', body: JSON.stringify({ consentId, otpCode }) }),
  verifyIntegrity: (recordId: number) => fetchApi<any>(`/vault/verify-integrity/${recordId}`),

  // Medicines & Escalation
  getMedicines: (patientId: number) => fetchApi<any>(`/medicines/patient/${patientId}`),
  addMedicine: (data: any) => fetchApi<any>('/medicines', { method: 'POST', body: JSON.stringify(data) }),
  removeMedicine: (id: number) => fetchApi<any>(`/medicines/${id}`, { method: 'DELETE' }),
  ocrScan: (sampleType: string) => fetchApi<any>('/medicines/ocr-scan', { method: 'POST', body: JSON.stringify({ sampleType }) }),
  acknowledgeDose: (reminderId: number) => fetchApi<any>(`/medicines/reminders/${reminderId}/acknowledge`, { method: 'POST' }),
  escalateReminder: (reminderId: number, targetStage?: string) => fetchApi<any>(`/medicines/reminders/${reminderId}/escalate`, { method: 'POST', body: JSON.stringify({ targetStage }) }),

  // Appointments
  getAppointments: () => fetchApi<any[]>('/appointments'),
  getPatientAppointments: (patientId: number) => fetchApi<any[]>(`/appointments/patient/${patientId}`),
  bookAppointment: (data: any) => fetchApi<any>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointmentStatus: (id: number, status: string, notes?: string, date?: string, timeSlot?: string) => fetchApi<any>(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, clinicalNotes: notes, date, timeSlot }) }),

  // AI Doctor
  consultAIDoctor: (data: { patientId: number; query: string; history?: any[]; language?: string }) => fetchApi<any>('/ai-doctor/consult', { method: 'POST', body: JSON.stringify(data) }),
  forwardPrescriptionToDoctor: (consultationId: number) => fetchApi<any>(`/ai-doctor/prescriptions/${consultationId}/forward`, { method: 'POST' }),
  getSymptomTrees: () => fetchApi<any>('/ai-doctor/symptom-trees'),
  getPendingPrescriptions: () => fetchApi<any[]>('/ai-doctor/pending-prescriptions'),
  reviewPrescription: (id: number, status: string, doctorNotes?: string, modifiedPrescription?: any[]) => fetchApi<any>(`/ai-doctor/prescriptions/${id}/review`, { method: 'POST', body: JSON.stringify({ status, doctorNotes, modifiedPrescription }) }),

  // Doctor Portal
  searchDoctorPatients: (q?: string) => fetchApi<any[]>(`/doctors/search-patients${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  addPatientToDoctor: (patientIdentifier: string) => fetchApi<any>('/doctors/add-patient', { method: 'POST', body: JSON.stringify({ patientIdentifier }) }),
  getDoctorPatientHistory: (patientId: number, doctorId?: number) => fetchApi<any>(`/doctors/patient-history/${patientId}?doctorId=${doctorId || 1}`),
  getDoctorAlerts: () => fetchApi<any[]>('/doctors/alerts'),
  getDoctorAnalytics: () => fetchApi<any>('/doctors/analytics'),

  // Insurance Portal & Automated Claim Loop
  getInsuranceDashboard: () => fetchApi<any>('/insurance/dashboard'),
  getInsuranceClaims: () => fetchApi<any[]>('/insurance/claims'),
  submitInsuranceClaim: (data: any) => fetchApi<any>('/insurance/claims/submit', { method: 'POST', body: JSON.stringify(data) }),
  aiForwardClaimToDoctor: (claimId: number) => fetchApi<any>(`/insurance/claims/${claimId}/ai-forward-to-doctor`, { method: 'POST' }),
  doctorVerifyClaim: (claimId: number, doctorId?: number) => fetchApi<any>(`/insurance/claims/${claimId}/doctor-verify`, { method: 'POST', body: JSON.stringify({ doctorId: doctorId || 1 }) }),
  aiSettleClaimCheck: (claimId: number, isSuspicious?: boolean) => fetchApi<any>(`/insurance/claims/${claimId}/ai-settle-check`, { method: 'POST', body: JSON.stringify({ isSuspicious }) }),
  runAutomatedClaimLoop: (claimId: number) => fetchApi<any>(`/insurance/claims/${claimId}/run-automated-loop`, { method: 'POST' }),

  // Emergency SOS
  getActiveSOS: () => fetchApi<any[]>('/sos/active'),
  triggerSOS: (data: { patientId: number; latitude?: number; longitude?: number; address?: string }) => fetchApi<any>('/sos/trigger', { method: 'POST', body: JSON.stringify(data) }),
  updateSOSGps: (sosId: number, data?: { latitude?: number; longitude?: number; statusNote?: string }) => fetchApi<any>(`/sos/${sosId}/update-gps`, { method: 'POST', body: JSON.stringify(data || {}) }),
  resolveSOS: (sosId: number) => fetchApi<any>(`/sos/${sosId}/resolve`, { method: 'POST' }),

  // Admin & Notifications
  getAdminStats: () => fetchApi<any>('/admin/stats'),
  getAdminAuditLogs: () => fetchApi<any[]>('/admin/audit-logs'),
  getLiveNotificationFeed: () => fetchApi<any[]>('/notifications/live-feed'),
  getNotificationTemplates: () => fetchApi<any>('/notifications/templates')
}
