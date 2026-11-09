import { createContext } from 'react'

export type MobileLanguage = 'en' | 'hi' | 'mr'

export const mobileText = {
  en: {
    signOut: 'Sign out', welcome: 'Welcome back,', healthScore: 'LIVE HEALTH SCORE', optimal: 'Health overview', adherence: 'Adherence',
    healthId: 'Universal Health ID', medicines: 'Prescription medicines', aiDoctor: 'AI Health Doctor', claims: 'Insurance & claims', appointments: 'Appointments', family: 'Family care', emergency: 'Emergency SOS', vault: 'Patient Health Vault',
    emergencyContacts: 'Emergency contacts',
    records: 'Encrypted records', directory: 'Directory', analytics: 'Analytics', aiRequests: 'AI requests', claimQueue: 'Claims',
    symptoms: 'Describe your symptoms', send: 'Send', analyzing: 'Reviewing symptoms and health records...', forward: 'Send recommendation for doctor approval', forwarded: 'Sent to doctor for review',
    newClaim: 'New claim', submitClaim: 'Submit claim', timeline: 'Claim timeline', familySubtitle: 'Emergency status and approved contacts', requestHelp: 'Request emergency help', noAlerts: 'No active SOS alerts.',
    demoOnly: 'Demo workflow only. It does not transmit a real insurance claim or payment.'
  },
  hi: {
    signOut: 'लॉग आउट', welcome: 'वापस स्वागत है,', healthScore: 'लाइव स्वास्थ्य स्कोर', optimal: 'स्वास्थ्य विवरण', adherence: 'दवा पालन',
    healthId: 'यूनिवर्सल हेल्थ आईडी', medicines: 'दवाइयां', aiDoctor: 'एआई स्वास्थ्य डॉक्टर', claims: 'बीमा और क्लेम', appointments: 'अपॉइंटमेंट', family: 'परिवार की देखभाल', emergency: 'आपातकालीन एसओएस', vault: 'मरीज स्वास्थ्य वॉल्ट',
    emergencyContacts: 'आपातकालीन संपर्क',
    records: 'एन्क्रिप्टेड रिकॉर्ड', directory: 'मरीज सूची', analytics: 'विश्लेषण', aiRequests: 'एआई अनुरोध', claimQueue: 'क्लेम',
    symptoms: 'अपने लक्षण बताएं', send: 'भेजें', analyzing: 'लक्षण और स्वास्थ्य रिकॉर्ड देखे जा रहे हैं...', forward: 'डॉक्टर की मंजूरी के लिए भेजें', forwarded: 'डॉक्टर की समीक्षा के लिए भेजा गया',
    newClaim: 'नया क्लेम', submitClaim: 'क्लेम जमा करें', timeline: 'क्लेम की स्थिति', familySubtitle: 'आपात स्थिति और स्वीकृत संपर्क', requestHelp: 'आपातकालीन सहायता मांगें', noAlerts: 'कोई सक्रिय एसओएस अलर्ट नहीं है।',
    demoOnly: 'केवल डेमो प्रक्रिया। वास्तविक बीमा दावा या भुगतान नहीं भेजा जाता।'
  },
  mr: {
    signOut: 'बाहेर पडा', welcome: 'पुन्हा स्वागत आहे,', healthScore: 'थेट आरोग्य गुण', optimal: 'आरोग्याचा आढावा', adherence: 'औषध पालन',
    healthId: 'युनिव्हर्सल हेल्थ आयडी', medicines: 'औषधे', aiDoctor: 'एआय आरोग्य डॉक्टर', claims: 'विमा आणि क्लेम', appointments: 'अपॉइंटमेंट्स', family: 'कुटुंबाची काळजी', emergency: 'आपत्कालीन एसओएस', vault: 'रुग्ण आरोग्य व्हॉल्ट',
    emergencyContacts: 'आपत्कालीन संपर्क',
    records: 'एन्क्रिप्टेड नोंदी', directory: 'रुग्ण यादी', analytics: 'विश्लेषण', aiRequests: 'एआय विनंत्या', claimQueue: 'क्लेम',
    symptoms: 'आपली लक्षणे सांगा', send: 'पाठवा', analyzing: 'लक्षणे आणि आरोग्य नोंदी तपासत आहोत...', forward: 'डॉक्टरांच्या मंजुरीसाठी पाठवा', forwarded: 'डॉक्टरांच्या तपासणीसाठी पाठवले',
    newClaim: 'नवीन क्लेम', submitClaim: 'क्लेम जमा करा', timeline: 'क्लेमची स्थिती', familySubtitle: 'आपत्कालीन स्थिती आणि मंजूर संपर्क', requestHelp: 'आपत्कालीन मदत मागा', noAlerts: 'कोणतेही सक्रिय एसओएस अलर्ट नाहीत.',
    demoOnly: 'फक्त डेमो प्रक्रिया. खरा विमा दावा किंवा पेमेंट पाठवले जात नाही.'
  }
} as const

export const MobileLanguageContext = createContext<{
  language: MobileLanguage
  setLanguage: (language: MobileLanguage) => void
}>({ language: 'en', setLanguage: () => undefined })