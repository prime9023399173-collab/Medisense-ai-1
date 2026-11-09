// Real-Time Event Streaming & Socket Broadcast Service for Medisense AI

export interface HealthcareEvent {
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

type ClientConnection = (event: HealthcareEvent) => void

class HealthcareEventBus {
  private clients: Set<ClientConnection> = new Set()
  private eventHistory: HealthcareEvent[] = []

  // Subscribe a client (SSE or WebSocket listener)
  public subscribe(client: ClientConnection): () => void {
    this.clients.add(client)
    return () => {
      this.clients.delete(client)
    }
  }

  // Broadcast event to all listening portals
  public broadcast(eventData: Omit<HealthcareEvent, 'id' | 'timestamp'>): HealthcareEvent {
    const event: HealthcareEvent = {
      ...eventData,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString()
    }

    // Retain recent 50 events in memory
    this.eventHistory.unshift(event)
    if (this.eventHistory.length > 50) this.eventHistory.pop()

    // Notify all active listeners
    for (const client of this.clients) {
      try {
        client(event)
      } catch (err) {
        this.clients.delete(client)
      }
    }

    console.log(`[EventBus] Broadcast [${event.type}] -> ${event.portal.toUpperCase()}: ${event.title}`)
    return event
  }

  // Get recent events for cold-starting clients
  public getRecentEvents(portal?: string): HealthcareEvent[] {
    if (!portal || portal === 'all') return this.eventHistory
    return this.eventHistory.filter(e => e.portal === 'all' || e.portal === portal)
  }

  public getSubscriberCount(): number {
    return this.clients.size
  }
}

export const eventBus = new HealthcareEventBus()
