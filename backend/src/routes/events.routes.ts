import { Hono } from 'hono'
import { eventBus, HealthcareEvent } from '../services/socket-service'

export const eventsRoutes = new Hono()

// SSE Stream Endpoint for real-time live events across all portals
eventsRoutes.get('/stream', (c) => {
  const portal = c.req.query('portal') || 'all'

  // Set standard Server-Sent Events headers
  const body = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Send initial handshake
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'connected', portal, timestamp: new Date().toISOString() })}\n\n`)
      )

      // Subscribe to eventBus
      const unsubscribe = eventBus.subscribe((evt: HealthcareEvent) => {
        try {
          if (portal === 'all' || evt.portal === 'all' || evt.portal === portal) {
            controller.enqueue(
              encoder.encode(`event: ${evt.type}\ndata: ${JSON.stringify(evt)}\n\n`)
            )
          }
        } catch (err) {
          unsubscribe()
        }
      })

      // Clean up when client disconnects
      c.req.raw.signal.addEventListener('abort', () => {
        unsubscribe()
      })
    }
  })

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  })
})

// Get recent events history
eventsRoutes.get('/recent', (c) => {
  const portal = c.req.query('portal')
  return c.json(eventBus.getRecentEvents(portal))
})

// Manual broadcast trigger
eventsRoutes.post('/broadcast', async (c) => {
  const body = await c.req.json()
  const event = eventBus.broadcast({
    type: body.type || 'PRESCRIPTION_FORWARDED',
    portal: body.portal || 'all',
    title: body.title || 'Healthcare Event Notification',
    message: body.message || 'An event occurred in the ecosystem',
    patientId: body.patientId,
    patientName: body.patientName,
    data: body.data
  })
  return c.json({ success: true, event })
})
