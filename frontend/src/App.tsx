import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { PatientPortal } from './components/PatientPortal'
import { DoctorPortal } from './components/DoctorPortal'
import { InsurancePortal } from './components/InsurancePortal'
import { FamilyPortal } from './components/FamilyPortal'
import { AdminDashboard } from './components/AdminDashboard'
import { MobileViewFrame } from './components/MobileViewFrame'
import { EmergencySOSModal } from './components/EmergencySOSModal'
import { LoginPage } from './components/LoginPage'
import { api } from './services/api'

export function App() {
  const [currentPortal, setCurrentPortal] = useState<'patient' | 'doctor' | 'insurance' | 'family' | 'admin' | 'mobile' | 'login'>('doctor')
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en')
  const [currentPersona, setCurrentPersona] = useState<any>(null)
  const [currentPatient, setCurrentPatient] = useState<any>(null)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [activeSosEvent, setActiveSosEvent] = useState<any>(null)
  const [showSosModal, setShowSosModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    bootstrapApp()
  }, [])

  const bootstrapApp = async () => {
    try {
      setLoading(true)
      const personas = await api.getDemoPersonas()
      setAllUsers(personas.users || [])
      
      // Default to Dr. Anjali Mehta so the AI prescription approval queue is visible immediately
      const defaultUser = personas.users?.find((u: any) => u.email === 'dr.anjali@medisense.ai') || personas.users?.[0]
      const defaultPatient = personas.patients?.[0]
      
      setCurrentPersona(defaultUser)
      if (defaultPatient) {
        const fullPatient = await api.getPatient(defaultPatient.id)
        setCurrentPatient(fullPatient)
      }

      // Check active SOS
      const activeSosList = await api.getActiveSOS()
      if (activeSosList && activeSosList.length > 0) {
        setActiveSosEvent(activeSosList[0])
      }
    } catch (err) {
      console.error('Failed to bootstrap Medisense app:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchPersona = async (email: string) => {
    try {
      const res = await api.switchPersona(email)
      setCurrentPersona(res.user)
      if (res.user.role === 'patient' && res.patientProfile) {
        const full = await api.getPatient(res.patientProfile.id)
        setCurrentPatient(full)
        if (currentPortal !== 'mobile') {
          setCurrentPortal('patient')
        }
      } else if (res.user.role === 'doctor') {
        if (currentPortal !== 'mobile') setCurrentPortal('doctor')
      } else if (res.user.role === 'insurance') {
        if (currentPortal !== 'mobile') setCurrentPortal('insurance')
      } else if (res.user.role === 'admin') {
        if (currentPortal !== 'mobile') setCurrentPortal('admin')
      }
    } catch (err) {
      console.error('Failed to switch persona:', err)
    }
  }

  const handleLogin = async (identifier: string, method?: 'otp' | 'password' | 'demo', credential?: string) => {
    if (method === 'demo') {
      await handleSwitchPersona(identifier)
      return
    }

    const result = method === 'otp'
      ? await api.verifyOtp(identifier, credential || '')
      : await api.login(identifier, credential)
    const user = result.user
    setCurrentPersona(user)

    if (user.role === 'patient') {
      let patientProfile = result.patientProfile
      if (!patientProfile) {
        const personas = await api.getDemoPersonas()
        patientProfile = personas.patients?.find((patient: any) => patient.userId === user.id)
      }
      if (patientProfile) setCurrentPatient(await api.getPatient(patientProfile.id))
      setCurrentPortal('patient')
    } else if (user.role === 'doctor') {
      setCurrentPortal('doctor')
    } else if (user.role === 'insurance') {
      setCurrentPortal('insurance')
    }
  }

  const handleTriggerSOS = async () => {
    try {
      const patientId = currentPatient?.id || 1
      const res = await api.triggerSOS({
        patientId,
        latitude: 19.0760,
        longitude: 72.8777,
        address: 'Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051'
      })
      setActiveSosEvent(res.sosEvent)
      setShowSosModal(true)
    } catch (err) {
      console.error('Failed to trigger SOS:', err)
      setShowSosModal(true)
    }
  }

  const handleResolveSOS = async () => {
    if (!activeSosEvent?.id) return
    try {
      await api.resolveSOS(activeSosEvent.id)
      setActiveSosEvent(null)
      setShowSosModal(false)
      alert('Emergency SOS resolved. All dispatched care teams updated.')
    } catch (err) {
      console.error('Failed to resolve SOS:', err)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f7f2] text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentPortal={currentPortal}
        setCurrentPortal={setCurrentPortal}
        currentPersona={currentPersona}
        onSwitchPersona={handleSwitchPersona}
        allUsers={allUsers}
        language={language}
        setLanguage={setLanguage}
        onTriggerSOS={handleTriggerSOS}
        activeSOSCount={activeSosEvent ? 1 : 0}
      />

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-600 font-semibold">Bootstrapping Medisense AI Healthcare Ecosystem...</p>
          </div>
        ) : (
          <>
            {currentPortal === 'login' && (
              <LoginPage
                onLogin={handleLogin}
                onCancel={() => setCurrentPortal('patient')}
              />
            )}

            {currentPortal === 'patient' && (
              <PatientPortal
                currentPatient={currentPatient}
                language={language}
                setLanguage={setLanguage}
                onTriggerSOS={handleTriggerSOS}
              />
            )}

            {currentPortal === 'doctor' && (
              <DoctorPortal />
            )}

            {currentPortal === 'insurance' && (
              <InsurancePortal />
            )}

            {currentPortal === 'family' && (
              <FamilyPortal
                currentPatient={currentPatient}
                activeSosEvent={activeSosEvent}
                onTriggerSOS={handleTriggerSOS}
              />
            )}

            {currentPortal === 'admin' && (
              <AdminDashboard />
            )}

            {currentPortal === 'mobile' && (
              <MobileViewFrame
                currentPatient={currentPatient}
                language={language}
                setLanguage={setLanguage}
                onTriggerSOS={handleTriggerSOS}
              />
            )}
          </>
        )}

      </main>

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
        currentPatient={currentPatient}
        activeSosEvent={activeSosEvent}
        onResolve={handleResolveSOS}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 shadow-2xs">
        <p className="font-semibold text-slate-700">
          Medisense AI Ecosystem • Connected Healthcare Platform
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          ABHA Compliant • Self-Sovereign Healthcare ID • AES-GCM-256 Storage • OpenRouter & Clinical Inference Engine
        </p>
      </footer>

    </div>
  )
}

export default App
