import React, { useEffect, useState } from 'react'
import {
  Users,
  Activity,
  HeartPulse,
  Pill,
  Bot,
  FolderLock,
  Calendar,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Video,
  Radio,
  CheckCircle2,
  FileCheck2,
  Shield,
  MessageSquare
} from 'lucide-react'
import { HealthVaultView } from './HealthVaultView'
import { MedicineManager } from './MedicineManager'
import { AIDoctorChat } from './AIDoctorChat'
import { AIVoiceDoctor } from './AIVoiceDoctor'
import { AIVideoDoctor } from './AIVideoDoctor'
import { PatientInsuranceDialog } from './PatientInsuranceDialog'
import { api } from '../services/api'

interface PatientPortalProps {
  currentPatient: any
  language: 'en' | 'hi' | 'mr'
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void
  onTriggerSOS: () => void
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  currentPatient,
  language,
  setLanguage,
  onTriggerSOS
}) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'medicines' | 'ai-chat' | 'ai-voice' | 'ai-video' | 'appointments'>('vault')
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false)
  const [appointments, setAppointments] = useState<any[]>([])
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [reschedulingId, setReschedulingId] = useState<number | null>(null)
  const [appointmentDoctorId, setAppointmentDoctorId] = useState('1')
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().slice(0, 10))
  const [appointmentTime, setAppointmentTime] = useState('10:30')
  const [chiefComplaint, setChiefComplaint] = useState('General clinical review')
  const [appointmentMessage, setAppointmentMessage] = useState('')

  useEffect(() => {
    loadAppointments()
  }, [currentPatient?.id])

  const loadAppointments = async () => {
    try {
      const data = await api.getPatientAppointments(currentPatient?.id || 1)
      setAppointments(data)
    } catch (error) {
      console.error('Failed to load patient appointments:', error)
    }
  }

  const handleSaveAppointment = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      if (reschedulingId) {
        await api.updateAppointmentStatus(reschedulingId, 'confirmed', undefined, appointmentDate, appointmentTime)
        setAppointmentMessage('Appointment rescheduled.')
      } else {
        await api.bookAppointment({
          patientId: currentPatient?.id || 1,
          doctorId: Number(appointmentDoctorId),
          date: appointmentDate,
          timeSlot: appointmentTime,
          type: 'video',
          chiefComplaint
        })
        setAppointmentMessage('Appointment booked and added to your care schedule.')
      }
      setShowAppointmentForm(false)
      setReschedulingId(null)
      await loadAppointments()
    } catch (error: any) {
      setAppointmentMessage(error.message || 'Could not save this appointment.')
    }
  }

  const handleCancelAppointment = async (id: number) => {
    try {
      await api.updateAppointmentStatus(id, 'cancelled')
      setAppointmentMessage('Appointment cancelled.')
      await loadAppointments()
    } catch (error: any) {
      setAppointmentMessage(error.message || 'Could not cancel this appointment.')
    }
  }

  return (
    <div className="space-y-6">

      {/* Patient Header Banner - Clean Light Healthcare Aesthetic */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 p-0.5 shadow-xs shrink-0">
            <img
              src={currentPatient?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt="Patient"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{currentPatient?.name || 'Rahul Sharma'}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                Patient ID: {currentPatient?.patientCode || 'MED-P-10924'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                Health Score: {currentPatient?.healthScore || 85}/100
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Universal Health ID: <span className="text-slate-800 font-mono font-bold">{currentPatient?.universalHealthId || 'MED-ABHA-91-4458-1290-7712'}</span> • Blood: <strong className="text-teal-700">{currentPatient?.bloodGroup || 'O+'}</strong>
            </p>
          </div>
        </div>

        {/* Tab Switchers & Insurance Claims Action */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'vault' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderLock className="w-3.5 h-3.5 text-teal-600" />
            <span>Health Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('medicines')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'medicines' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pill className="w-3.5 h-3.5 text-blue-600" />
            <span>Medicines</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'ai-chat' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Chat Doctor</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-voice')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'ai-voice' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Voice Doctor</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'ai-video' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Video Doctor</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'appointments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Appointments</span>
          </button>

          {/* Insurance Claims Dialog Button */}
          <button
            onClick={() => setShowInsuranceDialog(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Insurance Claim</span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === 'vault' && (
        <HealthVaultView currentPatient={currentPatient} />
      )}

      {activeTab === 'medicines' && (
        <MedicineManager currentPatient={currentPatient} />
      )}

      {activeTab === 'ai-chat' && (
        <AIDoctorChat
          currentPatient={currentPatient}
          language={language}
          setLanguage={setLanguage}
        />
      )}

      {activeTab === 'ai-voice' && (
        <AIVoiceDoctor
          currentPatient={currentPatient}
          language={language}
          setLanguage={setLanguage}
        />
      )}

      {activeTab === 'ai-video' && (
        <AIVideoDoctor
          currentPatient={currentPatient}
          language={language}
          setLanguage={setLanguage}
        />
      )}

      {activeTab === 'appointments' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <span>Scheduled Doctor Consultations</span>
              </h3>
              <p className="text-xs text-slate-500">Manage your upcoming doctor consultations.</p>
            </div>
            <button
              onClick={() => {
                setReschedulingId(null)
                setShowAppointmentForm(value => !value)
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition"
            >
              {showAppointmentForm ? 'Close form' : 'Book New Appointment'}
            </button>
          </div>

          {appointmentMessage && <p role="status" className="rounded-xl bg-teal-50 border border-teal-200 px-3 py-2 text-xs text-teal-800">{appointmentMessage}</p>}

          {showAppointmentForm && (
            <form onSubmit={handleSaveAppointment} className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <label className="text-xs font-semibold text-slate-700">Doctor
                <select value={appointmentDoctorId} onChange={(event) => setAppointmentDoctorId(event.target.value)} disabled={Boolean(reschedulingId)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                  <option value="1">Dr. Anjali Mehta · General Physician</option>
                  <option value="2">Dr. Rajesh Iyer · Cardiologist</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700">Date
                <input type="date" required value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Time
                <input type="time" required value={appointmentTime} onChange={(event) => setAppointmentTime(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Reason for visit
                <input required value={chiefComplaint} onChange={(event) => setChiefComplaint(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs" />
              </label>
              <button type="submit" className="sm:col-span-2 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700">
                {reschedulingId ? 'Save rescheduled appointment' : 'Confirm video appointment'}
              </button>
            </form>
          )}

          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">No appointments scheduled.</div>
            ) : appointments.map((appointment) => (
              <div key={appointment.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{appointment.doctorName} ({appointment.doctorSpecialization})</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{appointment.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{appointment.date} at {appointment.timeSlot} · {appointment.hospitalName}</p>
                  <p className="text-[11px] text-teal-700 font-medium">{appointment.chiefComplaint}</p>
                </div>
                {appointment.status !== 'cancelled' && (
                  <div className="flex gap-2 self-start sm:self-auto">
                    <button onClick={() => {
                      setReschedulingId(appointment.id)
                      setAppointmentDate(appointment.date)
                      setAppointmentTime(appointment.timeSlot)
                      setChiefComplaint(appointment.chiefComplaint || '')
                      setShowAppointmentForm(true)
                    }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700">Reschedule</button>
                    <button onClick={() => handleCancelAppointment(appointment.id)} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insurance Claims Dialog */}
      <PatientInsuranceDialog
        isOpen={showInsuranceDialog}
        onClose={() => setShowInsuranceDialog(false)}
        currentPatient={currentPatient}
      />

    </div>
  )
}
