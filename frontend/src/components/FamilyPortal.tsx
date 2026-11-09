import React from 'react'
import {
  Users,
  AlertTriangle,
  PhoneCall,
  MapPin,
  Calendar,
  Pill,
  Heart,
  ShieldCheck,
  Activity,
  Ambulance
} from 'lucide-react'

interface FamilyPortalProps {
  currentPatient: any
  activeSosEvent: any
  onTriggerSOS: () => void
}

export const FamilyPortal: React.FC<FamilyPortalProps> = ({
  currentPatient,
  activeSosEvent,
  onTriggerSOS
}) => {
  const familyMembers = currentPatient?.familyMembers || [
    { name: 'Sunita Sharma', relationship: 'Mother', phone: '+919820998811', accessGranted: true },
    { name: 'Vikram Sharma', relationship: 'Brother', phone: '+919820887722', accessGranted: true }
  ]

  return (
    <div className="space-y-6">

      {/* Family Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-purple-600/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Family Guardian Care Network</h2>
            <p className="text-xs text-slate-500">
              Kin oversight for <strong className="text-slate-800">{currentPatient?.name || 'Rahul Sharma'}</strong> (Universal Health ID: {currentPatient?.universalHealthId})
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerSOS}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-md shadow-red-600/25 flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Dispatch SOS from Family View</span>
        </button>
      </div>

      {/* Active SOS Tracker in Family Portal */}
      {activeSosEvent && activeSosEvent.status === 'active' && (
        <div className="p-5 rounded-3xl bg-red-50 border-2 border-red-500 animate-pulse space-y-3">
          <div className="flex items-center justify-between text-red-900">
            <div className="flex items-center space-x-2">
              <Ambulance className="w-5 h-5 text-red-600 animate-bounce" />
              <h3 className="font-extrabold text-sm uppercase">Active Emergency Alert for {currentPatient?.name}</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-red-600 px-2.5 py-1 rounded-full text-white">
              ETA: {activeSosEvent.ambulanceEtaMinutes || 6} Mins
            </span>
          </div>

          <p className="text-xs text-red-700">
            Location: {activeSosEvent.address}. Ambulance dispatched from {activeSosEvent.nearestHospital}.
          </p>

          <div className="flex items-center space-x-3 pt-2 border-t border-red-200 text-xs">
            <button
              onClick={() => alert('Dialing Lilavati Hospital Emergency Room (+912226751000)...')}
              className="px-3 py-1.5 rounded-xl bg-red-700 text-white font-bold hover:bg-red-800 transition flex items-center space-x-1 shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Hospital ER</span>
            </button>
            <button
              onClick={() => alert('Calling Dr. Anjali Mehta (+919811001122)...')}
              className="px-3 py-1.5 rounded-xl bg-white text-slate-800 border border-slate-300 font-bold hover:bg-slate-50 transition flex items-center space-x-1 shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
              <span>Call Primary Doctor</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid: Kin Cards & Compliance Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Kin Contacts */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Authorized Family Contacts ({familyMembers.length}):
          </h3>

          <div className="space-y-2">
            {familyMembers.map((fam: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{fam.name}</p>
                  <p className="text-[10px] text-slate-500">{fam.relationship} • {fam.phone}</p>
                </div>
                <button
                  onClick={() => alert(`Initiating direct call to ${fam.name}...`)}
                  className="p-2 rounded-xl bg-white hover:bg-purple-50 text-purple-600 border border-slate-200 transition shadow-2xs"
                  title="Call contact"
                >
                  <PhoneCall className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Compliance & Missed Doses Alert */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Medication Adherence</h3>
            <span className="text-xs font-extrabold text-emerald-600">
              {currentPatient?.complianceScore || 95}%
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2.5 rounded-full"
              style={{ width: `${currentPatient?.complianceScore || 95}%` }}
            />
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <p className="text-slate-800 font-semibold">Automated Kin Alerts:</p>
            <p className="text-slate-500">
              Family members receive automated SMS and voice alerts if patient misses medication after stage-4 escalation.
            </p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Upcoming Consultations</h3>
          
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Dr. Anjali Mehta, MD</span>
              <span className="text-teal-700 font-semibold">Today • 03:30 PM</span>
            </div>
            <p className="text-slate-500 text-[11px]">Video Consultation • Follow-up on Viral Fever</p>
            <div className="flex items-center space-x-2 pt-1 border-t border-slate-200">
              <button
                onClick={() => alert('Connected as family observer in consultation room.')}
                className="text-[11px] font-bold text-purple-700 hover:underline"
              >
                Join as Family Observer →
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
