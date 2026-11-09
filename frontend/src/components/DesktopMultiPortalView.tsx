import React from 'react'
import {
  Users,
  Stethoscope,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react'
import { HealthVaultView } from './HealthVaultView'
import { AIDoctorChat } from './AIDoctorChat'
import { MedicineManager } from './MedicineManager'
import { DoctorPortal } from './DoctorPortal'
import { InsurancePortal } from './InsurancePortal'

interface DesktopMultiPortalViewProps {
  currentPatient: any
  language: 'en' | 'hi' | 'mr'
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void
  onTriggerSOS: () => void
  onNavigateToPortal: (portal: 'patient' | 'doctor' | 'insurance') => void
}

export const DesktopMultiPortalView: React.FC<DesktopMultiPortalViewProps> = ({
  currentPatient,
  language,
  setLanguage,
  onTriggerSOS,
  onNavigateToPortal
}) => {
  return (
    <div className="space-y-6">

      {/* Executive Investor Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-extrabold uppercase tracking-wider">
              Connected Healthcare Ecosystem
            </span>
            <span className="text-xs text-slate-400">All 3 Portals Live & Interconnected</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Medisense AI Executive Operations Matrix
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Real-time synchronization between Patient Portal, Doctor/Hospital Portal, and Insurance Underwriting. Any action in one portal instantly propagates across the entire healthcare continuum.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onTriggerSOS}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition shadow-lg shadow-red-600/30 flex items-center space-x-1.5 animate-pulse"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Test Emergency SOS</span>
          </button>
        </div>
      </div>

      {/* 3-Column Side-by-Side Tri-Portal Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLUMN 1: PATIENT PORTAL */}
        <div className="rounded-2xl glass-panel border border-slate-800 p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Patient Portal</h2>
                  <p className="text-[10px] text-slate-400">Self-Sovereign Health Vault & AI Doctor</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToPortal('patient')}
                className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center space-x-1"
              >
                <span>Full View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Patient Snapshot */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{currentPatient?.name || 'Rahul Sharma'}</p>
                  <p className="text-[10px] font-mono text-slate-400">{currentPatient?.universalHealthId}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 text-xs font-bold">
                  {currentPatient?.bloodGroup || 'O+'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1 border-t border-slate-800">
                <div>
                  <p className="text-slate-400">Health Score</p>
                  <p className="text-xs font-bold text-teal-400">{currentPatient?.healthScore || 88}/100</p>
                </div>
                <div>
                  <p className="text-slate-400">Compliance</p>
                  <p className="text-xs font-bold text-emerald-400">{currentPatient?.complianceScore || 95}%</p>
                </div>
                <div>
                  <p className="text-slate-400">Disease Risk</p>
                  <p className="text-xs font-bold text-amber-300">{currentPatient?.diseaseRiskScore || 'Low'}</p>
                </div>
              </div>
            </div>

            {/* AI Health Doctor Chat Mini */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-300">AI Health Doctor</span>
                <span className="text-[10px] text-teal-400 font-mono">Llama 3.3 70B</span>
              </div>
              <AIDoctorChat
                currentPatient={currentPatient}
                language={language}
                setLanguage={setLanguage}
              />
            </div>
          </div>
        </div>

        {/* COLUMN 2: DOCTOR / HOSPITAL PORTAL */}
        <div className="rounded-2xl glass-panel border border-slate-800 p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Doctor / Hospital</h2>
                  <p className="text-[10px] text-slate-400">AI Prescription Review & Copilot Alerts</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToPortal('doctor')}
                className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center space-x-1"
              >
                <span>Full View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Doctor Portal Component */}
            <DoctorPortal />
          </div>
        </div>

        {/* COLUMN 3: INSURANCE PORTAL */}
        <div className="rounded-2xl glass-panel border border-slate-800 p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Insurance Portal</h2>
                  <p className="text-[10px] text-slate-400">AI Risk Scoring & Automated Claims</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToPortal('insurance')}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <span>Full View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Insurance Portal Component */}
            <InsurancePortal />
          </div>
        </div>

      </div>

    </div>
  )
}
