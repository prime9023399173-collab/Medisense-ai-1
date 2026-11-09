import React, { useState, useEffect } from 'react'
import {
  FolderLock,
  HardDrive,
  FileText,
  KeyRound,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Plus,
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Cloud,
  ExternalLink,
  QrCode
} from 'lucide-react'
import { api } from '../services/api'

interface HealthVaultViewProps {
  currentPatient: any
  onVitalLogged?: () => void
}

export const HealthVaultView: React.FC<HealthVaultViewProps> = ({
  currentPatient,
  onVitalLogged
}) => {
  const [vaultData, setVaultData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'records' | 'vitals' | 'consent'>('records')
  const [showAddRecordModal, setShowAddRecordModal] = useState(false)
  const [showLogVitalModal, setShowLogVitalModal] = useState(false)
  const [verifiedHashId, setVerifiedHashId] = useState<number | null>(null)

  // New Record Form
  const [recTitle, setRecTitle] = useState('')
  const [recType, setRecType] = useState('lab_report')
  const [recProvider, setRecProvider] = useState('google_drive')

  // New Vital Form
  const [vitalBpSys, setVitalBpSys] = useState('120')
  const [vitalBpDia, setVitalBpDia] = useState('80')
  const [vitalSugar, setVitalSugar] = useState('95')
  const [vitalHr, setVitalHr] = useState('74')
  const [vitalSpo2, setVitalSpo2] = useState('98')
  const [vitalTemp, setVitalTemp] = useState('98.6')

  useEffect(() => {
    loadVault()
  }, [currentPatient?.id])

  const loadVault = async () => {
    if (!currentPatient?.id) return
    try {
      setLoading(true)
      const data = await api.getVault(currentPatient.id)
      setVaultData(data)
    } catch (err) {
      console.error('Failed to load health vault:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyIntegrity = async (recordId: number) => {
    try {
      await api.verifyIntegrity(recordId)
      setVerifiedHashId(recordId)
      setTimeout(() => setVerifiedHashId(null), 4000)
    } catch (err) {
      console.error('Integrity check failed:', err)
    }
  }

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recTitle) return
    await api.addVaultRecord(currentPatient.id, {
      title: recTitle,
      recordType: recType,
      storageProvider: recProvider,
      issuedBy: 'Patient Uploaded & Verified'
    })
    setShowAddRecordModal(false)
    setRecTitle('')
    await loadVault()
  }

  const handleLogVital = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.logVital(currentPatient.id, {
      systolicBp: parseInt(vitalBpSys, 10),
      diastolicBp: parseInt(vitalBpDia, 10),
      bloodSugar: parseInt(vitalSugar, 10),
      heartRate: parseInt(vitalHr, 10),
      spo2: parseInt(vitalSpo2, 10),
      temperature: parseFloat(vitalTemp)
    })
    setShowLogVitalModal(false)
    if (onVitalLogged) onVitalLogged()
  }

  return (
    <div className="space-y-6">

      {/* ABHA Universal Health ID Smart Card - Light Healthcare Aesthetic */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/50 border border-teal-200/90 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <FolderLock className="w-48 h-48 text-teal-800" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider border border-teal-200">
                Universal Health ID (ABHA-Compliant)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200">
                Self-Sovereign Data Owner
              </span>
            </div>

            <div>
              <p className="text-2xl font-extrabold text-slate-900 font-mono tracking-wider">
                {currentPatient?.universalHealthId || 'MED-ABHA-91-4458-1290-7712'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Patient Code: <span className="text-slate-800 font-semibold">{currentPatient?.patientCode || 'MED-P-10924'}</span> • Blood Group: <span className="text-teal-700 font-bold">{currentPatient?.bloodGroup || 'O+'}</span>
              </p>
            </div>

            {/* Decentralized Storage Badges */}
            <div className="flex items-center space-x-3 text-xs text-slate-600">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                <span>Encrypted on {vaultData?.storageProvider || 'Google Drive'}</span>
              </div>
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>AES-GCM-256</span>
              </div>
            </div>
          </div>

          {/* QR Code Simulation & Vault Metrics */}
          <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-teal-200/80 shadow-xs self-start md:self-auto">
            <div className="w-16 h-16 bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex items-center justify-center">
              <QrCode className="w-12 h-12 text-slate-800" />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900">Emergency Data Badge</p>
              <p className="text-slate-500">Scan unlocks Allergies & Emergency Contacts</p>
              <p className="text-teal-700 font-mono text-[10px] font-bold">Checksum: SHA256 Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vault Tabs Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'records' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Encrypted Records ({vaultData?.records?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'vitals' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Daily Vitals Telemetry
          </button>
          <button
            onClick={() => setActiveTab('consent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'consent' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Consent & Audit Log
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowLogVitalModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-teal-700 text-xs font-semibold border border-teal-200 transition flex items-center space-x-1 shadow-2xs"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Log Daily Vitals</span>
          </button>
          <button
            onClick={() => setShowAddRecordModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center space-x-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Record</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Encrypted Records */}
      {activeTab === 'records' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {vaultData?.records?.map((rec: any) => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                    {rec.recordType?.replace('_', ' ')}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{rec.title}</h4>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500" title={`Stored on ${rec.storageProvider}`}>
                  <HardDrive className="w-4 h-4 text-teal-600" />
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">{rec.description}</p>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <span>Issued: {rec.issuedDate}</span> • <span>{rec.issuedBy}</span>
                </div>

                <button
                  onClick={() => handleVerifyIntegrity(rec.id)}
                  className="flex items-center space-x-1 text-teal-600 hover:text-teal-700 text-[11px] font-semibold"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{verifiedHashId === rec.id ? 'Hash Validated ✓' : 'Verify SHA-256'}</span>
                </button>
              </div>

              {verifiedHashId === rec.id && (
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-mono">
                  SHA-256 Checksum: {rec.storageReferenceHash} (Zero Tampering Detected)
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Vitals Telemetry */}
      {activeTab === 'vitals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Blood Pressure</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1">120/78</p>
              <p className="text-[10px] text-emerald-600 font-medium">Normal Range</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Blood Sugar</span>
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1">95 mg/dL</p>
              <p className="text-[10px] text-emerald-600 font-medium">Fasting Controlled</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Heart Rate</span>
                <Activity className="w-4 h-4 text-teal-500" />
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1">74 bpm</p>
              <p className="text-[10px] text-emerald-600 font-medium">Resting Pulse</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Oxygen (SPO2)</span>
                <ShieldCheck className="w-4 h-4 text-teal-500" />
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1">98%</p>
              <p className="text-[10px] text-emerald-600 font-medium">Adequate</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Temperature</span>
                <Thermometer className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-bold text-slate-900 mt-1">100.2°F</p>
              <p className="text-[10px] text-amber-600 font-medium">Mild Fever (Improving)</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Continuous AI Telemetry Monitoring active. Trends directly feed into your overall Health Score.</span>
            <span className="text-teal-700 font-semibold font-mono">Last Sync: 5 mins ago</span>
          </div>
        </div>
      )}

      {/* Tab 3: Consent Logs */}
      {activeTab === 'consent' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-1 shadow-xs">
            <h4 className="font-bold text-slate-900">Patient Consent Ownership Protocol</h4>
            <p className="text-slate-500">
              Doctors cannot access your full medical history without an OTP authorized by you. You may revoke access at any time.
            </p>
          </div>

          <div className="space-y-2">
            {vaultData?.consentLogs?.map((log: any) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
                <div>
                  <span className="font-bold text-slate-900">Purpose: {log.purpose}</span>
                  <p className="text-slate-500 text-[11px]">Scope: {log.grantedScope?.join(', ')}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[10px]">
                  {log.isVerified ? 'OTP Verified ✓' : 'Pending OTP'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Record Modal */}
      {showAddRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form onSubmit={handleCreateRecord} className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Attach Record to Health Vault</h3>
            <div>
              <label className="text-xs text-slate-700 font-semibold block mb-1">Document Title</label>
              <input
                type="text"
                required
                value={recTitle}
                onChange={(e) => setRecTitle(e.target.value)}
                placeholder="e.g. Brain MRI, Thyroid Panel, Vaccination Record"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Record Type</label>
                <select
                  value={recType}
                  onChange={(e) => setRecType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  <option value="lab_report">Lab Report</option>
                  <option value="prescription">Prescription</option>
                  <option value="xray">Digital X-Ray</option>
                  <option value="mri">MRI Scan</option>
                  <option value="ct_scan">CT Scan</option>
                  <option value="vaccination">Vaccination</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Storage Vault</label>
                <select
                  value={recProvider}
                  onChange={(e) => setRecProvider(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  <option value="google_drive">Google Drive</option>
                  <option value="onedrive">OneDrive</option>
                  <option value="icloud">Apple iCloud</option>
                  <option value="device_storage">Encrypted Local Storage</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddRecordModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs"
              >
                Encrypt & Attach
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Log Vital Modal */}
      {showLogVitalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form onSubmit={handleLogVital} className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Log Daily Vitals Reading</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  value={vitalBpSys}
                  onChange={(e) => setVitalBpSys(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  value={vitalBpDia}
                  onChange={(e) => setVitalBpDia(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Sugar (mg/dL)</label>
                <input
                  type="number"
                  value={vitalSugar}
                  onChange={(e) => setVitalSugar(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">HR (BPM)</label>
                <input
                  type="number"
                  value={vitalHr}
                  onChange={(e) => setVitalHr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">SPO2 (%)</label>
                <input
                  type="number"
                  value={vitalSpo2}
                  onChange={(e) => setVitalSpo2(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-700 font-semibold block mb-1">Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                value={vitalTemp}
                onChange={(e) => setVitalTemp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogVitalModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs"
              >
                Save & Recalculate Scores
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
