import React, { useState } from 'react'
import {
  Bot,
  Send,
  Mic,
  Video,
  Languages,
  AlertCircle,
  FileText,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Thermometer,
  Pill,
  Volume2,
  Clock,
  HeartHandshake
} from 'lucide-react'
import { api } from '../services/api'

interface AIDoctorChatProps {
  currentPatient: any
  language: 'en' | 'hi' | 'mr'
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void
  onPrescriptionForwarded?: () => void
}

export const AIDoctorChat: React.FC<AIDoctorChatProps> = ({
  currentPatient,
  language,
  setLanguage,
  onPrescriptionForwarded
}) => {
  const [messages, setMessages] = useState<any[]>([
    {
      sender: 'ai',
      message: language === 'hi'
        ? `नमस्ते ${currentPatient?.name || 'राहुल'} जी। मैं आपका मेडिसेंस एआई चैट डॉक्टर हूं।\n\nमैंने आपकी मेडिकल हिस्ट्री, वर्तमान दवाएं, एलर्जी और टेस्ट रिपोर्ट्स का विश्लेषण कर लिया है। कृपया बताएं कि आपको क्या लक्षण महसूस हो रहे हैं?`
        : language === 'mr'
        ? `नमस्कार ${currentPatient?.name || 'राहुल'} जी. मी आपला मेडिसेंस एआय चॅट डॉक्टर आहे.\n\nमी आपल्या वैद्यकीय नोंदी, चालू औषधे, एलर्जी आणि लॅब रिपोर्ट्स तपासले आहेत. आपल्याला काय त्रास होत आहे?`
        : `Hello ${currentPatient?.name || 'Rahul'}. I am your Medisense AI Chat Doctor.\n\nI have pre-analyzed your medical history, current medications, allergies, previous prescriptions, and recent lab reports. Could you describe the symptoms you are experiencing?`,
      timestamp: 'Just now'
    }
  ])
  const [inputQuery, setInputQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeConsultation, setActiveConsultation] = useState<any>(null)
  const [forwarded, setForwarded] = useState(false)
  const [mode, setMode] = useState<'chat' | 'voice' | 'video'>('chat')
  const [isSpeaking, setIsSpeaking] = useState(false)

  const symptomChips = [
    { label: 'High Fever & Headache', query: 'I have a high fever of 102°F, retro-orbital headache, and severe body ache for 2 days.' },
    { label: 'Viral Cold & Sore Throat', query: 'I have a runny nose, scratchy throat, sneezing, and mild fatigue.' },
    { label: 'Persistent Dry Cough', query: 'I have an irritating dry cough that disturbs my sleep at night.' },
    { label: 'Severe Throbbing Headache', query: 'I have a pulsating headache on my temples with nausea.' }
  ]

  const handleSend = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery
    if (!text.trim() || loading) return

    const newPatientMsg = {
      sender: 'patient',
      message: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, newPatientMsg])
    setInputQuery('')
    setLoading(true)

    try {
      const historyPayload = messages.map(m => ({ sender: m.sender, message: m.message }))
      const result = await api.consultAIDoctor({
        patientId: currentPatient?.id || 1,
        query: text,
        history: historyPayload,
        language
      })

      const newAiMsg = {
        sender: 'ai',
        message: result.reply,
        structured: result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, newAiMsg])
      setActiveConsultation(result)
      setForwarded(false)

      if (mode !== 'chat') {
        playSpeech(result.reply)
      }
    } catch (err) {
      console.error('AI Consultation error:', err)
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          message: 'I am evaluating your symptoms against your health records. Please ensure emergency care is nearby if symptoms deteriorate.',
          timestamp: 'Just now'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleForwardToDoctor = async () => {
    if (!activeConsultation?.consultationId) return
    try {
      await api.forwardPrescriptionToDoctor(activeConsultation.consultationId)
      setForwarded(true)
      if (onPrescriptionForwarded) onPrescriptionForwarded()
      alert('Recommendation and preliminary prescription forwarded to Doctor Portal! Dr. Anjali Mehta has been notified.')
    } catch (err) {
      console.error('Forwarding failed:', err)
    }
  }

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US'
      utterance.rate = 0.95
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-xs">
            <Bot className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">Medisense AI Chat Doctor</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/80">
                Pre-Analyzing Medical Vault
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyzes history, lab tests, allergies & medications before formulating diagnosis
            </p>
          </div>
        </div>

        {/* Mode & Voice Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setMode('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              mode === 'chat' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AI Chat
          </button>
          <button
            onClick={() => {
              setMode('voice')
              playSpeech(messages[messages.length - 1]?.message || 'AI Voice Consultation Ready')
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
              mode === 'voice' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Doctor</span>
          </button>
          <button
            onClick={() => setMode('video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
              mode === 'video' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Avatar</span>
          </button>
        </div>
      </div>

      {/* Safety Analysis Notice */}
      <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/70 text-xs text-teal-900 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            <strong>Pre-Analyzed Clinical Parameters: </strong>
            Allergies: [{currentPatient?.allergies?.join(', ') || 'Penicillin'}],
            Conditions: [{currentPatient?.existingDiseases?.join(', ') || 'None'}],
            Current Meds: [{currentPatient?.activeMedicines?.map((m: any) => m.name).join(', ') || 'Dolo 650mg'}]
          </span>
        </div>
        <span className="text-[11px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-200 shrink-0">
          Contraindication Guard Active
        </span>
      </div>

      {/* Quick Symptom Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 py-1">Quick Select Symptoms:</span>
        {symptomChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.query)}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition font-medium"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="h-80 overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${msg.sender === 'patient' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'patient'
                  ? 'bg-blue-600 text-white'
                  : 'bg-teal-600 text-white'
              }`}
            >
              {msg.sender === 'patient' ? 'P' : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                msg.sender === 'patient'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
              }`}
            >
              <p className="whitespace-pre-line">{msg.message}</p>

              {/* Strict User-Requested Output Card */}
              {msg.structured && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2 text-slate-800 font-sans">
                  <div>
                    <span className="font-bold text-slate-900 uppercase">SYMPTOM ANALYSIS: </span>
                    <span className="text-slate-700">{msg.structured.symptomAnalysis}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 uppercase">RISK LEVEL: </span>
                    <span className={`font-bold ${
                      msg.structured.riskLevel?.includes('CRITICAL') ? 'text-rose-600' : msg.structured.riskLevel === 'HIGH' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {msg.structured.riskLevel}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 uppercase">PRELIMINARY DIAGNOSIS: </span>
                    <span className="font-semibold text-teal-800">{msg.structured.preliminaryDiagnosis}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 uppercase">RECOMMENDED CARE: </span>
                    <ul className="list-disc list-inside mt-0.5 text-slate-600 space-y-0.5">
                      {msg.structured.recommendedCare?.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 uppercase">PRELIMINARY PRESCRIPTION: </span>
                    <div className="mt-1 space-y-1">
                      {msg.structured.preliminaryPrescription?.map((rx: any, i: number) => (
                        <div key={i} className="p-2 rounded bg-white border border-slate-200">
                          <strong className="text-slate-900">{rx.medicine}</strong> ({rx.dosage}) • {rx.timing} • {rx.duration}
                          <p className="text-[11px] text-slate-500 italic">{rx.instructions}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-1 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 uppercase">DOCTOR APPROVAL STATUS: </span>
                      <span className="font-bold text-amber-700">Pending Doctor Verification</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>{msg.timestamp}</span>
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => playSpeech(msg.message)}
                    className="hover:text-teal-600 flex items-center space-x-1"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Play Audio</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="p-3 text-xs text-teal-700 flex items-center space-x-2">
            <Bot className="w-4 h-4 animate-spin" />
            <span>Analyzing medical records, allergies and cross-referencing contraindications...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            language === 'hi'
              ? 'अपने लक्षणों के बारे में बताएं (उदा. मुझे तेज बुखार और सिरदर्द है)...'
              : language === 'mr'
              ? 'आपल्या लक्षणांबद्दल सांगा (उदा. मला तीव्र ताप आणि डोकेदुखी आहे)...'
              : 'Describe symptoms (e.g. 102 fever, body pain, sore throat)...'
          }
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !inputQuery.trim()}
          className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition flex items-center space-x-1.5 shadow-sm"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Action to Forward Recommendation to Doctor */}
      {activeConsultation && activeConsultation.preliminaryPrescription?.length > 0 && (
        <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-teal-900">Forward Recommendation To Doctor For Approval</h4>
            <p className="text-[11px] text-teal-700">
              Sends your symptom summary and suggested prescription directly to Dr. Anjali Mehta's Doctor Portal queue.
            </p>
          </div>

          {forwarded ? (
            <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Visible in Doctor Portal Review Queue ✓</span>
            </div>
          ) : (
            <button
              onClick={handleForwardToDoctor}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-sm self-start sm:self-auto"
            >
              <span>Send Recommendation To Doctor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

    </div>
  )
}
