// Mobile API Client for Medisense AI
const API_BASE_URL = 'http://localhost:4000/api' // Use LAN IP (e.g. 192.168.1.x) or ngrok for physical devices
let authToken: string | null = null

export function setMobileAuthToken(token: string | null) {
  authToken = token
}

export async function mobileFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options?.headers || {})
    }
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || body?.message || `API error ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

export const mobileApi = {
  login: (email: string, password: string) => mobileFetch<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  sendOtp: (email: string) => mobileFetch<any>('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOtp: (email: string, otp: string) => mobileFetch<any>('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  getPatient: (id: number) => mobileFetch<any>(`/patients/${id}`),
  updatePatient: (id: number, data: any) => mobileFetch<any>(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getMedicines: (patientId: number) => mobileFetch<any>(`/medicines/patient/${patientId}`),
  acknowledgeDose: (reminderId: number) => mobileFetch<any>(`/medicines/reminders/${reminderId}/acknowledge`, { method: 'POST' }),
  consultAIDoctor: (data: any) => mobileFetch<any>('/ai-doctor/consult', { method: 'POST', body: JSON.stringify(data) }),
  triggerSOS: (data: any) => mobileFetch<any>('/sos/trigger', { method: 'POST', body: JSON.stringify(data) }),
  getVault: (patientId: number) => mobileFetch<any>(`/vault/patient/${patientId}`),
  getAppointments: (patientId: number) => mobileFetch<any[]>(`/appointments/patient/${patientId}`),
  bookAppointment: (data: any) => mobileFetch<any>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointmentStatus: (id: number, status: string, data?: any) => mobileFetch<any>(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, ...data }) }),
  getPatients: (query?: string) => mobileFetch<any[]>(`/doctors/search-patients${query ? `?q=${encodeURIComponent(query)}` : ''}`),
  addPatient: (patientIdentifier: string) => mobileFetch<any>('/doctors/add-patient', { method: 'POST', body: JSON.stringify({ patientIdentifier }) }),
  getPatientHistory: (patientId: number) => mobileFetch<any>(`/doctors/patient-history/${patientId}`),
  getDoctorAnalytics: () => mobileFetch<any>('/doctors/analytics'),
  getPendingPrescriptions: () => mobileFetch<any[]>('/ai-doctor/pending-prescriptions'),
  forwardPrescription: (id: number) => mobileFetch<any>(`/ai-doctor/prescriptions/${id}/forward`, { method: 'POST' }),
  reviewPrescription: (id: number, status: string) => mobileFetch<any>(`/ai-doctor/prescriptions/${id}/review`, { method: 'POST', body: JSON.stringify({ status }) }),
  escalateReminder: (reminderId: number, targetStage?: string) => mobileFetch<any>(`/medicines/reminders/${reminderId}/escalate`, { method: 'POST', body: JSON.stringify({ targetStage }) }),
  getClaims: () => mobileFetch<any[]>('/insurance/claims'),
  submitClaim: (data: any) => mobileFetch<any>('/insurance/claims/submit', { method: 'POST', body: JSON.stringify(data) }),
  verifyClaim: (id: number) => mobileFetch<any>(`/insurance/claims/${id}/doctor-verify`, { method: 'POST', body: JSON.stringify({ doctorId: 1 }) }),
  runClaimLoop: (id: number) => mobileFetch<any>(`/insurance/claims/${id}/run-automated-loop`, { method: 'POST' }),
  getActiveSOS: () => mobileFetch<any[]>('/sos/active'),
  resolveSOS: (id: number) => mobileFetch<any>(`/sos/${id}/resolve`, { method: 'POST' })
}
