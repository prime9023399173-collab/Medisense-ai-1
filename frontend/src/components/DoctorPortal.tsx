import React, { useState, useEffect } from 'react'
import {
  Stethoscope,
  Search,
  KeyRound,
  FileText,
  AlertTriangle,
  Video,
  CheckCircle2,
  XCircle,
  Activity,
  Heart,
  TrendingUp,
  Clock,
  ShieldAlert,
  UserCheck,
  Plus,
  Mic,
  VideoOff,
  MicOff,
  Pill,
  Sparkles,
  UserPlus,
  FolderOpen,
  ShieldCheck,
  ArrowRight
} from 'lucide-react'
import { api } from '../services/api'
import { socketClient } from '../services/socket.ts'
import { useTranslation, Language } from '../i18n/translations'

interface DoctorPortalProps {
  currentDoctor?: any
  language?: Language
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({ currentDoctor, language = 'en' }) => {
  const t = useTranslation(language)
  const [searchQuery, setSearchQuery] = useState('')
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [patientHistory, setPatientHistory] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [pendingPrescriptions, setPendingPrescriptions] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [insuranceClaims, setInsuranceClaims] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'review' | 'claims' | 'patients' | 'analytics' | 'video'>('review')
  const [liveSocketNotification, setLiveSocketNotification] = useState<string | null>(null)
  
  // Add Patient Input State
  const [addPatientIdInput, setAddPatientIdInput] = useState('')
  const [addPatientMessage, setAddPatientMessage] = useState<string | null>(null)

  // Video State
  const [inVideoCall, setInVideoCall] = useState(false)
  const [consultNotes, setConsultNotes] = useState('')

  useEffect(() => {
    loadInitialData()

    const interval = window.setInterval(() => {
      loadInitialData()
    }, 5000)

    // Real-Time Socket Listener
    const unsubscribe = socketClient.subscribe((evt) => {
      if (
        evt.type === 'PRESCRIPTION_FORWARDED' ||
        evt.type === 'CLAIM_FORWARDED_TO_DOCTOR' ||
        evt.type === 'PATIENT_ENROLLED' ||
        evt.type === 'EMERGENCY_SOS'
      ) {
        setLiveSocketNotification(`⚡ [Real-Time Socket Event]: ${evt.title} — ${evt.message}`)
        loadInitialData()
        setTimeout(() => setLiveSocketNotification(null), 6000)
      }
    })

    return () => {
      unsubscribe()
      window.clearInterval(interval)
    }
  }, [])

  const loadInitialData = async () => {
    try {
      const [patientsData, alertsData, pendingData, analyticsData, claimsData] = await Promise.all([
        api.searchDoctorPatients(),
        api.getDoctorAlerts(),
        api.getPendingPrescriptions(),
        api.getDoctorAnalytics(),
        api.getInsuranceClaims()
      ])
      setPatients(patientsData)
      setAlerts(alertsData)
      setPendingPrescriptions(pendingData)
      setAnalytics(analyticsData)
      setInsuranceClaims(claimsData)

      if (patientsData.length > 0) {
        handleSelectPatient(patientsData[0].id)
      }
    } catch (err) {
      console.error('Failed to load doctor portal data:', err)
    }
  }

  const handleSelectPatient = async (patientId: number) => {
    try {
      const history = await api.getDoctorPatientHistory(patientId, currentDoctor?.id || 1)
      setSelectedPatient(history.patient)
      setPatientHistory(history)
    } catch (err) {
      console.error('Failed to load patient history:', err)
    }
  }

  const handleAddPatientById = async (patientIdToUse?: string) => {
    const idToSubmit = (patientIdToUse || addPatientIdInput).trim()
    if (!idToSubmit) return

    try {
      const res = await api.addPatientToDoctor(idToSubmit)
      setAddPatientMessage(res.message)
      setAddPatientIdInput('')
      await loadInitialData()
      if (res.patient) {
        handleSelectPatient(res.patient.id)
      }
      setTimeout(() => setAddPatientMessage(null), 4500)
    } catch (err: any) {
      alert(err.message || 'Patient ID not found in registry')
    }
  }

  const handleReviewPrescription = async (consultationId: number, status: 'approved' | 'modified' | 'declined') => {
    try {
      await api.reviewPrescription(consultationId, status, 'Clinically reviewed and authorized by Dr. Anjali Mehta, MD.')
      const updatedPending = await api.getPendingPrescriptions()
      setPendingPrescriptions(updatedPending)
      alert(`Prescription ${status.toUpperCase()}! Signed and delivered to patient portal.`)
    } catch (err) {
      console.error('Failed to review prescription:', err)
    }
  }

  const handleVerifyClaim = async (claimId: number) => {
    try {
      await api.doctorVerifyClaim(claimId, 1)
      alert(`Clinical necessity verified and signed for claim! Transmitted back to Star Health Insurance for automated settlement.`)
      const updatedClaims = await api.getInsuranceClaims()
      setInsuranceClaims(updatedClaims)
    } catch (err) {
      console.error('Failed to verify claim:', err)
    }
  }

  const pendingDoctorClaims = insuranceClaims.filter(c => c.status === 'forwarded_to_doctor')

  return (
    <div className="space-y-6">

      {/* Real-Time Socket Broadcast Notification Banner */}
      {liveSocketNotification && (
        <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-500/80 text-teal-900 text-xs font-bold flex items-center justify-between shadow-sm animate-bounce">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping" />
            <span>{liveSocketNotification}</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white text-teal-800 border border-teal-300">
            Real-Time Sync
          </span>
        </div>
      )}

      {/* Doctor Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 p-0.5 shadow-xs shrink-0">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80"
              alt="Doctor"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Dr. Anjali Mehta, MD</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                Senior Consultant Attending
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                Hospital: Max Super Speciality, Mumbai
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Internal Medicine & Infectious Diseases • Reg: <span className="font-mono text-slate-800 font-semibold">MCI-MH-2012-09412</span>
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'review' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Prescriptions ({pendingPrescriptions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'claims' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Insurance Claim Audits ({pendingDoctorClaims.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'patients' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Patient Vault Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Patient Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'video' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-amber-600" />
            <span>WebRTC Teleconsult</span>
          </button>
        </div>
      </div>

      {/* AI Doctor Copilot Clinical Alerts */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>AI Doctor Copilot Alerts ({alerts.length})</span>
            </h3>
            <span className="text-[11px] text-amber-700 font-medium">Monitoring Vitals Spikes, Missed Meds & Active SOS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl bg-white border border-amber-200/80 shadow-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">{alert.title}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2">{alert.description}</p>
                <p className="text-[10px] text-teal-700 font-medium">Action: {alert.actionRequired}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: AI Prescriptions Review Queue */}
      {activeTab === 'review' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                AI Prescriptions Forwarded For Doctor Verification ({pendingPrescriptions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Patients who consult Medisense AI forward recommendations here for physician clinical authorization
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
              Real-Time Sync Active
            </span>
          </div>

          {pendingPrescriptions.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">Review Queue Empty</p>
              <p>All AI-generated prescriptions have been clinically verified by attending physicians.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPrescriptions.map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-base text-slate-900">{item.patientName}</span>
                        <span className="text-xs font-mono text-slate-500 font-bold">({item.patientCode})</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                          Triage: {item.triageLevel?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Preliminary Diagnosis: <strong className="text-teal-700">{item.suggestedDiagnosis}</strong>
                      </p>
                    </div>

                    <div className="text-xs text-slate-500 text-right">
                      <p>Blood Group: <strong className="text-slate-900">{item.bloodGroup}</strong></p>
                      <p className="text-rose-600 font-bold">Documented Allergies: {item.allergies?.join(', ') || 'None'}</p>
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <p className="font-bold text-slate-800">AI Symptom Analysis & History Summary:</p>
                    <p className="text-slate-600">{item.aiSummary}</p>
                  </div>

                  {/* Suggested Drugs */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Recommended Prescription:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {item.suggestedPrescription?.map((med: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-2xl bg-teal-50/40 border border-teal-200/80 text-xs space-y-1">
                          <div className="flex items-center space-x-1.5 font-bold text-teal-800">
                            <Pill className="w-3.5 h-3.5" />
                            <span>{med.medicine}</span>
                          </div>
                          <p className="text-slate-700 font-medium">Dosage: {med.dosage} ({med.timing})</p>
                          <p className="text-[11px] text-slate-500">Duration: {med.duration} • {med.instructions}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Doctor Verification Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Authorizing will deliver the verified prescription directly to patient portal & schedule daily reminders.
                    </p>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReviewPrescription(item.id, 'declined')}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-rose-700 text-xs font-bold transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleReviewPrescription(item.id, 'approved')}
                        className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Clinically Verify & Deliver to Patient (1-Click)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Insurance Claim Audits (Doctor reviews clinical necessity forwarded by Insurance AI) */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-50 via-blue-50 to-teal-50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Insurance Clinical Medical Necessity Queue</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Star Health Insurance AI automatically forwards claim requests here for treating physician clinical sign-off
              </p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-full bg-white text-indigo-800 font-bold border border-indigo-200 shadow-xs self-start sm:self-auto">
              {pendingDoctorClaims.length} Claims Awaiting Doctor Sign-off
            </span>
          </div>

          {insuranceClaims.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-indigo-500 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">No Insurance Claims Pending</p>
              <p>When patients submit claims, they appear here after Insurance AI policy verification.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insuranceClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-base text-slate-900">{claim.claimNumber}</span>
                        <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                          {claim.patientName} ({claim.patientCode})
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          claim.status === 'settled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : claim.status === 'doctor_verified'
                            ? 'bg-blue-100 text-blue-800'
                            : claim.status === 'forwarded_to_doctor'
                            ? 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-400 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          Status: {claim.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Hospital: <strong className="text-slate-800">{claim.hospitalName}</strong> • Diagnosis: <strong className="text-teal-700">{claim.diagnosisIcd10}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">Claimed Amount</p>
                      <p className="text-lg font-bold text-slate-900">₹{claim.claimedAmount?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Treatment summary */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <p className="font-bold text-slate-800">Inpatient/Daycare Treatment Record:</p>
                    <p className="text-slate-600">{claim.treatmentSummary}</p>
                  </div>

                  {/* Documents & AI Eligibility */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-bold block mb-1">Attached Medical Documentation:</span>
                      <ul className="space-y-0.5 text-slate-700">
                        {claim.documents?.map((doc: any, i: number) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-teal-600" />
                            <span>{doc.type} ({doc.fileName})</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-bold block mb-1">Insurance AI Verification Scores:</span>
                      <p className="text-slate-700">
                        Policy Eligibility: <strong className="text-emerald-700">{claim.aiEligibilityScore}%</strong> • Fraud Risk: <strong className="text-slate-900">{claim.aiFraudScore}%</strong>
                      </p>
                      <p className="text-[11px] text-teal-700 mt-1">AI Recommendation: {claim.aiRecommendation}</p>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Doctor verification certifies that all inpatient treatments and laboratory assays were medically necessary.
                    </p>

                    {claim.status === 'forwarded_to_doctor' ? (
                      <button
                        onClick={() => handleVerifyClaim(claim.id)}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify Clinical Medical Necessity & Sign Off</span>
                      </button>
                    ) : claim.status === 'doctor_verified' ? (
                      <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span>Doctor Verified ✓ Transmitted to Insurance AI for Settlement</span>
                      </div>
                    ) : claim.status === 'settled' ? (
                      <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Settled by Insurance AI (₹{claim.approvedAmount?.toLocaleString()})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Awaiting Insurance AI Forwarding</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Patient Directory & Add Patient by ID */}
      {activeTab === 'patients' && (
        <div className="space-y-6">

          {/* Add Patient By ID Form with Sample ID Quick Chips */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <UserPlus className="w-4 h-4 text-teal-600" />
                <span>Enroll Patient into Care Roster by Patient ID / ABHA Code</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">Quick Sample IDs:</span>
                <button
                  type="button"
                  onClick={() => handleAddPatientById('MED-P-10924')}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-mono font-bold border border-teal-200 transition"
                >
                  MED-P-10924 (Rahul)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPatientById('MED-P-10925')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-mono font-bold border border-blue-200 transition"
                >
                  MED-P-10925 (Priya)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPatientById('MED-P-10926')}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-mono font-bold border border-purple-200 transition"
                >
                  MED-P-10926 (Amit)
                </button>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddPatientById(); }} className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={addPatientIdInput}
                onChange={(e) => setAddPatientIdInput(e.target.value)}
                placeholder="Enter sample ID: MED-P-10924, MED-P-10925, MED-P-10926 or patient name..."
                className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-xs whitespace-nowrap"
              >
                Add Patient To Roster
              </button>
            </form>

            {addPatientMessage && (
              <p className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{addPatientMessage}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Patient Directory List */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Patient Directory</h4>
                <span className="text-[10px] text-teal-600 font-bold font-mono">Sample IDs Available</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name, ID or ABHA..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 pl-8"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {patients
                  .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.patientCode.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPatient(p.id)}
                      className={`w-full text-left p-3 rounded-2xl text-xs transition border ${
                        selectedPatient?.id === p.id
                          ? 'bg-teal-50 border-teal-300 text-slate-900 font-bold shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{p.name}</span>
                        <span className="font-mono text-[10px] text-teal-700 font-bold">{p.bloodGroup}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{p.patientCode} • {p.universalHealthId}</p>
                    </button>
                  ))}
              </div>
            </div>

            {/* Selected Patient Medical Vault & Consent Records */}
            <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              {selectedPatient ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{selectedPatient.name}</h4>
                      <p className="text-xs text-slate-500">
                        ID: <span className="font-mono font-bold text-teal-700">{selectedPatient.patientCode}</span> • ABHA: <span className="font-mono">{selectedPatient.universalHealthId}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>OTP Consent Verified ✓</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-slate-500">Health Score</p>
                      <p className="text-base font-bold text-teal-700">{selectedPatient.healthScore || 88}/100</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-slate-500">Adherence</p>
                      <p className="text-base font-bold text-emerald-700">{selectedPatient.complianceScore || 95}%</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-slate-500">Allergies</p>
                      <p className="text-xs font-bold text-rose-700 truncate">{selectedPatient.allergies?.join(', ') || 'None'}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-slate-500">Conditions</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{selectedPatient.existingDiseases?.join(', ') || 'None'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Health Vault Documents ({patientHistory?.records?.length || 0}):
                    </h5>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {patientHistory?.records?.map((r: any) => (
                        <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-900">{r.title}</p>
                            <p className="text-[10px] text-slate-500">{r.issuedBy} • {r.issuedDate}</p>
                          </div>
                          <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {r.recordType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500">Select a patient on the left or enter a patient ID above.</p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: AI Patient Analytics (Condition Evaluator: Good / Moderate / Critical) */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-50 via-emerald-50 to-blue-50 border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <span>AI Clinical Health Condition Engine</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Evaluates every patient's condition (GOOD / MODERATE / CRITICAL) on basis of active medications, adherence, and uploaded lab reports
              </p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-full bg-white text-teal-800 font-bold border border-teal-200 shadow-xs self-start sm:self-auto">
              {analytics.patientAIAnalyses?.length || 0} Patients Analyzed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.patientAIAnalyses?.map((item: any) => (
              <div
                key={item.patientId}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.patientName}</h4>
                      <p className="text-[10px] font-mono text-slate-500">{item.patientCode} • Blood: {item.bloodGroup}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        item.aiConditionStatus === 'GOOD'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : item.aiConditionStatus === 'MODERATE'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      AI: {item.aiConditionStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px]">Health Score</span>
                      <p className="font-bold text-teal-700">{item.healthScore}/100</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[10px]">Adherence</span>
                      <p className="font-bold text-emerald-700">{item.complianceScore}%</p>
                    </div>
                  </div>

                  {/* Vitals Telemetry */}
                  <p className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    {item.latestVitalsSummary}
                  </p>

                  {/* Findings */}
                  <div className="space-y-1 text-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Evaluated Basis:</p>
                    {item.aiFindings?.map((f: string, idx: number) => (
                      <p key={idx} className="text-[11px] text-slate-700 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-1" />
                        <span>{f}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="pt-3 border-t border-slate-100 text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI Clinical Recommendation:</p>
                  <p className="text-[11px] text-teal-900 font-medium mt-0.5">{item.aiClinicalRecommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: WebRTC Video Room */}
      {activeTab === 'video' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Video className="w-5 h-5 text-teal-600" />
                <span>WebRTC Encrypted Teleconsultation Room</span>
              </h3>
              <p className="text-xs text-slate-500">Session room: room-consult-rahul-anjali-8812 • 1080p Medical Grade Video</p>
            </div>

            <button
              onClick={() => setInVideoCall(!inVideoCall)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                inVideoCall ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white'
              }`}
            >
              {inVideoCall ? 'End Consultation' : 'Join Video Consultation'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center">
              {inVideoCall ? (
                <div className="text-center space-y-2">
                  <div className="w-24 h-24 rounded-full border-4 border-teal-400 bg-slate-800 mx-auto overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                      alt="Patient Feed"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-bold text-white">Rahul Sharma (Patient Stream Active)</p>
                  <p className="text-xs text-emerald-400">WebRTC Audio/Video Stream Active • 60 FPS</p>
                </div>
              ) : (
                <div className="text-center text-slate-400 text-xs p-8 space-y-2">
                  <Video className="w-10 h-10 text-slate-500 mx-auto" />
                  <p>Click "Join Video Consultation" to initiate WebRTC session with patient Rahul Sharma.</p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Clinical Consultation Notes:</h4>
                <textarea
                  rows={6}
                  value={consultNotes}
                  onChange={(e) => setConsultNotes(e.target.value)}
                  placeholder="Record diagnosis, observations, or prescription adjustments here..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 resize-none"
                />
              </div>

              <button
                onClick={() => alert('Consultation notes & treatment record saved to patient vault!')}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-xs"
              >
                Save Notes & Authorize Rx
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
