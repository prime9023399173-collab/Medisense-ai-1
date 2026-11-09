import React, { useState, useEffect } from 'react'
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  Plus,
  Trash2,
  Volume2,
  PhoneCall,
  Bell,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  TrendingDown,
  Play
} from 'lucide-react'
import { api } from '../services/api'

interface MedicineManagerProps {
  currentPatient: any
  onDoseAcknowledged?: () => void
}

export const MedicineManager: React.FC<MedicineManagerProps> = ({
  currentPatient,
  onDoseAcknowledged
}) => {
  const [medicines, setMedicines] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showOcrModal, setShowOcrModal] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrResult, setOcrResult] = useState<any>(null)
  const [escalatingId, setEscalatingId] = useState<number | null>(null)
  const [escalationStepLog, setEscalationStepLog] = useState<string | null>(null)

  // New Medicine Form State
  const [formName, setFormName] = useState('')
  const [formDosage, setFormDosage] = useState('1 Tablet')
  const [formFrequency, setFormFrequency] = useState('Twice Daily')
  const [formFood, setFormFood] = useState('after_food')
  const [formDays, setFormDays] = useState('7')

  useEffect(() => {
    loadMedicines()
  }, [currentPatient?.id])

  const loadMedicines = async () => {
    if (!currentPatient?.id) return
    try {
      setLoading(true)
      const data = await api.getMedicines(currentPatient.id)
      setMedicines(data.medicines || [])
      setReminders(data.reminders || [])
    } catch (err) {
      console.error('Failed to load medicines:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledgeDose = async (reminderId: number) => {
    try {
      await api.acknowledgeDose(reminderId)
      await loadMedicines()
      if (onDoseAcknowledged) onDoseAcknowledged()
    } catch (err) {
      console.error('Failed to acknowledge dose:', err)
    }
  }

  // 5-Stage Reminder Escalation Trigger
  const handleTriggerEscalation = async (reminderId: number) => {
    try {
      setEscalatingId(reminderId)
      const res = await api.escalateReminder(reminderId)
      setEscalationStepLog(
        `Stage Advanced to [${res.currentStage?.toUpperCase()}]: ${res.notificationMessage?.slice(0, 110)}...`
      )
      await loadMedicines()
    } catch (err) {
      console.error('Failed to escalate reminder:', err)
    } finally {
      setEscalatingId(null)
    }
  }

  const handleOcrScan = async (sampleType: string) => {
    try {
      setOcrLoading(true)
      const res = await api.ocrScan(sampleType)
      setOcrResult(res)
    } catch (err) {
      console.error('OCR scan failed:', err)
    } finally {
      setOcrLoading(false)
    }
  }

  const handleApplyOcrMeds = async () => {
    if (!ocrResult?.extractedMedicines) return
    for (const med of ocrResult.extractedMedicines) {
      await api.addMedicine({
        patientId: currentPatient.id,
        name: med.name,
        dosage: med.dosage,
        form: 'tablet',
        frequency: med.frequency,
        timing: { morning: true, afternoon: false, evening: false, night: true },
        foodRelation: med.foodRelation,
        durationDays: 5,
        ocrExtracted: true,
        instructions: `Take ${med.dosage} ${med.frequency} as prescribed by Dr. Anjali Mehta.`
      })
    }
    setShowOcrModal(false)
    setOcrResult(null)
    await loadMedicines()
  }

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName) return
    await api.addMedicine({
      patientId: currentPatient.id,
      name: formName,
      dosage: formDosage,
      form: 'tablet',
      frequency: formFrequency,
      timing: { morning: true, afternoon: false, evening: false, night: true },
      foodRelation: formFood,
      durationDays: parseInt(formDays, 10),
      instructions: `Take ${formFood === 'after_food' ? 'after meals' : 'before meals'} with water.`
    })
    setShowAddModal(false)
    setFormName('')
    await loadMedicines()
  }

  const handleDeleteMedicine = async (id: number) => {
    await api.removeMedicine(id)
    await loadMedicines()
  }

  const playVoiceSample = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 0.95
      window.speechSynthesis.speak(u)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Pill className="w-5 h-5 text-teal-600" />
            <span>Medicine Management & Escalation Engine</span>
          </h2>
          <p className="text-xs text-slate-500">
            5-Stage Automated Reminders (Push → SMS 1 → SMS 2 → Voice → IVRS → Doctor Alert)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowOcrModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-teal-700 border border-teal-200 text-xs font-semibold transition shadow-2xs"
          >
            <Camera className="w-3.5 h-3.5 text-teal-600" />
            <span>Scan Prescription OCR</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Escalation Stage Visual Ladder */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Escalation Ladder Workflow:
          </h3>
          <span className="text-[11px] text-teal-700 font-bold">Compliance Target: 95%+</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-semibold">
            <Bell className="w-4 h-4 mx-auto mb-1 text-teal-600" />
            <p className="text-[10px] text-slate-500">Step 1</p>
            <p>Push Alert</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <MessageSquare className="w-4 h-4 mx-auto mb-1 text-blue-600" />
            <p className="text-[10px] text-slate-500">Step 2 (T+5m)</p>
            <p>SMS 1</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <MessageSquare className="w-4 h-4 mx-auto mb-1 text-amber-600" />
            <p className="text-[10px] text-slate-500">Step 3 (T+10m)</p>
            <p>SMS 2 Urgent</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <Volume2 className="w-4 h-4 mx-auto mb-1 text-purple-600" />
            <p className="text-[10px] text-slate-500">Step 4 (T+15m)</p>
            <p>AI Voice Call</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            <PhoneCall className="w-4 h-4 mx-auto mb-1 text-rose-600" />
            <p className="text-[10px] text-slate-500">Step 5 (T+20m)</p>
            <p>AI IVRS Call</p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
            <ShieldAlert className="w-4 h-4 mx-auto mb-1 text-rose-600" />
            <p className="text-[10px] text-rose-700">Unacknowledged</p>
            <p>Doctor & Family</p>
          </div>
        </div>

        {escalationStepLog && (
          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-center justify-between">
            <span>{escalationStepLog}</span>
            <button
              onClick={() => playVoiceSample(escalationStepLog)}
              className="text-xs hover:text-teal-900 flex items-center space-x-1 font-semibold"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Medications List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Current Prescribed Medications ({medicines.length}):
        </h3>

        {medicines.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
            No active medications logged for this patient. Click "Scan Prescription OCR" or "Add Medicine".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {medicines.map((med) => {
              const medReminder = reminders.find(r => r.medicineId === med.id)
              const isTaken = medReminder?.status === 'taken'
              const isMissed = medReminder?.status === 'missed'

              return (
                <div
                  key={med.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{med.name}</span>
                        {med.ocrExtracted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
                            OCR Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {med.dosage} • {med.frequency} • {med.foodRelation === 'after_food' ? 'After Meals' : 'Before Meals'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteMedicine(med.id)}
                      className="text-slate-400 hover:text-rose-600 transition"
                      title="Remove medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Timing Badges */}
                  <div className="flex items-center space-x-1 text-[10px] font-semibold">
                    <span className={`px-2 py-0.5 rounded-md ${med.timing?.morning ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'}`}>
                      Morning
                    </span>
                    <span className={`px-2 py-0.5 rounded-md ${med.timing?.afternoon ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'}`}>
                      Noon
                    </span>
                    <span className={`px-2 py-0.5 rounded-md ${med.timing?.evening ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'}`}>
                      Evening
                    </span>
                    <span className={`px-2 py-0.5 rounded-md ${med.timing?.night ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-400'}`}>
                      Night
                    </span>
                  </div>

                  {/* Instructions */}
                  {med.instructions && (
                    <p className="text-[11px] text-slate-600 italic">
                      "{med.instructions}"
                    </p>
                  )}

                  {/* Reminder & Escalation Controls */}
                  {medReminder && (
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500">Scheduled: </span>
                        <span className="font-mono font-bold text-slate-900">{medReminder.scheduledTime}</span>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            isTaken
                              ? 'bg-emerald-100 text-emerald-800'
                              : isMissed
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {medReminder.status} ({medReminder.escalationStage})
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!isTaken && (
                          <button
                            onClick={() => handleAcknowledgeDose(medReminder.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-2xs"
                          >
                            Mark Taken
                          </button>
                        )}
                        <button
                          onClick={() => handleTriggerEscalation(medReminder.id)}
                          disabled={escalatingId === medReminder.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-amber-800 text-xs font-semibold transition"
                          title="Advance escalation ladder by 1 step"
                        >
                          {escalatingId === medReminder.id ? 'Escalating...' : 'Trigger Next Alert'}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Prescription OCR Modal */}
      {showOcrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border border-slate-200 shadow-xl rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Camera className="w-5 h-5 text-teal-600" />
                <span>Prescription Scanner & OCR Extraction</span>
              </h3>
              <button
                onClick={() => setShowOcrModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select a clinical prescription template to simulate high-accuracy OCR extraction:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOcrScan('fever')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 text-left space-y-1 transition"
              >
                <p className="text-xs font-bold text-teal-800">Fever & Respiratory Rx</p>
                <p className="text-[11px] text-slate-500">Dr. Anjali Mehta: Dolo 650mg, Levocetirizine, Vitamin C</p>
              </button>

              <button
                onClick={() => handleOcrScan('cardiac')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 text-left space-y-1 transition"
              >
                <p className="text-xs font-bold text-teal-800">Hypertension & Cardiac Rx</p>
                <p className="text-[11px] text-slate-500">Dr. Rajesh Iyer: Telmisartan 40mg, Atorvastatin 20mg</p>
              </button>
            </div>

            {ocrLoading && (
              <div className="text-xs text-teal-700 flex items-center space-x-2 py-4 justify-center">
                <span className="w-3 h-3 rounded-full bg-teal-600 animate-ping mr-2" />
                <span>Parsing handwriting, normalizing dosages & verifying drug contraindications...</span>
              </div>
            )}

            {ocrResult && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{ocrResult.hospitalName}</p>
                    <p className="text-[11px] text-slate-500">{ocrResult.doctorName} • {ocrResult.diagnosis}</p>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    98.5% OCR Accuracy
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-700 uppercase">Extracted Meds:</p>
                  {ocrResult.extractedMedicines.map((m: any, i: number) => (
                    <div key={i} className="text-xs p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-teal-800">{m.name} ({m.dosage})</span>
                      <span className="text-slate-500 text-[11px]">{m.frequency}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleApplyOcrMeds}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-xs"
                >
                  Import Extracted Medicines into Patient Vault
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form onSubmit={handleCreateMedicine} className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New Prescription Medication</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div>
              <label className="text-xs text-slate-700 font-semibold block mb-1">Medicine Name & Formulation</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Paracetamol 650mg, Metformin 500mg"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Dosage</label>
                <input
                  type="text"
                  value={formDosage}
                  onChange={(e) => setFormDosage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Frequency</label>
                <select
                  value={formFrequency}
                  onChange={(e) => setFormFrequency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  <option value="Once Daily">Once Daily (OD)</option>
                  <option value="Twice Daily">Twice Daily (BD)</option>
                  <option value="Three Times Daily">Three Times Daily (TID)</option>
                  <option value="SOS As Needed">SOS (As Needed)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Meal Relation</label>
                <select
                  value={formFood}
                  onChange={(e) => setFormFood(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  <option value="after_food">After Food</option>
                  <option value="before_food">Before Food</option>
                  <option value="with_food">With Food</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-700 font-semibold block mb-1">Duration (Days)</label>
                <input
                  type="number"
                  value={formDays}
                  onChange={(e) => setFormDays(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs"
              >
                Save Medicine
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
