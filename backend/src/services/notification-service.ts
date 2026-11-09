export interface MultilingualTemplate {
  en: string
  hi: string
  mr: string
}

export const NOTIFICATION_TEMPLATES = {
  medicineReminderPush: {
    en: '⏰ Medisense Dose Alert: Time to take your {{medicineName}} ({{dosage}}). Please confirm once taken.',
    hi: '⏰ मेडिसेंस दवा सूचना: {{medicineName}} ({{dosage}}) लेने का समय हो गया है। लेने के बाद कृपया पुष्टि करें।',
    mr: '⏰ मेडिसेंस डोस अलर्ट: आपली {{medicineName}} ({{dosage}}) घेण्याची वेळ झाली आहे. कृपया घेतल्यानंतर पुष्टी करा.'
  },
  medicineReminderSMS1: {
    en: 'Medisense Health Reminder: Dear {{patientName}}, your scheduled medicine {{medicineName}} ({{dosage}}) was due at {{scheduledTime}}. Kindly take it with water.',
    hi: 'मेडिसेंस स्वास्थ्य रिमाइंडर: प्रिय {{patientName}} जी, आपकी दवा {{medicineName}} ({{dosage}}) का समय {{scheduledTime}} था। कृपया इसे समय पर लें।',
    mr: 'मेडिसेंस आरोग्य रिमाइंडर: प्रिय {{patientName}} जी, आपले औषध {{medicineName}} ({{dosage}}) घेण्याची वेळ {{scheduledTime}} होती. कृपया वेळेवर घ्या.'
  },
  medicineReminderSMS2: {
    en: 'URGENT - Medisense Alert: You have not acknowledged your {{medicineName}} dose. Skipping doses impairs recovery. Tap https://medisense.ai/m/{{reminderId}} to confirm.',
    hi: 'अति आवश्यक - मेडिसेंस सूचना: आपने अभी तक {{medicineName}} नहीं ली है। खुराक छोड़ना स्वास्थ्य के लिए हानिकारक है। पुष्टि के लिए लिंक खोलें: https://medisense.ai/m/{{reminderId}}',
    mr: 'अति तातडीचे - मेडिसेंस सूचना: आपण अद्याप {{medicineName}} घेतलेले नाही. औषध चुकवणे आरोग्यास अपायकारक आहे. पुष्टीसाठी लिंक उघडा: https://medisense.ai/m/{{reminderId}}'
  },
  medicineVoiceCallScript: {
    en: 'Hello {{patientName}}. This is an automated voice reminder from Medisense AI Health System. You have a scheduled dose of {{medicineName}} {{dosage}} {{foodRelation}}. Please take your medication now to stay compliant with Dr. {{doctorName}}\'s treatment plan. Thank you.',
    hi: 'नमस्ते {{patientName}} जी। यह मेडिसेंस एआई हेल्थ सिस्टम से एक स्वचालित वॉइस रिमाइंडर कॉल है। आपकी दवा {{medicineName}} {{dosage}} लेने का समय हो चुका है। कृपया डॉक्टर {{doctorName}} के उपचार नियम का पालन करते हुए अपनी दवा तुरंत लें। धन्यवाद।',
    mr: 'नमस्कार {{patientName}} जी. हा मेडिसेंस एआय आरोग्य प्रणालीचा स्वयंचलित व्हॉइस कॉल आहे. आपली {{medicineName}} {{dosage}} औषध घेण्याची वेळ झाली आहे. कृपया डॉ. {{doctorName}} यांच्या सल्ल्यानुसार औषध त्वरित घ्यावे. धन्यवाद.'
  },
  medicineIvrsScript: {
    en: 'Welcome to Medisense Interactive Medicine Verification. We noticed you have not taken {{medicineName}} {{dosage}}. Press 1 if you have just taken your medicine. Press 2 if you are experiencing side effects. Press 3 if you need to reschedule or speak to your care team.',
    hi: 'मेडिसेंस इंटरएक्टिव दवा सत्यापन में आपका स्वागत है। आपकी दवा {{medicineName}} अभी तक नहीं ली गई है। यदि आपने दवा ले ली है तो 1 दबाएं। यदि कोई साइड इफ़ेक्ट है तो 2 दबाएं। डॉक्टर या केयर टीम से बात करने के लिए 3 दबाएं।',
    mr: 'मेडिसेंस परस्परसंवादी औषध पडताळणीमध्ये आपले स्वागत आहे. आपण अद्याप {{medicineName}} औषध घेतलेले नाही. औषध घेतले असल्यास 1 दाबा. काही त्रास किंवा साइड इफेक्ट असल्यास 2 दाबा. डॉक्टर किंवा काळजीवाहू टीमशी बोलण्यासाठी 3 दाबा.'
  },
  medicineMissedDoctorEscalation: {
    en: 'CLINICAL ALERT: Patient {{patientName}} (ID: {{patientId}}) has missed their scheduled dose of {{medicineName}} after 5-stage automated escalation. Compliance score dropped to {{complianceScore}}%. Family contacts notified.',
    hi: 'चिकित्सीय चेतावनी: मरीज {{patientName}} (आईडी: {{patientId}}) ने 5-स्तरीय अलर्ट के बाद भी {{medicineName}} दवा छोड़ दी है। कम्प्लायंस स्कोर घटकर {{complianceScore}}% हो गया है। परिवार को सूचित कर दिया गया है।',
    mr: 'वैद्यकीय सूचना: रुग्ण {{patientName}} (आयडी: {{patientId}}) यांनी 5-स्तरीय अलर्टनंतरही {{medicineName}} औषध चुकवले आहे. कम्प्लायन्स स्कोर घसरून {{complianceScore}}% झाला आहे. कुटुंबियांना सूचित केले आहे.'
  },
  sosSMS: {
    en: 'EMERGENCY SOS: Patient {{patientName}} (ID: {{patientId}}, Blood: {{bloodGroup}}) triggered Medical SOS at {{address}}. Live GPS: https://maps.google.com/?q={{latitude}},{{longitude}} | Allergies: {{allergies}} | Meds: {{currentMeds}} | Ambulance dispatched ETA: 6 mins.',
    hi: 'आपातकालीन SOS: मरीज {{patientName}} (आईडी: {{patientId}}, रक्त समूह: {{bloodGroup}}) ने {{address}} पर मेडिकल SOS दबाया है। लाइव जीपीएस: https://maps.google.com/?q={{latitude}},{{longitude}} | एलर्जी: {{allergies}} | एम्बुलेंस रवाना: 6 मिनट.',
    mr: 'आपत्कालीन SOS: रुग्ण {{patientName}} (आयडी: {{patientId}}, रक्तगट: {{bloodGroup}}) यांनी {{address}} येथे मेडिकल SOS दिला आहे. थेट GPS: https://maps.google.com/?q={{latitude}},{{longitude}} | एलर्जी: {{allergies}} | रुग्णवाहिका रवाना: 6 मिनिटे.'
  },
  sosIvrsScript: {
    en: 'CRITICAL ALERT from Medisense Emergency Response System. Patient {{patientName}}, Universal Health ID {{patientId}}, has activated emergency SOS at {{address}}. Blood Group: {{bloodGroup}}. Known allergies: {{allergies}}. Current conditions: {{diseases}}. Emergency response teams, primary physician Dr. {{doctorName}}, and family members have been alerted. Connecting you to live tracking now.',
    hi: 'मेडिसेंस इमरजेंसी रिस्पांस सिस्टम से अत्यंत महत्वपूर्ण सूचना। मरीज {{patientName}}, हेल्थ आईडी {{patientId}}, ने {{address}} पर इमरजेंसी SOS सक्रिय किया है। रक्त समूह: {{bloodGroup}}। एलर्जी: {{allergies}}। एम्बुलेंस और डॉक्टर {{doctorName}} को अलर्ट भेज दिया गया है।',
    mr: 'मेडिसेंस आपत्कालीन प्रतिसाद प्रणालीवरून अति महत्त्वाचा इशारा. रुग्ण {{patientName}}, हेल्थ आयडी {{patientId}}, यांनी {{address}} येथे इमर्जन्सी SOS सक्रिय केला आहे. रक्तगट: {{bloodGroup}}. एलर्जी: {{allergies}}. रुग्णवाहिका व डॉ. {{doctorName}} यांना सतर्क करण्यात आले आहे.'
  },
  sosEmailSubject: {
    en: '[URGENT SOS] Medical Emergency Alert: Patient {{patientName}} (ID: {{patientId}})',
    hi: '[अति आवश्यक SOS] मेडिकल इमरजेंसी अलर्ट: मरीज {{patientName}} (आईडी: {{patientId}})',
    mr: '[अति तातडीचे SOS] वैद्यकीय आपत्कालीन अलर्ट: रुग्ण {{patientName}} (आयडी: {{patientId}})'
  }
}

export function renderTemplate(templateStr: string, variables: Record<string, any>): string {
  let res = templateStr
  for (const [key, val] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    res = res.replace(regex, String(val ?? ''))
  }
  return res
}

export interface DispatchedLog {
  id: string
  channel: 'push' | 'sms' | 'email' | 'voice' | 'ivrs'
  recipient: string
  recipientType: 'patient' | 'doctor' | 'hospital' | 'insurance' | 'family'
  subject?: string
  content: string
  status: 'sent' | 'delivered' | 'calling' | 'connected' | 'unanswered'
  timestamp: string
}

export const dispatchLogs: DispatchedLog[] = []

export async function sendSimulatedNotification(
  channel: 'push' | 'sms' | 'email' | 'voice' | 'ivrs',
  recipient: string,
  recipientType: 'patient' | 'doctor' | 'hospital' | 'insurance' | 'family',
  content: string,
  subject?: string
): Promise<DispatchedLog> {
  const log: DispatchedLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    channel,
    recipient,
    recipientType,
    subject,
    content,
    status: channel === 'voice' || channel === 'ivrs' ? 'connected' : 'delivered',
    timestamp: new Date().toISOString()
  }
  dispatchLogs.unshift(log)
  if (dispatchLogs.length > 200) dispatchLogs.pop()

  console.log(`📡 [${channel.toUpperCase()}] to ${recipient} (${recipientType}): ${content.slice(0, 80)}...`)
  return log
}
