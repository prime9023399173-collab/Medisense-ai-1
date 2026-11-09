import React, { useState } from 'react'
import { api } from '../services/api'

interface LoginPageProps {
  onLogin: (identifier: string, method?: 'otp' | 'password' | 'demo', credential?: string) => void | Promise<void>
  onCancel?: () => void
}

const demoAccounts = {
  patient: { email: 'rahul@medisense.ai', phone: '+919820112233' },
  doctor: { email: 'dr.anjali@medisense.ai', phone: '+919811001122' },
  insurance: { email: 'insurance@medisense.ai', phone: '+911800200889' }
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor' | 'insurance'>('patient')
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp')
  const [identifier, setIdentifier] = useState(demoAccounts.patient.phone)
  const [password, setPassword] = useState('demo123')
  const [otp, setOtp] = useState('882910')
  const [otpSent, setOtpSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleDemoQuickSelect = (email: string, tab: 'patient' | 'doctor' | 'insurance') => {
    setActiveTab(tab)
    onLogin(email, 'demo')
  }

  const handleSendOtp = async () => {
    try {
      setBusy(true)
      setErrorMessage('')
      await api.sendOtp(identifier.includes('@') ? '' : identifier, identifier.includes('@') ? identifier : undefined)
      setOtpSent(true)
      setErrorMessage('Demo code sent. Use 882910.')
    } catch (error: any) {
      setErrorMessage(error.message || 'Could not send verification code.')
    } finally {
      setBusy(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setBusy(true)
      setErrorMessage('')
      await onLogin(identifier, authMethod, authMethod === 'otp' ? otp : password)
    } catch (error: any) {
      setErrorMessage(error.message || 'Sign-in failed. Check your account and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-xl bg-white border border-slate-200 shadow-xl rounded-3xl p-8 md:p-10 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Medisense AI Authentication</h1>
          <p className="text-xs text-slate-500 mt-1">Unified Secure Healthcare Gateway • ABHA & Role-Based Access</p>
        </div>

        {/* Portal Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('patient')
              setIdentifier(authMethod === 'otp' ? demoAccounts.patient.phone : demoAccounts.patient.email)
            }}
            className={`py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
              activeTab === 'patient'
                ? 'bg-white text-teal-700 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👤 Patient Portal</span>
            <span className="text-[10px] font-normal text-slate-400">Health ID & Meds</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('doctor')
              setIdentifier(authMethod === 'otp' ? demoAccounts.doctor.phone : demoAccounts.doctor.email)
            }}
            className={`py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
              activeTab === 'doctor'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🩺 Doctor Portal</span>
            <span className="text-[10px] font-normal text-slate-400">Roster & Claims</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('insurance')
              setIdentifier(authMethod === 'otp' ? demoAccounts.insurance.phone : demoAccounts.insurance.email)
            }}
            className={`py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
              activeTab === 'insurance'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🛡️ Insurance Portal</span>
            <span className="text-[10px] font-normal text-slate-400">Claims & Payout</span>
          </button>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5 text-xs">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp')
                setIdentifier(demoAccounts[activeTab].phone)
              }}
              className={`pb-1 border-b-2 font-medium ${
                authMethod === 'otp' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500'
              }`}
            >
              Mobile / OTP Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password')
                setIdentifier(demoAccounts[activeTab].email)
              }}
              className={`pb-1 border-b-2 font-medium ${
                authMethod === 'password' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500'
              }`}
            >
              Email & Password
            </button>
          </div>
          <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
            256-bit Encrypted
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {authMethod === 'otp' ? 'Registered Mobile Number / ABHA ID' : 'Institutional Email Address'}
            </label>
            <input
              type={authMethod === 'otp' ? 'tel' : 'email'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder={authMethod === 'otp' ? '+91 98201 12345 or MED-P-10924' : 'doctor@medisense.ai'}
              required
            />
          </div>

          {authMethod === 'otp' ? (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">6-Digit Verification Code</label>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-[11px] text-teal-600 hover:text-teal-700 font-medium"
                >
                  {otpSent ? 'Resend OTP' : 'Send One-Time Passcode'}
                </button>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full tracking-widest text-center font-mono font-bold text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                placeholder="882910"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                required
              />
            </div>
          )}

          {errorMessage && <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">{errorMessage}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{busy ? 'Signing in...' : `Sign In to ${activeTab === 'patient' ? 'Patient Portal' : activeTab === 'doctor' ? 'Doctor Portal' : 'Insurance Portal'}`}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>

        {/* 1-Click Fast Demo Personas for Evaluation */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick 1-Click Demo Evaluation Profiles
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoQuickSelect('rahul@medisense.ai', 'patient')}
              className="p-2.5 rounded-xl border border-teal-100 bg-teal-50/50 hover:bg-teal-50 text-left transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold">
                  RS
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-teal-700">Rahul Sharma</p>
                  <p className="text-[10px] text-slate-500">Patient • Viral Fever</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoQuickSelect('dr.anjali@medisense.ai', 'doctor')}
              className="p-2.5 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 text-left transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  AM
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">Dr. Anjali Mehta</p>
                  <p className="text-[10px] text-slate-500">Chief Physician, MD</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoQuickSelect('insurance@medisense.ai', 'insurance')}
              className="p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-left transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  SH
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">Star Health</p>
                  <p className="text-[10px] text-slate-500">Claims Adjudicator</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {onCancel && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Back to Portal
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
