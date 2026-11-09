import React, { useState } from 'react'
import {
  HeartPulse,
  Pill,
  Bot,
  AlertOctagon,
  FolderLock,
  User,
  Activity,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Ambulance,
  PhoneCall,
  Stethoscope,
  Building2,
  Plus
} from 'lucide-react'
import { PatientInsuranceDialog } from './PatientInsuranceDialog'

interface MobileViewFrameProps {
  currentPatient: any
  language: 'en' | 'hi' | 'mr'
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void
  onTriggerSOS: () => void
}

export const MobileViewFrame: React.FC<MobileViewFrameProps> = ({
  currentPatient,
  language,
  setLanguage,
  onTriggerSOS
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'meds' | 'claims' | 'vault'>('home')
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="text-center mb-6">
        <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold uppercase tracking-wider">
          React Native Mobile Application Preview
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-1.5">Medisense AI Mobile Companion</h2>
        <p className="text-xs text-slate-500">Cross-Platform iOS & Android Native UI with 1-Tap SOS and Insurance Automation</p>
      </div>

      {/* Smartphone Chassis - Clean Elegant Light Framing */}
      <div className="w-[380px] h-[780px] bg-slate-900 border-[10px] border-slate-300 rounded-[50px] shadow-2xl shadow-slate-400/20 flex flex-col overflow-hidden relative ring-1 ring-slate-400">
        
        {/* Dynamic Island / Header Notch */}
        <div className="h-7 w-full flex items-center justify-between px-7 pt-2 shrink-0 z-30 bg-white">
          <span className="text-[10px] font-bold text-slate-800 font-mono">09:41</span>
          <div className="w-20 h-4 bg-slate-900 rounded-full" />
          <div className="flex items-center space-x-1 text-[10px] text-slate-800">
            <span>5G</span>
            <div className="w-3.5 h-2 rounded-sm border border-slate-800 p-0.5 flex items-center">
              <div className="w-full h-full bg-slate-800 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Mobile View Scrollable Screen Content */}
        <div className="flex-1 bg-[#f8fafc] overflow-y-auto p-4 space-y-4 pb-20 pt-2">
          
          {/* TAB: HOME */}
          {activeTab === 'home' && (
            <div className="space-y-4">
              {/* Profile Bar */}
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-teal-700">
                    {currentPatient?.name?.[0] || 'R'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-none">{currentPatient?.name || 'Rahul Sharma'}</h3>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">{currentPatient?.patientCode || 'MED-P-10924'}</p>
                  </div>
                </div>

                <button
                  onClick={onTriggerSOS}
                  className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/30 animate-pulse"
                  title="Single-Tap Emergency SOS"
                >
                  <AlertOctagon className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>

              {/* Health Score Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-between shadow-md shadow-teal-600/20">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-teal-100">Live Health Score</p>
                  <p className="text-2xl font-black">{currentPatient?.healthScore || 88}/100</p>
                  <p className="text-[10px] text-teal-100 mt-0.5">Optimal Vital Parameters</p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-white/30 flex items-center justify-center text-xs font-bold">
                  95%
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setShowInsuranceDialog(true)}
                  className="p-3 rounded-2xl bg-white border border-slate-200 text-left space-y-1 shadow-2xs hover:border-teal-400 transition"
                >
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <p className="font-bold text-slate-900">Insurance Claim</p>
                  <p className="text-[10px] text-slate-500">Submit & Track Payout</p>
                </button>

                <button
                  onClick={() => alert('Opening AI Doctor Chat in Mobile App...')}
                  className="p-3 rounded-2xl bg-white border border-slate-200 text-left space-y-1 shadow-2xs hover:border-teal-400 transition"
                >
                  <Bot className="w-5 h-5 text-teal-600" />
                  <p className="font-bold text-slate-900">AI Consult</p>
                  <p className="text-[10px] text-slate-500">Chat / Voice / Video</p>
                </button>
              </div>

              {/* Today's Medicines Checklist */}
              <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 uppercase">Today's Medication</span>
                  <span className="text-[10px] font-bold text-teal-600">Compliance: 96%</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Dolo 650mg</p>
                      <p className="text-[10px] text-slate-500">09:00 AM • After Breakfast</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Taken ✓
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Levocetirizine 5mg</p>
                      <p className="text-[10px] text-slate-500">09:30 PM • Before Sleep</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                    Pending
                  </span>
                </div>
              </div>

              {/* Emergency SOS Banner */}
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-rose-900">Emergency Protocol Ready</p>
                  <p className="text-[10px] text-rose-700">Lilavati Hospital ER, Dr. Anjali & 3 Family members</p>
                </div>
                <button
                  onClick={onTriggerSOS}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  Test SOS
                </button>
              </div>

            </div>
          )}

          {/* TAB: MEDS */}
          {activeTab === 'meds' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Active Prescriptions</h4>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-900">Dolo 650mg (Paracetamol)</span>
                <p className="text-[11px] text-slate-500">1 Tablet Twice Daily • 5 Days</p>
                <p className="text-[10px] text-emerald-700 font-medium">Verified by Dr. Anjali Mehta, MD</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-900">Levocetirizine 5mg</span>
                <p className="text-[11px] text-slate-500">1 Tablet Nightly • 3 Days</p>
                <p className="text-[10px] text-emerald-700 font-medium">For allergic rhinitis symptoms</p>
              </div>
            </div>
          )}

          {/* TAB: CLAIMS */}
          {activeTab === 'claims' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Insurance Claims</h4>
                <button
                  onClick={() => setShowInsuranceDialog(true)}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-[11px] font-bold"
                >
                  + New Claim
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-teal-700">CLM-2026-9041</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Settled</span>
                </div>
                <p className="text-xs text-slate-800 font-semibold">Max Super Speciality Hospital</p>
                <p className="text-[11px] text-slate-500">Claimed: ₹18,500 • Settled via IMPS Payout</p>
              </div>
            </div>
          )}

          {/* TAB: VAULT */}
          {activeTab === 'vault' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Encrypted Health Vault</h4>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs space-y-1">
                <p className="font-bold text-slate-900">Complete Blood Count (CBC)</p>
                <p className="text-[10px] text-slate-500">Dr. Lal PathLabs • Stored on Google Drive</p>
                <span className="text-[10px] font-mono text-teal-700">SHA-256 Verified ✓</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs space-y-1">
                <p className="font-bold text-slate-900">Digital Chest X-Ray PA</p>
                <p className="text-[10px] text-slate-500">Lilavati Hospital • Stored on OneDrive</p>
                <span className="text-[10px] font-mono text-teal-700">SHA-256 Verified ✓</span>
              </div>
            </div>
          )}

        </div>

        {/* Bottom App Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-6 flex items-center justify-between z-30">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-0.5 ${
              activeTab === 'home' ? 'text-teal-600 font-bold' : 'text-slate-400'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('meds')}
            className={`flex flex-col items-center space-y-0.5 ${
              activeTab === 'meds' ? 'text-teal-600 font-bold' : 'text-slate-400'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span className="text-[10px]">Meds</span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`flex flex-col items-center space-y-0.5 ${
              activeTab === 'claims' ? 'text-teal-600 font-bold' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px]">Claims</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex flex-col items-center space-y-0.5 ${
              activeTab === 'vault' ? 'text-teal-600 font-bold' : 'text-slate-400'
            }`}
          >
            <FolderLock className="w-4 h-4" />
            <span className="text-[10px]">Vault</span>
          </button>
        </div>

      </div>

      {/* Insurance Claims Dialog for Mobile View */}
      <PatientInsuranceDialog
        isOpen={showInsuranceDialog}
        onClose={() => setShowInsuranceDialog(false)}
        currentPatient={currentPatient}
      />

    </div>
  )
}
