import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  PhoneCall,
  MapPin,
  Ambulance,
  Activity,
  CheckCircle2,
  Clock,
  Shield,
  User,
  X,
  Radio,
  FileText,
  Navigation,
  RefreshCw
} from 'lucide-react'
import { api } from '../services/api'

interface EmergencySOSModalProps {
  isOpen: boolean
  onClose: () => void
  currentPatient: any
  activeSosEvent: any
  onResolve: () => void
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  currentPatient,
  activeSosEvent,
  onResolve
}) => {
  const [sosData, setSosData] = useState<any>(activeSosEvent)
  const [countdown, setCountdown] = useState<number>(30)
  const [updating, setUpdating] = useState<boolean>(false)

  useEffect(() => {
    setSosData(activeSosEvent)
  }, [activeSosEvent])

  // 30-Second live GPS refresh interval
  useEffect(() => {
    if (!isOpen || !sosData || sosData.status === 'resolved') return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          triggerAutoGpsUpdate()
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, sosData])

  const triggerAutoGpsUpdate = async () => {
    if (!sosData?.id) return
    try {
      setUpdating(true)
      // Jitter coordinate by a few meters to simulate live ambulance/patient motion
      const jitterLat = 19.0760 + (Math.random() - 0.5) * 0.002
      const jitterLng = 72.8777 + (Math.random() - 0.5) * 0.002
      const res = await api.updateSOSGps(sosData.id, {
        latitude: jitterLat,
        longitude: jitterLng,
        statusNote: 'Real-time telemetry GPS beacon active. Dispatched ambulance converging.'
      })
      setSosData(res.sosEvent)
    } catch (err) {
      console.error('Failed to ping GPS:', err)
    } finally {
      setUpdating(false)
    }
  }

  if (!isOpen) return null

  const infoPackage = {
    patientName: currentPatient?.name || 'Rahul Sharma',
    patientId: currentPatient?.patientCode || 'MED-P-10924',
    bloodGroup: currentPatient?.bloodGroup || 'O+',
    allergies: currentPatient?.allergies || ['Penicillin', 'Sulfa Drugs'],
    existingDiseases: currentPatient?.existingDiseases || ['Mild Asthma'],
    currentMedicines: ['Dolo 650mg', 'Levocetirizine 5mg'],
    insuranceDetails: `${currentPatient?.insuranceProvider || 'Star Health'} (Policy: ${currentPatient?.insurancePolicyNumber || 'SH-IND-2026-904128'})`,
    primaryDoctor: 'Dr. Anjali Mehta, MD (+919811001122)'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-red-200 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Urgent Header Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold tracking-tight uppercase">Medical Emergency SOS Active</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider animate-bounce">
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-red-100 font-medium">Multi-Channel Broadcast to Doctor, Lilavati ER, Star Health & Family</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-red-200 uppercase font-bold">Auto GPS Ping</p>
              <p className="text-sm font-mono font-bold">{countdown}s</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Quick Metrics & ETA */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
                <Ambulance className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase">Ambulance ETA</p>
                <p className="text-base font-bold text-slate-900 font-mono">{sosData?.ambulanceEtaMinutes || 6} Minutes</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase">Blood Group</p>
                <p className="text-base font-bold text-teal-800">{infoPackage.bloodGroup} (Verified)</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase">Nearest ER Center</p>
                <p className="text-xs font-bold text-slate-800 truncate">{sosData?.nearestHospital || 'Lilavati Hospital & Research'}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase">Cashless TPA</p>
                <p className="text-xs font-bold text-emerald-700">Pre-Authorized 100%</p>
              </div>
            </div>
          </div>

          {/* Live GPS Map Simulation & Location Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Live GPS Location & Route Tracking</span>
              </div>
              <button
                onClick={triggerAutoGpsUpdate}
                disabled={updating}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${updating ? 'animate-spin' : ''}`} />
                <span>Sync Beacon Now</span>
              </button>
            </div>

            {/* Simulated Live Map Canvas */}
            <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex flex-col justify-between p-4">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <Navigation className="w-4 h-4 text-teal-400 animate-spin" />
                  <span className="text-xs font-mono text-white">
                    GPS: {sosData?.latitude?.toFixed(4) || 19.0760}° N, {sosData?.longitude?.toFixed(4) || 72.8777}° E
                  </span>
                </div>
                <div className="bg-red-500/30 text-red-200 text-xs px-2.5 py-1 rounded-xl border border-red-500/40 font-semibold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping mr-1" />
                  Live Ambulance En Route (Speed: 52 km/h)
                </div>
              </div>

              {/* Graphic Pin Representation */}
              <div className="relative z-10 flex items-center justify-around my-auto">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-red-600/40 border-2 border-red-500 flex items-center justify-center animate-bounce">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white mt-1">Patient Spot (BKC)</span>
                </div>

                <div className="flex-1 max-w-xs mx-4 border-t-2 border-dashed border-teal-400 relative">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-950 px-2 py-0.5 rounded text-[10px] text-teal-400 font-mono">
                    1.4 km away
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-teal-600/40 border-2 border-teal-400 flex items-center justify-center">
                    <Ambulance className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white mt-1">Lilavati Ambulance</span>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between text-xs text-slate-300">
                <span className="truncate max-w-md">{sosData?.address || 'Near Bandra Kurla Complex (BKC), Mumbai, MH'}</span>
                <span className="text-emerald-400 font-semibold">Real-Time Refresh Active</span>
              </div>
            </div>
          </div>

          {/* SOS Information Package (Auto-sent to ER & Doctor) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Transmitted Emergency Information Package
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <p className="text-slate-500 font-semibold">Patient Identity & Clinical Conditions:</p>
                <p className="text-slate-900 font-bold">{infoPackage.patientName} ({infoPackage.patientId})</p>
                <p className="text-amber-800">
                  <span className="font-semibold text-slate-500">Allergies: </span>
                  {infoPackage.allergies?.join(', ') || 'None'}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-500">Existing Conditions: </span>
                  {infoPackage.existingDiseases?.join(', ') || 'None'}
                </p>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <p className="text-slate-500 font-semibold">Physician & Insurance Policy:</p>
                <p className="text-slate-900 font-bold">{infoPackage.primaryDoctor}</p>
                <p className="text-slate-700">{infoPackage.insuranceDetails}</p>
                <p className="text-teal-800 font-medium">
                  <span className="font-semibold text-slate-500">Current Medications: </span>
                  {infoPackage.currentMedicines?.join(', ') || 'None'}
                </p>
              </div>
            </div>
          </div>

          {/* Multi-Channel Dispatch Logs */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Multi-Channel Broadcast Status:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PhoneCall className="w-4 h-4 text-teal-600" />
                  <span className="text-slate-800 font-medium">Primary Doctor (Dr. Anjali Mehta)</span>
                </div>
                <span className="text-emerald-700 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> SMS + IVRS Sent
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Ambulance className="w-4 h-4 text-red-600" />
                  <span className="text-slate-800 font-medium">Lilavati Hospital ER Triage</span>
                </div>
                <span className="text-emerald-700 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> ER Bed Reserved
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-800 font-medium">Star Health Emergency Desk</span>
                </div>
                <span className="text-emerald-700 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Claim Opened
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <span className="text-slate-800 font-medium">Top 3 Family Members</span>
                </div>
                <span className="text-emerald-700 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> SMS & Call Alerted
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              Emergency tracking active. Doctor and family can continuously track until resolved.
            </span>
            <div className="flex items-center space-x-3">
              <button
                onClick={onResolve}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wide transition shadow-md shadow-emerald-600/20"
              >
                Mark SOS as Resolved
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Keep Tracking in Background
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
