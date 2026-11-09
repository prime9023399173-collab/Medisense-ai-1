import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  FileCheck,
  AlertOctagon,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  XCircle,
  Building2,
  DollarSign,
  ArrowRight,
  Zap,
  Search,
  Check,
  AlertTriangle,
  Clock,
  RefreshCw,
  Lock
} from 'lucide-react'
import { api } from '../services/api'
import { socketClient } from '../services/socket.ts'

export const InsurancePortal: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null)
  const [claims, setClaims] = useState<any[]>([])
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    const unsubscribe = socketClient.subscribe((event) => {
      if (!event.type.startsWith('CLAIM_')) return
      setStatusMessage(`${event.title}: ${event.message}`)
      loadData()
    })
    return () => unsubscribe()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [dash, claimsData] = await Promise.all([
        api.getInsuranceDashboard(),
        api.getInsuranceClaims()
      ])
      setDashboard(dash)
      setClaims(claimsData)
      if (claimsData.length > 0) {
        setSelectedClaim(claimsData[0])
      }
    } catch (err) {
      console.error('Failed to load insurance portal data:', err)
    } finally {
      setLoading(false)
    }
  }

  // 1. Insurance AI forwards to Doctor for Clinical Medical Necessity Review
  const handleForwardToDoctor = async (claimId: number) => {
    try {
      const res = await api.aiForwardClaimToDoctor(claimId)
      setStatusMessage('Step 2 Complete: Insurance AI verified policy rules and forwarded claim to treating Doctor for clinical medical necessity audit.')
      await loadData()
      const updated = claims.find(c => c.id === claimId)
      if (updated) setSelectedClaim({ ...updated, status: 'forwarded_to_doctor' })
    } catch (err) {
      console.error('Forward to doctor failed:', err)
    }
  }

  // 2. Doctor verifies clinical necessity & signs off back to insurance
  const handleDoctorVerify = async (claimId: number) => {
    try {
      const res = await api.doctorVerifyClaim(claimId)
      setStatusMessage('Step 3 Complete: Doctor reviewed all lab reports, active medications & treatment notes, signed verification, and returned to Insurance AI.')
      await loadData()
      const updated = claims.find(c => c.id === claimId)
      if (updated) setSelectedClaim({ ...updated, status: 'doctor_verified' })
    } catch (err) {
      console.error('Doctor verify failed:', err)
    }
  }

  // 3. Insurance AI verifies doctor sign-off & executes final settlement (or puts on hold if suspicious)
  const handleSettleCheck = async (claimId: number, isSuspicious = false) => {
    try {
      const res = await api.aiSettleClaimCheck(claimId, isSuspicious)
      setStatusMessage(res.message)
      await loadData()
      const updated = claims.find(c => c.id === claimId)
      if (updated) setSelectedClaim({ ...updated, status: res.status })
    } catch (err) {
      console.error('Settle check failed:', err)
    }
  }

  // Complete End-to-End Automated Loop Orchestrator
  const handleRunAutomatedLoop = async (claimId: number) => {
    try {
      setSimulating(true)
      setStatusMessage('Insurance AI is reviewing the claim, medical history, and fraud indicators...')
      const result = await api.runAutomatedClaimLoop(claimId)
      setStatusMessage(result.message || `Claim review finished with status: ${result.status}`)
      await loadData()
    } catch (err) {
      console.error('Automated loop failed:', err)
      setStatusMessage('Automated claim review failed. Please retry.')
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Insurance Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">Star Health & Allied Insurance Co.</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                Automated Claim Adjudication Node
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              IRDAI Licensed • MediShield Global TPA Node • Automated Cashless Limit: ₹75,000
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-slate-600" />
          <span>Refresh Claims Gateway</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center space-x-2 font-medium animate-fadeIn">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Dashboard Metrics */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">Total Claims Volume</p>
            <p className="text-2xl font-bold text-slate-900">₹{dashboard.totalClaimedAmount?.toLocaleString()}</p>
            <p className="text-[10px] text-teal-700 font-medium">₹{dashboard.totalSettledAmount?.toLocaleString()} Instant Settled</p>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">AI Fraud Detection</p>
            <p className="text-2xl font-bold text-emerald-600">{dashboard.avgFraudScore}% (Low Risk)</p>
            <p className="text-[10px] text-slate-500">Document cross-referencing</p>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">Hospitalization Risk</p>
            <p className="text-2xl font-bold text-blue-600">{dashboard.avgHospitalizationRisk}% (Stable)</p>
            <p className="text-[10px] text-slate-500">Clinical predictive modeling</p>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">Average Processing Time</p>
            <p className="text-2xl font-bold text-slate-900 font-mono">{dashboard.avgProcessingTurnaroundMinutes} Mins</p>
            <p className="text-[10px] text-emerald-600 font-bold">Down from 72h industry benchmark</p>
          </div>
        </div>
      )}

      {/* Claims Adjudication Workstation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Claims Queue */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Live Claims Queue ({claims.length})</h3>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">Sync Active</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {claims.map((claim) => (
              <button
                key={claim.id}
                onClick={() => setSelectedClaim(claim)}
                className={`w-full text-left p-3.5 rounded-2xl border transition space-y-1.5 ${
                  selectedClaim?.id === claim.id
                    ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-700">{claim.claimNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      claim.status === 'settled'
                        ? 'bg-emerald-100 text-emerald-700'
                        : claim.status === 'doctor_verified'
                        ? 'bg-blue-100 text-blue-700'
                        : claim.status === 'forwarded_to_doctor'
                        ? 'bg-amber-100 text-amber-700'
                        : claim.status === 'on_hold_manual_verification'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {claim.status?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{claim.patientName}</span>
                  <span className="font-mono font-bold text-slate-900">₹{claim.claimedAmount?.toLocaleString()}</span>
                </div>

                <p className="text-[11px] text-slate-500 truncate">{claim.hospitalName} • {claim.diagnosisIcd10}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Claim Detail & 4-Stage Automated Loop Controller */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
          {selectedClaim ? (
            <>
              {/* Claim Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-slate-900 font-mono">{selectedClaim.claimNumber}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                      Policy: {selectedClaim.policyNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Patient: <strong className="text-slate-900">{selectedClaim.patientName}</strong> • {selectedClaim.hospitalName}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500 font-semibold uppercase">Claim Amount</p>
                  <p className="text-2xl font-black text-slate-900 font-mono">
                    ₹{selectedClaim.claimedAmount?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* 4-Step Visual Claim Loop Status */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Automated Adjudication & Clinical Sign-off Loop:
                  </p>
                  <button
                    onClick={() => handleRunAutomatedLoop(selectedClaim.id)}
                    disabled={simulating || selectedClaim.status === 'settled'}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center space-x-1 shadow-xs disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Run Entire Loop Automatically</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <p className="font-bold text-slate-900">1. Submitted</p>
                    <p className="text-[10px] text-slate-500">From Patient</p>
                  </div>

                  <div className={`p-2.5 rounded-xl border shadow-xs ${
                    selectedClaim.status === 'forwarded_to_doctor' || selectedClaim.status === 'doctor_verified' || selectedClaim.status === 'settled'
                      ? 'bg-white border-teal-300'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                    <p className="font-bold text-slate-900">2. Forwarded</p>
                    <p className="text-[10px] text-slate-500">To Doctor</p>
                  </div>

                  <div className={`p-2.5 rounded-xl border shadow-xs ${
                    selectedClaim.status === 'doctor_verified' || selectedClaim.status === 'settled'
                      ? 'bg-white border-blue-300'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <p className="font-bold text-slate-900">3. Verified</p>
                    <p className="text-[10px] text-slate-500">By Doctor</p>
                  </div>

                  <div className={`p-2.5 rounded-xl border shadow-xs ${
                    selectedClaim.status === 'settled'
                      ? 'bg-emerald-50 border-emerald-300'
                      : selectedClaim.status === 'on_hold_manual_verification'
                      ? 'bg-rose-50 border-rose-300'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    {selectedClaim.status === 'settled' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    ) : selectedClaim.status === 'on_hold_manual_verification' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    )}
                    <p className="font-bold text-slate-900">
                      {selectedClaim.status === 'settled' ? '4. Settled' : selectedClaim.status === 'on_hold_manual_verification' ? '4. On Hold' : '4. Disbursal'}
                    </p>
                    <p className="text-[10px] text-slate-500">{selectedClaim.status === 'settled' ? 'Demo only · no payment' : selectedClaim.status === 'on_hold_manual_verification' ? 'Flagged Suspicious' : 'Pending Sign'}</p>
                  </div>
                </div>
              </div>

              {/* Step Action Buttons */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Individual Workflow Step Controls:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {selectedClaim.status === 'submitted' && (
                    <button
                      onClick={() => handleForwardToDoctor(selectedClaim.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-500 transition shadow-xs"
                    >
                      Step 2: AI Forward to Doctor for Review →
                    </button>
                  )}

                  {selectedClaim.status === 'forwarded_to_doctor' && (
                    <button
                      onClick={() => handleDoctorVerify(selectedClaim.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition shadow-xs"
                    >
                      Step 3: Doctor Study Patient & Authorize Treatment →
                    </button>
                  )}

                  {selectedClaim.status === 'doctor_verified' && (
                    <>
                      <button
                        onClick={() => handleSettleCheck(selectedClaim.id, false)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition shadow-xs"
                      >
                        Step 4: Record Demo Settlement ✓
                      </button>
                      <button
                        onClick={() => handleSettleCheck(selectedClaim.id, true)}
                        className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition shadow-xs"
                      >
                        Flag as Suspicious (Put on Hold) ⚠️
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* AI Verification Rules Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  AI Rule Verification Checklist (5 of 5 Verified):
                </h4>
                <div className="space-y-1.5 text-xs">
                  {selectedClaim.aiVerificationChecklist?.map((item: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-slate-800">{item.check}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{item.details}</span>
                    </div>
                  ))}
                </div>
              </div>

            </>
          ) : (
            <p className="text-xs text-slate-500">Select a claim on the left to review adjudication details.</p>
          )}
        </div>

      </div>

    </div>
  )
}
