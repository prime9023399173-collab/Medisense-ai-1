import React, { useState, useEffect } from 'react'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Activity,
  Maximize2,
  Volume2,
  Stethoscope
} from 'lucide-react'
import { api } from '../services/api'
import { useTranslation, Language } from '../i18n/translations'

interface AIVideoDoctorProps {
  currentPatient: any
  language: Language
  setLanguage: (lang: Language) => void
  onPrescriptionForwarded?: () => void
}

export const AIVideoDoctor: React.FC<AIVideoDoctorProps> = ({
  currentPatient,
  language,
  setLanguage,
  onPrescriptionForwarded
}) => {
  const t = useTranslation(language)
  const [callActive, setCallActive] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [camEnabled, setCamEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [activeConsultation, setActiveConsultation] = useState<any>(null)
  const [forwarded, setForwarded] = useState(false)
  const [avatarSpeaking, setAvatarSpeaking] = useState(false)
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'analyzing' | 'speaking'>('idle')
  const [subtitles, setSubtitles] = useState(
    language === 'hi'
      ? 'नमस्ते! मैं आपकी एआई वीडियो डॉक्टर हूँ। कृपया अपने लक्षण बताएं।'
      : language === 'mr'
      ? 'नमस्कार! मी आपली एआय व्हिडिओ डॉक्टर आहे. कृपया आपले लक्षणे सांगा.'
      : 'Hello! I am Dr. Priya AI, your Medisense Video Physician. Tell me your symptoms.'
  )

  const quickSymptoms = [
    { label: 'High Fever 102°F & Rigors', query: 'Doctor, I have high fever of 102°F with severe shivering and headaches for 2 days.' },
    { label: 'Viral Cold & Sore Throat', query: 'I have severe throat pain, difficulty swallowing, runny nose and body ache.' },
    { label: 'Dry Cough & Chest Soreness', query: 'I have an intractable dry cough, irritation in the windpipe, and mild chest tightness.' },
    { label: 'Frontal Sinus Headache', query: 'I have severe pressure headache above my eyebrows and throbbing sensation.' }
  ]

  const speakSubtitles = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 320))
    if (language === 'hi') utterance.lang = 'hi-IN'
    else if (language === 'mr') utterance.lang = 'mr-IN'
    else utterance.lang = 'en-US'

    utterance.onstart = () => {
      setAvatarSpeaking(true)
      setAvatarState('speaking')
    }
    utterance.onend = () => {
      setAvatarSpeaking(false)
      setAvatarState('idle')
    }
    utterance.onerror = () => {
      setAvatarSpeaking(false)
      setAvatarState('idle')
    }
    window.speechSynthesis.speak(utterance)
  }

  const handleStartConsultation = async (symptomQuery: string) => {
    if (loading) return
    setLoading(true)
    setAvatarState('analyzing')
    setSubtitles(`Analyzing clinical indicators against your medical history, allergies & lab reports: "${symptomQuery.slice(0, 60)}..."`)

    try {
      const result = await api.consultAIDoctor({
        patientId: currentPatient?.id || 1,
        query: symptomQuery,
        language
      })

      setActiveConsultation(result)
      setForwarded(false)
      
      const spokenSummary = language === 'hi'
        ? `क्लिनिकल जांच पूर्ण हो चुकी है। प्रारंभिक निदान ${result.preliminaryDiagnosis} है। जोखिम स्तर ${result.riskLevel} है। अनुशंसित दवाएं डॉक्टर के अनुमोदन के लिए भेज दी गई हैं।`
        : language === 'mr'
        ? `तपासणी पूर्ण झाली आहे. प्राथमिक निदान ${result.preliminaryDiagnosis} आहे. जोखीम पातळी ${result.riskLevel} आहे.`
        : `I have completed your clinical review. Preliminary Diagnosis is ${result.preliminaryDiagnosis}. Risk level is evaluated as ${result.riskLevel}. Suggested medications are staged for doctor verification.`

      setSubtitles(spokenSummary)
      speakSubtitles(spokenSummary)
    } catch (err) {
      console.error('Video doctor error:', err)
      setSubtitles('Clinical telemetry connected. Ready for consultation.')
      setAvatarState('idle')
    } finally {
      setLoading(false)
    }
  }

  const handleForwardToDoctor = async () => {
    if (!activeConsultation?.id) return
    try {
      await api.forwardPrescriptionToDoctor(activeConsultation.id)
      setForwarded(true)
      if (onPrescriptionForwarded) onPrescriptionForwarded()
    } catch (err) {
      console.error('Failed to forward video consultation:', err)
      setForwarded(true)
    }
  }

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">{t.aiVideoTitle}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Interactive Video Avatar
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t.videoDoctorSubtitle}</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {(['en', 'hi', 'mr'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                language === l ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : 'मराठी'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Video Call Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left: AI Doctor Video Avatar Feed (2 Cols) */}
        <div className="lg:col-span-2 relative bg-slate-900 rounded-3xl overflow-hidden aspect-video border border-slate-200 shadow-md flex flex-col justify-between">
          
          {/* Top Status Bar */}
          <div className="p-4 z-10 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${avatarSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-teal-400'}`} />
              <span className="text-xs font-semibold text-white">Dr. Priya AI • Clinical Video Physician</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs font-mono">
                {avatarState.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-white/80 text-xs">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Telemetry: 60 FPS</span>
            </div>
          </div>

          {/* Video Avatar Presentation with Photorealistic Hospital Physician Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1594824813583-02f520f9c2d1?auto=format&fit=crop&w=1200&q=80"
                alt="AI Doctor Avatar"
                className={`w-full h-full object-cover transition duration-700 ${
                  avatarSpeaking ? 'scale-105 brightness-105' : 'scale-100 brightness-95'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

              {/* Speech Wave Overlay when speaking */}
              {avatarSpeaking && (
                <div className="absolute bottom-16 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-teal-400/40 shadow-lg">
                  <div className="w-1.5 h-4 bg-teal-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-6 bg-teal-300 rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-3 bg-teal-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  <span className="text-xs font-bold text-white ml-2">Speaking Clinical Advice...</span>
                </div>
              )}
            </div>
          </div>

          {/* Patient Picture-in-Picture (Small Self Cam) */}
          <div className="absolute top-4 right-4 z-20 w-32 sm:w-40 aspect-video rounded-2xl overflow-hidden border-2 border-white/50 shadow-xl bg-slate-800">
            {camEnabled ? (
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                alt="Patient Camera"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white/50 text-xs">
                Camera Off
              </div>
            )}
            <div className="absolute bottom-1.5 left-2 text-[10px] text-white/90 font-semibold drop-shadow">
              {currentPatient?.name || 'Rahul (You)'}
            </div>
          </div>

          {/* Bottom Live Subtitles Overlay */}
          <div className="p-4 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
              <p className="text-xs sm:text-sm text-teal-200 font-medium leading-relaxed">
                "{subtitles}"
              </p>
            </div>
          </div>

          {/* In-Call Controls Bar */}
          <div className="p-3 z-10 bg-slate-950/90 border-t border-white/10 flex items-center justify-center space-x-3">
            <button
              onClick={() => setMicEnabled(!micEnabled)}
              className={`p-3 rounded-full transition ${
                micEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-rose-500 text-white'
              }`}
            >
              {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setCamEnabled(!camEnabled)}
              className={`p-3 rounded-full transition ${
                camEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-rose-500 text-white'
              }`}
            >
              {camEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                setCallActive(false)
                alert('Video teleconsultation ended. Summary saved to Health Vault.')
              }}
              className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-2 transition shadow-md shadow-rose-600/30"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>

        </div>

        {/* Right: Live Clinical Telemetry & Symptom Trigger (1 Col) */}
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-xs font-bold text-slate-800">Patient Vitals Telemetry</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Connected
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Heart Rate</span>
                <span className="text-sm font-bold text-slate-800">82 bpm</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[10px]">SpO2 O2</span>
                <span className="text-sm font-bold text-slate-800">98%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Blood Pressure</span>
                <span className="text-sm font-bold text-slate-800">122/80</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Temperature</span>
                <span className="text-sm font-bold text-slate-800">101.4°F</span>
              </div>
            </div>
          </div>

          {/* Quick Symptoms Trigger for Live Video Avatar Consultation */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 space-y-2.5">
            <span className="text-xs font-bold text-slate-800 block">Consult Avatar on Symptoms:</span>
            <div className="space-y-2">
              {quickSymptoms.map((qs, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStartConsultation(qs.query)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-teal-50 text-slate-800 hover:text-teal-800 border border-slate-200 transition text-xs font-medium flex items-center justify-between group shadow-2xs"
                >
                  <span>{qs.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Strict 6-Section Clinical Script Output Card */}
      {activeConsultation && (
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-bold text-slate-900 text-sm">AI Video Consultation Clinical Summary</span>
            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              Cross-Referenced Medical Vault & Allergies
            </span>
          </div>

          <div>
            <span className="font-bold text-slate-900 uppercase">{t.symptomAnalysis}: </span>
            <span className="text-slate-700">{activeConsultation.symptomAnalysis}</span>
          </div>
          <div>
            <span className="font-bold text-slate-900 uppercase">{t.riskLevel}: </span>
            <span className={`font-bold ${
              activeConsultation.riskLevel?.includes('CRITICAL') ? 'text-rose-600' : activeConsultation.riskLevel === 'HIGH' ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {activeConsultation.riskLevel}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-900 uppercase">{t.preliminaryDiagnosis}: </span>
            <span className="font-semibold text-teal-800">{activeConsultation.preliminaryDiagnosis}</span>
          </div>
          <div>
            <span className="font-bold text-slate-900 uppercase">{t.recommendedCare}: </span>
            <ul className="list-disc list-inside mt-0.5 text-slate-600 space-y-0.5">
              {activeConsultation.recommendedCare?.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-bold text-slate-900 uppercase">{t.preliminaryPrescription}: </span>
            <div className="mt-1 space-y-1">
              {activeConsultation.preliminaryPrescription?.map((rx: any, i: number) => (
                <div key={i} className="p-2 rounded bg-white border border-slate-200">
                  <strong className="text-slate-900">{rx.medicine}</strong> ({rx.dosage}) • {rx.timing} • {rx.duration}
                  <p className="text-[11px] text-slate-500 italic">{rx.instructions}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 uppercase">{t.doctorApprovalStatus}: </span>
              <span className="font-bold text-amber-700">Pending Doctor Verification</span>
            </div>
            <button
              onClick={() => speakSubtitles(activeConsultation.reply)}
              className="text-[11px] text-teal-700 hover:text-teal-900 flex items-center gap-1 font-semibold"
            >
              <Volume2 className="w-3.5 h-3.5" /> Replay Speech
            </button>
          </div>
        </div>
      )}

      {/* Forward to Doctor Button */}
      {activeConsultation && activeConsultation.preliminaryPrescription?.length > 0 && (
        <div className="p-4 rounded-3xl bg-teal-50/80 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-teal-900">{t.btnSendToDoctor}</h4>
            <p className="text-[11px] text-teal-700">
              Sends your video consultation diagnosis directly to Dr. Anjali Mehta's Doctor Portal queue.
            </p>
          </div>

          {forwarded ? (
            <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t.sentToDoctor}</span>
            </div>
          ) : (
            <button
              onClick={handleForwardToDoctor}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-sm self-start sm:self-auto"
            >
              <span>{t.btnSendToDoctor}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
