import React, { useState, useEffect } from 'react'
import {
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Building2,
  Users,
  Smartphone,
  AlertOctagon,
  Globe,
  UserCheck,
  LogIn,
  Radio,
  Zap
} from 'lucide-react'
import { useTranslation, Language } from '../i18n/translations'
import { socketClient } from '../services/socket.ts'

interface NavbarProps {
  currentPortal: 'patient' | 'doctor' | 'insurance' | 'family' | 'admin' | 'mobile' | 'login'
  setCurrentPortal: (portal: 'patient' | 'doctor' | 'insurance' | 'family' | 'admin' | 'mobile' | 'login') => void
  currentPersona: any
  onSwitchPersona: (email: string) => void
  allUsers: any[]
  language: Language
  setLanguage: (lang: Language) => void
  onTriggerSOS: () => void
  activeSOSCount: number
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPortal,
  setCurrentPortal,
  currentPersona,
  onSwitchPersona,
  allUsers,
  language,
  setLanguage,
  onTriggerSOS,
  activeSOSCount
}) => {
  const t = useTranslation(language)
  const [socketConnected, setSocketConnected] = useState(true)

  useEffect(() => {
    const unsubscribe = socketClient.subscribe(() => {
      setSocketConnected(true)
    })
    return () => unsubscribe()
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand with Hospital Clinical Aesthetic */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setCurrentPortal('patient')}
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center shadow-sm shadow-teal-600/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">{t.brandName}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  AI 2.0
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t.systemLive}</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium -mt-0.5">{t.brandTagline}</p>
            </div>
          </div>

          {/* Portal Navigation Tabs - Featuring Family Portal */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setCurrentPortal('patient')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPortal === 'patient'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.navPatient}</span>
            </button>

            <button
              onClick={() => setCurrentPortal('doctor')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPortal === 'doctor'
                  ? 'bg-white text-blue-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.navDoctor}</span>
            </button>

            <button
              onClick={() => setCurrentPortal('insurance')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPortal === 'insurance'
                  ? 'bg-white text-indigo-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.navInsurance}</span>
            </button>

            {/* Prominent Family Portal in Navigation */}
            <button
              onClick={() => setCurrentPortal('family')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPortal === 'family'
                  ? 'bg-white text-purple-800 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-purple-600" />
              <span>{t.navFamily}</span>
            </button>

            <button
              onClick={() => setCurrentPortal('mobile')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPortal === 'mobile'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-600" />
              <span>{t.navMobile}</span>
            </button>

            <button
              onClick={() => setCurrentPortal('admin')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                currentPortal === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.navAdmin}</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2.5">
            
            {/* Dynamic Language Switcher */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 text-xs font-medium">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition ${language === 'en' ? 'bg-white text-teal-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg transition ${language === 'hi' ? 'bg-white text-teal-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage('mr')}
                className={`px-2.5 py-1 rounded-lg transition ${language === 'mr' ? 'bg-white text-teal-800 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                मराठी
              </button>
            </div>

            {/* Emergency SOS Button */}
            <button
              onClick={onTriggerSOS}
              className="relative group overflow-hidden flex items-center space-x-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold tracking-wide shadow-sm shadow-red-600/30 transition-all transform active:scale-95 animate-pulse"
            >
              <AlertOctagon className="w-4 h-4 text-white stroke-[2.2]" />
              <span>{t.sosButton}</span>
              {activeSOSCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
              )}
            </button>

            {/* Persona Switcher Quick Dropdown */}
            <div className="relative">
              <select
                value={currentPersona?.email || 'rahul@medisense.ai'}
                onChange={(e) => onSwitchPersona(e.target.value)}
                className="bg-white border border-slate-200 hover:border-teal-500 text-slate-800 text-xs font-medium rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs appearance-none cursor-pointer"
              >
                <optgroup label="Patients (Demo Profiles)">
                  <option value="rahul@medisense.ai">👤 Rahul Sharma (Fever)</option>
                  <option value="priya@medisense.ai">👤 Priya Patel (Diabetes)</option>
                  <option value="amit@medisense.ai">👤 Amit Verma (Hypertension)</option>
                </optgroup>
                <optgroup label="Physicians / Specialists">
                  <option value="anjali@medisense.ai">🩺 Dr. Anjali Mehta, MD</option>
                  <option value="dr.iyer@medisense.ai">🩺 Dr. Rajesh Iyer, DM</option>
                </optgroup>
                <optgroup label="Insurance Adjudicators">
                  <option value="claims@starhealth.in">🛡️ Star Health Claims AI</option>
                </optgroup>
                <optgroup label="System Administration">
                  <option value="admin@medisense.ai">⚙️ Super Admin</option>
                </optgroup>
              </select>
              <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Login / Auth Portal Button */}
            <button
              onClick={() => setCurrentPortal(currentPortal === 'login' ? 'patient' : 'login')}
              className={`p-2 rounded-xl border transition ${
                currentPortal === 'login'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Authentication / Sign In"
            >
              <LogIn className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  )
}
