// Frontend Real-Time WebSocket & Event Listener Client

export interface HealthcareSocketEvent {
  id: string
  type:
    | 'PRESCRIPTION_FORWARDED'
    | 'CLAIM_SUBMITTED'
    | 'CLAIM_FORWARDED_TO_DOCTOR'
    | 'CLAIM_DOCTOR_VERIFIED'
    | 'CLAIM_SETTLED'
    | 'CLAIM_ON_HOLD'
    | 'EMERGENCY_SOS'
    | 'SOS_RESOLVED'
    | 'MEDICINE_MISSED'
    | 'MEDICINE_ACKNOWLEDGED'
    | 'CONSENT_REQUESTED'
    | 'CONSENT_VERIFIED'
    | 'PATIENT_ENROLLED'
  portal: 'patient' | 'doctor' | 'insurance' | 'family' | 'all'
  title: string
  message: string
  patientId?: number
  patientName?: string
  data?: any
  timestamp: string
}

type EventListener = (event: HealthcareSocketEvent) => void

class HealthcareSocketClient {
  private eventSource: EventSource | null = null
  private listeners: Set<EventListener> = new Set()
  private isConnected = false
  private retryTimeout: any = null

  constructor() {
    this.connect()
  }

  public connect() {
    if (typeof window === 'undefined') return
    if (this.eventSource) {
      this.eventSource.close()
    }

    try {
      const apiBase = ((import.meta as any).env?.VITE_API_BASE_URL || '').replace(/\/$/, '')
      this.eventSource = new EventSource(`${apiBase}/api/events/stream`)

      this.eventSource.onopen = () => {
        this.isConnected = true
        console.log('⚡ Connected to Medisense Real-Time Healthcare Stream')
      }

      this.eventSource.onerror = () => {
        this.isConnected = false
        if (this.eventSource) {
          this.eventSource.close()
          this.eventSource = null
        }
        // Auto-reconnect after 3 seconds
        clearTimeout(this.retryTimeout)
        this.retryTimeout = setTimeout(() => this.connect(), 3000)
      }

      // Standard event handlers
      const eventTypes = [
        'PRESCRIPTION_FORWARDED',
        'CLAIM_SUBMITTED',
        'CLAIM_FORWARDED_TO_DOCTOR',
        'CLAIM_DOCTOR_VERIFIED',
        'CLAIM_SETTLED',
        'CLAIM_ON_HOLD',
        'EMERGENCY_SOS',
        'SOS_RESOLVED',
        'MEDICINE_MISSED',
        'MEDICINE_ACKNOWLEDGED',
        'CONSENT_REQUESTED',
        'CONSENT_VERIFIED',
        'PATIENT_ENROLLED'
      ]

      for (const t of eventTypes) {
        this.eventSource.addEventListener(t, (e: MessageEvent) => {
          try {
            const data: HealthcareSocketEvent = JSON.parse(e.data)
            this.notifyListeners(data)
          } catch (err) {
            console.error('Failed to parse incoming socket event:', err)
          }
        })
      }
    } catch (err) {
      console.warn('EventSource initialization deferred:', err)
    }
  }

  private notifyListeners(event: HealthcareSocketEvent) {
    for (const listener of this.listeners) {
      try {
        listener(event)
      } catch (err) {
        console.error('Error in socket listener callback:', err)
      }
    }
  }

  public subscribe(listener: EventListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public getStatus() {
    return this.isConnected ? 'connected' : 'disconnected'
  }
}

export const socketClient = new HealthcareSocketClient()
