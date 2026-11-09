export interface ClinicalContext {
  patientName: string
  allergies: string[]
  existingDiseases: string[]
  currentMedicines: string[]
  recentVitals?: {
    systolicBp?: number
    diastolicBp?: number
    bloodSugar?: number
    heartRate?: number
    spo2?: number
    temperature?: number
  }
  recentLabReports?: string[]
  consultationHistory?: string[]
  preferredLanguage?: 'en' | 'hi' | 'mr'
}

export interface ConsultationResponse {
  reply: string
  symptomAnalysis: string
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL (EMERGENCY)'
  preliminaryDiagnosis: string
  recommendedCare: string[]
  preliminaryPrescription: {
    medicine: string
    dosage: string
    timing: string
    duration: string
    instructions: string
  }[]
  doctorApprovalStatus: 'PENDING_DOCTOR_APPROVAL' | 'APPROVED' | 'EMERGENCY_DISPATCH'
  triageLevel: 'green' | 'amber' | 'red'
  aiSummary: string
  redFlagsDetected: string[]
  followUpQuestions?: string[]
  rawFormattedText: string
}

const languageName = (language: 'en' | 'hi' | 'mr') =>
  language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'

function unavailableResponse(reason: string, language: 'en' | 'hi' | 'mr'): ConsultationResponse {
  const messages = {
    en: 'The AI clinical service is currently unavailable, so I cannot assess your symptoms reliably. Please try again later or contact a qualified healthcare professional. If you have severe chest pain, difficulty breathing, fainting, stroke symptoms, or another rapidly worsening condition, seek emergency care now.',
    hi: 'एआई स्वास्थ्य सेवा अभी उपलब्ध नहीं है, इसलिए मैं आपके लक्षणों का विश्वसनीय आकलन नहीं कर सकता। कृपया बाद में पुनः प्रयास करें या योग्य स्वास्थ्य पेशेवर से संपर्क करें। गंभीर सीने में दर्द, सांस लेने में कठिनाई या तेजी से बिगड़ती स्थिति में तुरंत आपातकालीन सहायता लें।',
    mr: 'एआय आरोग्य सेवा सध्या उपलब्ध नाही, त्यामुळे मी लक्षणांचे विश्वसनीय मूल्यांकन करू शकत नाही. कृपया नंतर पुन्हा प्रयत्न करा किंवा पात्र आरोग्यतज्ज्ञांशी संपर्क साधा. छातीत तीव्र वेदना, श्वास घेण्यास त्रास किंवा प्रकृती झपाट्याने बिघडल्यास तातडीने आपत्कालीन मदत घ्या.'
  }
  return {
    reply: messages[language],
    symptomAnalysis: 'Not assessed: AI service unavailable.',
    riskLevel: 'MODERATE',
    preliminaryDiagnosis: 'No diagnosis generated. Human clinical assessment required.',
    recommendedCare: ['Contact a qualified healthcare professional for assessment.', 'Seek emergency care immediately for severe or rapidly worsening symptoms.'],
    preliminaryPrescription: [],
    doctorApprovalStatus: 'PENDING_DOCTOR_APPROVAL',
    triageLevel: 'amber',
    aiSummary: `AI service unavailable: ${reason}`,
    redFlagsDetected: [],
    followUpQuestions: ['If symptoms are severe or rapidly worsening, seek emergency care now.'],
    rawFormattedText: messages[language]
  }
}

export async function consultAIHealthDoctor(
  userQuery: string,
  history: { sender: string; message: string }[],
  context: ClinicalContext
): Promise<ConsultationResponse> {
  const language = context.preferredLanguage || 'en'
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return unavailableResponse('OpenRouter API key is not configured.', language)
  }

  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free'
  const systemPrompt = `You are an informational healthcare assistant, not a doctor. Respond in ${languageName(language)}. Never claim to be a physician, diagnose definitively, prescribe, recommend a specific medication/dose, or claim an ambulance/doctor has been contacted. Do not invent missing vitals, test results, or patient history. Use the supplied context only as context, not as verified clinical truth. Ask concise follow-up questions when information is insufficient. Identify emergency warning signs conservatively and advise local emergency services/in-person care immediately when appropriate. Encourage review by a licensed clinician. Clearly state that this is informational support, not a substitute for professional care. Do not produce prescriptions.

Patient context (may be incomplete):
Name: ${context.patientName}
Allergies: ${context.allergies.join(', ') || 'Not recorded'}
Existing conditions: ${context.existingDiseases.join(', ') || 'Not recorded'}
Current medicines: ${context.currentMedicines.join(', ') || 'Not recorded'}
Recent vitals: ${JSON.stringify(context.recentVitals || {})}
Lab report summaries: ${(context.recentLabReports || []).join('; ') || 'Not recorded'}
Prior consultations: ${(context.consultationHistory || []).join('; ') || 'None recorded'}`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(30000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'Medisense AI'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-10).map(h => ({ role: h.sender === 'patient' ? 'user' : 'assistant', content: h.message })),
          { role: 'user', content: userQuery }
        ],
        temperature: 0.2,
        max_tokens: 900
      })
    })

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300)
      console.error(`OpenRouter request failed (${response.status}): ${detail}`)
      return unavailableResponse(`OpenRouter returned HTTP ${response.status}.`, language)
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] }
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) return unavailableResponse('The model returned an empty response.', language)
    return parseAIFormattedResponse(content)
  } catch (error) {
    console.error('OpenRouter request failed:', error)
    return unavailableResponse('The AI provider could not be reached.', language)
  }
}

function parseAIFormattedResponse(text: string): ConsultationResponse {
  const upper = text.toUpperCase()
  const critical = /\b(CRITICAL|EMERGENCY|CALL AN AMBULANCE|SEEK EMERGENCY CARE)\b/.test(upper)
  const high = /\b(URGENT|HIGH RISK|IMMEDIATE MEDICAL)\b/.test(upper)
  const riskLevel = critical ? 'CRITICAL (EMERGENCY)' : high ? 'HIGH' : 'MODERATE'
  return {
    reply: text,
    symptomAnalysis: 'AI-generated informational symptom discussion; not a clinical diagnosis.',
    riskLevel,
    preliminaryDiagnosis: 'No definitive diagnosis. Clinical assessment required.',
    recommendedCare: ['Follow the safety guidance in the AI response.', 'Contact a licensed healthcare professional for individualized advice.'],
    preliminaryPrescription: [],
    doctorApprovalStatus: 'PENDING_DOCTOR_APPROVAL',
    triageLevel: critical || high ? 'red' : 'amber',
    aiSummary: text.slice(0, 500),
    redFlagsDetected: critical || high ? ['The AI response identified potentially urgent symptoms; arrange immediate human assessment.'] : [],
    followUpQuestions: [],
    rawFormattedText: text
  }
}

export const MVP_SYMPTOM_TREES = [
  {
    condition: 'Fever',
    icd10: 'R50.9',
    symptoms: ['High temperature', 'Chills', 'Sweating', 'Body ache'],
    triageQuestions: ['Is temperature above 102°F?', 'Are chills or rigors present?', 'Any stiff neck or rash?'],
    suggestedMeds: ['Paracetamol 650mg', 'ORS Hydration Sachet']
  },
  {
    condition: 'Cold & Cough',
    icd10: 'J00',
    symptoms: ['Runny nose', 'Sneezing', 'Sore throat', 'Dry cough'],
    triageQuestions: ['Is cough dry or productive?', 'Any shortness of breath?', 'Duration of symptoms?'],
    suggestedMeds: ['Levocetirizine 5mg', 'Dextromethorphan Syrup', 'Warm Saline Gargle']
  },
  {
    condition: 'Seasonal Flu',
    icd10: 'J10.1',
    symptoms: ['High fever', 'Severe myalgia', 'Fatigue', 'Headache'],
    triageQuestions: ['Can patient consume fluids?', 'Is there chest pain?'],
    suggestedMeds: ['Paracetamol 650mg', 'Vitamin C 500mg', 'Bed rest']
  },
  {
    condition: 'Headache',
    icd10: 'G44.2',
    symptoms: ['Throbbing pain', 'Temple pressure', 'Photophobia'],
    triageQuestions: ['Is it sudden thunderclap headache?', 'Any visual disturbance?'],
    suggestedMeds: ['Paracetamol 650mg', 'Quiet dark room rest']
  }
]
