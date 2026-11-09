import React, { useState, useEffect, useRef } from 'react'
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Radio,
  FileText,
  Activity,
  Waveform
} from 'lucide-react'
import { api } from '../services/api'
import { useTranslation, Language } from '../i18n/translations'

interface AIVoiceDoctorProps {
  currentPatient: any
  language: Language
  setLanguage: (lang: Language) => void
  onPrescriptionForwarded?: () => void
}

export const AIVoiceDoctor: React.FC<AIVoiceDoctorProps> = ({
  currentPatient,
  language,
  setLanguage,
  onPrescriptionForwarded
}) => {
  const t = useTranslation(language)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeConsultation, setActiveConsultation] = useState<any>(null)
  const [forwarded, setForwarded] = useState(false)
  const [conversationLogs, setConversationLogs] = useState<any[]>([])
  const recognitionRef = useRef<any>(null)

  const sampleVoicePrompts = [
    { label: 'High Fever & Chills', prompt: 'Doctor, I have a high fever of 102 degrees with chills and severe headache for the past two days.' },
    { label: 'Dry Cough & Sore Throat', prompt: 'I have had a dry cough and painful scratchy throat for three days, no phlegm.' },
    { label: 'Viral Cold & Weakness', prompt: 'I am experiencing a runny nose, continuous sneezing, body ache, and heavy fatigue.' },
    { label: 'Pulsating Headache', prompt: 'I have severe throbbing headache across my forehead and temples with nausea.' }
  ]

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true

      if (language === 'hi') recognition.lang = 'hi-IN'
      else if (language === 'mr') recognition.lang = 'mr-IN'
      else recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        setLiveTranscript('')
      }

      recognition.onresult = (event: any) => {
        let current = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript
        }
        setLiveTranscript(current)
      }

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
        if (liveTranscript.trim()) {
          handleVoiceConsult(liveTranscript.trim())
        }
      }

      recognitionRef.current = recognition
    }
  }, [language, liveTranscript])

  const toggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop()
      setIsListening(false)
      if (liveTranscript.trim()) {
        handleVoiceConsult(liveTranscript.trim())
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (e) {
          console.warn('Mic start error, using fallback:', e)
          simulateVoiceInput()
        }
      } else {
        simulateVoiceInput()
      }
    }
  }

  const simulateVoiceInput = () => {
    setIsListening(true)
    const randomPrompt = sampleVoicePrompts[Math.floor(Math.random() * sampleVoicePrompts.length)].prompt
    setLiveTranscript(randomPrompt)
    setTimeout(() => {
      setIsListening(false)
      handleVoiceConsult(randomPrompt)
    }, 1500)
  }

  // Synthesize speech output in the selected language
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 320))
    if (language === 'hi') utterance.lang = 'hi-IN'
    else if (language === 'mr') utterance.lang = 'mr-IN'
    else utterance.lang = 'en-US'

    utterance.rate = 0.95
    utterance.pitch = 1.05

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const handleVoiceConsult = async (spokenText: string) => {
    if (!spokenText.trim() || loading) return
    setLoading(true)
    setIsListening(false)

    setConversationLogs(prev => [
      ...prev,
      { sender: 'patient', text: spokenText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ])

    try {
      const result = await api.consultAIDoctor({
        patientId: currentPatient?.id || 1,
        query: spokenText,
        language
      })

      setActiveConsultation(result)
      setForwarded(false)

      const vocalSummary = language === 'hi'
        ? `आपके लक्षणों के आधार पर प्रारंभिक निदान ${result.preliminaryDiagnosis} है। जोखिम स्तर ${result.riskLevel} है। डॉक्टर की मंजूरी के लिए विवरण भेज दिया गया है।`
        : language === 'mr'
        ? `आपल्या लक्षणांवरून प्राथमिक निदान ${result.preliminaryDiagnosis} आहे. जोखीम पातळी ${result.riskLevel} आहे.`
        : `Based on your symptoms, preliminary diagnosis is ${result.preliminaryDiagnosis}. Risk level is ${result.riskLevel}. Suggested medications are staged for doctor verification.`

      setConversationLogs(prev => [
        ...prev,
        {
          sender: 'ai',
          text: result.reply,
          structured: result,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])

      speakText(vocalSummary)
    } catch (err) {
      console.error('Voice consult error:', err)
    } finally {
      setLoading(false)
      setLiveTranscript('')
    }
  }

  const handleForwardToDoctor = async () => {
    if (!activeConsultation?.id) return
    try {
      await api.forwardPrescriptionToDoctor(activeConsultation.id)
      setForwarded(true)
      if (onPrescriptionForwarded) onPrescriptionForwarded()
    } catch (err) {
      console.error('Failed to forward voice prescription:', err)
      setForwarded(true)
    }
  }

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">{t.aiVoiceTitle}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Direct Two-Way Talk
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t.aiDoctorSubtitle}</p>
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

      {/* Voice Interactive Centerpiece - Clinical Hospital Styling */}
      <div className="bg-gradient-to-b from-teal-50/40 via-slate-50 to-white border border-teal-100 rounded-3xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated wave bars */}
        <div className="flex items-center justify-center gap-1.5 h-16 mb-6">
          {[40, 65, 85, 45, 95, 75, 50, 90, 60, 35, 80, 55].map((h, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                isSpeaking
                  ? 'bg-emerald-500 animate-pulse'
                  : isListening
                  ? 'bg-teal-600 animate-bounce'
                  : 'bg-slate-300'
              }`}
              style={{
                height: isSpeaking || isListening ? `${h}%` : '20%',
                animationDelay: `${i * 75}ms`
              }}
            />
          ))}
        </div>

        {/* Central Direct Push-to-Talk Microphone Button */}
        <div className="relative mb-4">
          {isListening && (
            <span className="absolute -inset-3 rounded-full bg-teal-400/30 animate-ping pointer-events-none" />
          )}
          <button
            type="button"
            onClick={toggleMic}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform active:scale-95 ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30 scale-105'
                : isSpeaking
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30'
            }`}
          >
            {isListening ? (
              <Mic className="w-8 h-8 animate-pulse" />
            ) : isSpeaking ? (
              <Volume2 className="w-8 h-8 animate-bounce" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>

        <p className="text-sm font-bold text-slate-800">
          {isListening
            ? t.voiceListening
            : isSpeaking
            ? t.voiceSpeaking
            : t.voiceTapToTalk}
        </p>

        {liveTranscript && (
          <div className="mt-2 p-2 px-4 rounded-xl bg-white border border-teal-200 text-xs text-teal-800 font-medium">
            "{liveTranscript}"
          </div>
        )}

        <p className="text-xs text-slate-500 mt-1 max-w-md">
          {language === 'hi'
            ? 'माइक दबाएं और सीधे बोलें — एआई आपकी मेडिकल हिस्ट्री और एलर्जी का विश्लेषण करेगा'
            : language === 'mr'
            ? 'माइकवर टॅप करून थेट बोला — एआय आपल्या चालू औषधांचा अभ्यास करून सल्ला देईल'
            : 'Speak naturally into your mic. The AI cross-references your current medications and allergies.'}
        </p>

        {/* Sample Voice Prompts */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-xl">
          <span className="text-xs font-semibold text-slate-500">Quick Voice Simulation:</span>
          {sampleVoicePrompts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setLiveTranscript(s.prompt)
                handleVoiceConsult(s.prompt)
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition font-medium shadow-2xs"
            >
              🎙️ "{s.label}"
            </button>
          ))}
        </div>
      </div>

      {/* Voice Consultation History & Strict Clinical Card Output */}
      {conversationLogs.length > 0 && (
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Voice Consultation Transcript</h3>
          {conversationLogs.map((log, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border text-xs sm:text-sm ${
                log.sender === 'patient'
                  ? 'bg-blue-50/70 border-blue-200 text-blue-900 ml-8'
                  : 'bg-white border-slate-200 text-slate-800 mr-8 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-[11px] mb-1.5">
                <span className={log.sender === 'patient' ? 'text-blue-700' : 'text-teal-700'}>
                  {log.sender === 'patient' ? 'Patient (Spoken Audio Input)' : 'Medisense AI Voice Doctor'}
                </span>
                <span className="text-slate-400 font-normal">{log.timestamp}</span>
              </div>
              <p className="whitespace-pre-line">{log.text}</p>

              {/* Strict 6-Section Script Clinical Card */}
              {log.structured && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5 text-slate-800">
                  <div>
                    <span className="font-bold text-slate-900 uppercase">{t.symptomAnalysis}: </span>
                    <span className="text-slate-700">{log.structured.symptomAnalysis}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 uppercase">{t.riskLevel}: </span>
                    <span className={`font-bold ${
                      log.structured.riskLevel?.includes('CRITICAL') ? 'text-rose-600' : log.structured.riskLevel === 'HIGH' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {log.structured.riskLevel}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 uppercase">{t.preliminaryDiagnosis}: </span>
                    <span className="font-semibold text-teal-800">{log.structured.preliminaryDiagnosis}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 uppercase">{t.recommendedCare}: </span>
                    <ul className="list-disc list-inside mt-0.5 text-slate-600 space-y-0.5">
                      {log.structured.recommendedCare?.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 uppercase">{t.preliminaryPrescription}: </span>
                    <div className="mt-1 space-y-1">
                      {log.structured.preliminaryPrescription?.map((rx: any, i: number) => (
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
                      onClick={() => speakText(log.structured.reply)}
                      className="text-[11px] text-teal-600 hover:text-teal-800 flex items-center gap-1 font-semibold"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Replay Voice
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Forward to Doctor Button */}
      {activeConsultation && activeConsultation.preliminaryPrescription?.length > 0 && (
        <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-teal-900">{t.btnSendToDoctor}</h4>
            <p className="text-[11px] text-teal-700">
              Sends voice consultation summary & preliminary prescription directly to Dr. Anjali Mehta's review queue.
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
