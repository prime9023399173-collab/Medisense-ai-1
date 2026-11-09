import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
  DollarSign,
  X,
  Zap,
  Building2,
  RefreshCw,
  Search
} from 'lucide-react'
import { api } from '../services/api'
import { socketClient } from '../services/socket.ts'

interface PatientInsuranceDialogProps {
  isOpen: boolean
  onClose: () => void
  currentPatient: any
}

export const PatientInsuranceDialog: React.FC<PatientInsuranceDialogProps> = ({
  isOpen,
  onClose,
  currentPatient
}) => {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [simulatingClaimId, setSimulatingClaimId] = useState<number | null>(null)
  const [workflowMessage, setWorkflowMessage] = useState('')

  // Submit Claim Form
  const [claimAmount, setClaimAmount] = useState('18500')
  const [hospitalName, setHospitalName] = useState('Max Super Speciality Hospital, Mumbai')
  const [diagnosisIcd, setDiagnosisIcd] = useState('B34.9 (Viral Pyrexia)')
  const [treatmentSummary, setTreatmentSummary] = useState('Emergency daycare evaluation, IV fluids, antipyretics and pathology assay tests.')
  const [billDoc, setBillDoc] = useState('Hospital_Daycare_Tax_Invoice.pdf')

  useEffect(() => {
    if (!isOpen) return

    loadClaims()
    const unsubscribe = socketClient.subscribe((event) => {
      if (event.patientId !== (currentPatient?.id || 1) || !event.type.startsWith('CLAIM_')) return
      setWorkflowMessage(`${event.title}: ${event.message}`)
      loadClaims()
    })
    const refreshTimer = window.setInterval(loadClaims, 2500)

    return () => {
      unsubscribe()
      window.clearInterval(refreshTimer)
    }
  }, [isOpen, currentPatient?.id])

  const loadClaims = async () => {
    try {
      setLoading(true)
      const allClaims = await api.getInsuranceClaims()
      const patientClaims = allClaims.filter(
        c => c.patientId === (currentPatient?.id || 1)
      )
      setClaims(patientClaims)
      setSelectedClaim(previous => patientClaims.find(c => c.id === previous?.id) || previous || patientClaims[0] || null)
    } catch (err) {
      console.error('Failed to load patient claims:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.submitInsuranceClaim({
        patientId: currentPatient?.id || 1,
        claimedAmount: parseInt(claimAmount, 10),
        hospitalName,
        diagnosisIcd10: diagnosisIcd,
        treatmentSummary,
        billFileName: billDoc
      })
      setShowSubmitModal(false)
      setSelectedClaim(res.claim)
      setSimulatingClaimId(res.claim.id)
      setWorkflowMessage('Claim received by the insurer. Starting the automated demo review...')
      await loadClaims()
      const result = await api.runAutomatedClaimLoop(res.claim.id)
      setWorkflowMessage(result.message || `Claim review finished with status: ${result.status}`)
      await loadClaims()
    } catch (err) {
      console.error('Failed to submit claim:', err)
      setWorkflowMessage('Claim submission or automated review failed. Please retry.')
    } finally {
      setSimulatingClaimId(null)
    }
  }

  // Run the complete automated loop step-by-step
  const handleRunFullLoop = async (claimId: number) => {
    try {
      setSimulatingClaimId(claimId)
      setWorkflowMessage('Insurance AI is reviewing the claim and patient history...')
      const result = await api.runAutomatedClaimLoop(claimId)
      setWorkflowMessage(result.message || `Claim review finished with status: ${result.status}`)
      await loadClaims()
    } catch (err) {
      console.error('Loop error:', err)
      setWorkflowMessage('Automated claim review failed. Please retry.')
    } finally {
      setSimulatingClaimId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 animate-fadeIn">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border-b border-teal-100 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">Insurance Policy & Claims Management</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                  Active Comprehensive Cover
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Provider: <strong>{currentPatient?.insuranceProvider || 'Star Health & Allied Insurance Co.'}</strong> • Policy: <span className="font-mono">{currentPatient?.insurancePolicyNumber || 'SH-IND-2026-904128'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Claim</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {workflowMessage && (
            <div className="rounded-xl bg-teal-50 border border-teal-200 px-4 py-3 text-xs text-teal-900" role="status">
              {workflowMessage}
            </div>
          )}

          {/* Policy Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <p className="text-slate-500 font-medium">Total Sum Insured</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">₹10,00,000</p>
              <p className="text-[10px] text-teal-600 font-semibold">100% Cashless Available</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <p className="text-slate-500 font-medium">Claims Settled (YTD)</p>
              <p className="text-lg font-bold text-emerald-600 mt-0.5">₹32,700</p>
              <p className="text-[10px] text-slate-500">2 claims processed</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <p className="text-slate-500 font-medium">Auto-Adjudication</p>
              <p className="text-lg font-bold text-teal-600 mt-0.5">Demo workflow</p>
              <p className="text-[10px] text-slate-500">No real payment is made</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <p className="text-slate-500 font-medium">Fraud Safety Score</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">98% Verified</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Clean Clinical Record</p>
            </div>
          </div>

          {/* Claims List & Step-by-Step Loop Tracker */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Claim History Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Your Claims History ({claims.length})
                </h3>
                <button onClick={loadClaims} className="text-slate-400 hover:text-teal-600">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {claims.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No claims found. Click "Raise Claim" above to file your first reimbursement.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {claims.map((claim) => (
                    <button
                      key={claim.id}
                      onClick={() => setSelectedClaim(claim)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition space-y-1.5 ${
                        selectedClaim?.id === claim.id
                          ? 'bg-teal-50 border-teal-300 shadow-sm'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-teal-700">{claim.claimNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            claim.status === 'settled'
                              ? 'bg-emerald-100 text-emerald-700'
                              : claim.status === 'doctor_verified'
                              ? 'bg-blue-100 text-blue-700'
                              : claim.status === 'forwarded_to_doctor'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {claim.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">₹{claim.claimedAmount?.toLocaleString()}</p>
                      <p className="text-[11px] text-slate-500 truncate">{claim.hospitalName}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Live Progress Loop Detail */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
              {selectedClaim ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 font-mono">{selectedClaim.claimNumber}</h4>
                      <p className="text-xs text-slate-500">{selectedClaim.hospitalName} • Diagnosis: {selectedClaim.diagnosisIcd10}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">Claim Amount</p>
                      <p className="text-xl font-bold text-slate-900 font-mono">₹{selectedClaim.claimedAmount?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* 5-Step Visual Loop Tracker */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      End-to-End Automated Adjudication Loop:
                    </p>

                    <div className="space-y-2 text-xs">
                      {/* Step 1 */}
                      <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <div>
                            <p className="font-bold text-slate-900">1. Claim Raised by Patient</p>
                            <p className="text-[11px] text-slate-500">Recorded in the connected demo claims system.</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Completed</span>
                      </div>

                      {/* Step 2 */}
                      <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <div>
                            <p className="font-bold text-slate-900">2. Insurance AI Analysis</p>
                            <p className="text-[11px] text-slate-500">Documents read, policy limits validated, forwarded to Doctor.</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
                      </div>

                      {/* Step 3 */}
                      <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          {selectedClaim.status === 'doctor_verified' || selectedClaim.status === 'settled' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                          )}
                          <div>
                            <p className="font-bold text-slate-900">3. Doctor Medical Necessity Verification</p>
                            <p className="text-[11px] text-slate-500">
                              Doctor & Clinical AI study lab reports, medications & diagnosis.
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          selectedClaim.status === 'doctor_verified' || selectedClaim.status === 'settled'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {selectedClaim.status === 'doctor_verified' || selectedClaim.status === 'settled' ? 'Doctor Verified' : 'In Progress'}
                        </span>
                      </div>

                      {/* Step 4 */}
                      <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          {selectedClaim.status === 'settled' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : selectedClaim.status === 'on_hold_manual_verification' ? (
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-400" />
                          )}
                          <div>
                            <p className="font-bold text-slate-900">4. Insurance AI Settlement Disbursal</p>
                            <p className="text-[11px] text-slate-500">
                              {selectedClaim.status === 'settled'
                                ? `Marked settled in the demo for ₹${selectedClaim.claimedAmount?.toLocaleString()}. No payment was sent.`
                                : selectedClaim.status === 'on_hold_manual_verification'
                                ? '⚠️ Anomaly detected: Claim put on hold for manual forensic review.'
                                : 'Awaiting physician sign-off before payout release.'}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          selectedClaim.status === 'settled'
                            ? 'bg-emerald-100 text-emerald-700'
                            : selectedClaim.status === 'on_hold_manual_verification'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {selectedClaim.status === 'settled' ? 'Settled ✓' : selectedClaim.status === 'on_hold_manual_verification' ? 'On Hold' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Loop Automation Button */}
                  {selectedClaim.status !== 'settled' && selectedClaim.status !== 'on_hold_manual_verification' && (
                    <div className="pt-2 flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Test complete end-to-end loop automatically:
                      </p>
                      <button
                        onClick={() => handleRunFullLoop(selectedClaim.id)}
                        disabled={simulatingClaimId === selectedClaim.id}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 transition"
                      >
                        <Zap className={`w-3.5 h-3.5 ${simulatingClaimId === selectedClaim.id ? 'animate-bounce' : ''}`} />
                        <span>{simulatingClaimId === selectedClaim.id ? 'Running AI Cycle...' : '⚡ Run Full Automated Loop'}</span>
                      </button>
                    </div>
                  )}

                </>
              ) : (
                <p className="text-xs text-slate-500">Select a claim on the left to inspect live timeline.</p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Raise Claim Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSubmitClaim} className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Submit Insurance Reimbursement Claim</h3>
              <button type="button" onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Claim Amount (INR ₹)</label>
              <input
                type="number"
                required
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Hospital / Clinic Name</label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Diagnosis (ICD-10)</label>
                <input
                  type="text"
                  value={diagnosisIcd}
                  onChange={(e) => setDiagnosisIcd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Attach Tax Bill / Report</label>
                <input
                  type="text"
                  value={billDoc}
                  onChange={(e) => setBillDoc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Treatment Description</label>
              <textarea
                rows={3}
                value={treatmentSummary}
                onChange={(e) => setTreatmentSummary(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow"
              >
                Submit to Insurance Company
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
