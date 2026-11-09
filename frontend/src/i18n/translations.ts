// Comprehensive Multilingual Translation System for Medisense AI (EN, HI, MR)

export type Language = 'en' | 'hi' | 'mr'

export const translations = {
  en: {
    // Brand
    brandName: 'Medisense',
    brandTagline: 'Connected Healthcare Ecosystem',
    systemLive: 'Live Sync Active',
    
    // Navbar
    navPatient: 'Patient Portal',
    navDoctor: 'Doctor Portal',
    navInsurance: 'Insurance Portal',
    navFamily: 'Family Portal',
    navMobile: 'Mobile App',
    navAdmin: 'Admin',
    navLogin: 'Sign In',
    sosButton: 'EMERGENCY SOS',

    // Patient Portal
    patientTitle: 'Patient Health Portal',
    patientCode: 'Patient ID',
    abhaId: 'Universal Health ID',
    bloodGroup: 'Blood Group',
    healthScore: 'Health Score',
    tabVault: 'Health Vault',
    tabMedicines: 'Medicines',
    tabAiChat: 'AI Chat Doctor',
    tabAiVoice: 'AI Voice Doctor',
    tabAiVideo: 'AI Video Doctor',
    tabAppointments: 'Appointments',
    btnInsuranceClaim: 'Insurance Claim',

    // AI Doctors
    aiChatTitle: 'Medisense AI Chat Doctor',
    aiVoiceTitle: 'Medisense AI Voice Doctor',
    aiVideoTitle: 'Medisense AI Video Doctor',
    aiDoctorSubtitle: 'Clinical triage pre-analyzing medical history, allergies & lab reports',
    voiceTapToTalk: 'Tap Microphone to Speak Symptoms',
    voiceListening: 'Listening to your voice... Speak your symptoms clearly',
    voiceSpeaking: 'AI Doctor is speaking clinical diagnosis...',
    videoDoctorSubtitle: 'Live WebRTC Teleconsultation with Photorealistic Clinical Avatar',
    btnSendToDoctor: 'Forward Recommendation To Doctor For Approval',
    sentToDoctor: 'Visible in Doctor Review Queue ✓',

    // Clinical Script Labels
    symptomAnalysis: 'SYMPTOM ANALYSIS',
    riskLevel: 'RISK LEVEL',
    preliminaryDiagnosis: 'PRELIMINARY DIAGNOSIS',
    recommendedCare: 'RECOMMENDED CARE',
    preliminaryPrescription: 'PRELIMINARY PRESCRIPTION',
    doctorApprovalStatus: 'DOCTOR APPROVAL STATUS',

    // Doctor Portal
    docAttending: 'Senior Consultant Attending',
    docHospital: 'Max Super Speciality Hospital, Mumbai',
    docTabReview: 'AI Prescriptions',
    docTabClaims: 'Insurance Claim Audits',
    docTabPatients: 'Patient Vault Directory',
    docTabAnalytics: 'AI Patient Analytics',
    docTabVideo: 'WebRTC Teleconsult',
    docAddPatientTitle: 'Enroll Patient into Care Roster by Patient ID / ABHA Code',
    docAddPatientBtn: 'Add Patient To Roster',
    docQuickSample: 'Quick Sample IDs',
    docVerifyBtn: 'Clinically Verify & Deliver to Patient (1-Click)',
    docVerifyClaimBtn: 'Verify Clinical Medical Necessity & Sign Off',

    // Insurance Portal
    insTitle: 'Star Health & Allied Insurance Co.',
    insSubtitle: 'Automated Claim Adjudication Node',
    insVolume: 'Total Claims Volume',
    insFraudDetection: 'AI Fraud Detection',
    insHospitalizationRisk: 'Hospitalization Risk',
    insProcessingTime: 'Average Turnaround',
    insLiveQueue: 'Live Claims Queue',
    insAutomatedLoop: 'Run Entire 4-Step Loop Automatically (Investor Demo)',
    insStep1: '1. Patient Claim Ingested',
    insStep2: '2. Medical History Analyzed & Forwarded to Doctor',
    insStep3: '3. Doctor Certified Medical Necessity',
    insStep4: '4. Instant IMPS Payout Settled',
    insHoldMessage: '⚠️ Claim Placed On Hold (Forensic Review)',

    // Family Portal
    famTitle: 'Family Guardian Care Network',
    famSubtitle: 'Kin oversight and real-time emergency telemetry tracking',
    famDispatchSos: 'Dispatch SOS from Family View',
    famContacts: 'Authorized Family Contacts',
    famCompliance: 'Medication Adherence',
    famUpcoming: 'Upcoming Consultations',

    // Emergency SOS Modal
    sosTitle: 'Medical Emergency SOS Active',
    sosSubtitle: 'Multi-Channel Broadcast to Doctor, Lilavati ER, Star Health & Family',
    sosAmbulanceEta: 'Ambulance ETA',
    sosNearestHospital: 'Nearest ER Center',
    sosCashless: 'Cashless TPA',
    sosMarkResolved: 'Mark SOS as Resolved'
  },

  hi: {
    // Brand
    brandName: 'मेडिसेंस',
    brandTagline: 'कनेक्टेड हेल्थकेयर इकोसिस्टम',
    systemLive: 'लाइव सिंक सक्रिय',

    // Navbar
    navPatient: 'मरीज पोर्टल',
    navDoctor: 'डॉक्टर पोर्टल',
    navInsurance: 'बीमा पोर्टल',
    navFamily: 'परिवार पोर्टल',
    navMobile: 'मोबाइल ऐप',
    navAdmin: 'एडमिन',
    navLogin: 'लॉग इन',
    sosButton: 'आपातकालीन एसओएस',

    // Patient Portal
    patientTitle: 'मरीज स्वास्थ्य पोर्टल',
    patientCode: 'मरीज आईडी',
    abhaId: 'आभा हेल्थ आईडी',
    bloodGroup: 'रक्त समूह',
    healthScore: 'स्वास्थ्य स्कोर',
    tabVault: 'हेल्थ वॉल्ट',
    tabMedicines: 'दवाइयां',
    tabAiChat: 'एआई चैट डॉक्टर',
    tabAiVoice: 'एआई वॉयस डॉक्टर',
    tabAiVideo: 'एआई वीडियो डॉक्टर',
    tabAppointments: 'अपॉइंटमेंट',
    btnInsuranceClaim: 'बीमा क्लेम',

    // AI Doctors
    aiChatTitle: 'मेडिसेंस एआई चैट डॉक्टर',
    aiVoiceTitle: 'मेडिसेंस एआई वॉयस डॉक्टर',
    aiVideoTitle: 'मेडिसेंस एआई वीडियो डॉक्टर',
    aiDoctorSubtitle: 'मेडिकल हिस्ट्री, एलर्जी और रिपोर्ट्स का विश्लेषण करने वाला क्लिनिकल ट्रायज',
    voiceTapToTalk: 'लक्षण बोलने के लिए माइक पर टैप करें',
    voiceListening: 'आपकी आवाज सुनी जा रही है... अपने लक्षण स्पष्ट बोलें',
    voiceSpeaking: 'एआई डॉक्टर क्लिनिकल परामर्श बोल रहा है...',
    videoDoctorSubtitle: 'लाइव वीडियो अवतार के साथ क्लिनिकल टेलीकंसल्टेशन',
    btnSendToDoctor: 'मंजूरी के लिए डॉक्टर को सिफारिश भेजें',
    sentToDoctor: 'डॉक्टर पोर्टल में दिखाई दे रहा है ✓',

    // Clinical Script Labels
    symptomAnalysis: 'लक्षण विश्लेषण (SYMPTOM ANALYSIS)',
    riskLevel: 'जोखिम स्तर (RISK LEVEL)',
    preliminaryDiagnosis: 'प्रारंभिक निदान (PRELIMINARY DIAGNOSIS)',
    recommendedCare: 'अनुशंसित देखभाल (RECOMMENDED CARE)',
    preliminaryPrescription: 'प्रारंभिक प्रिस्क्रिप्शन (PRELIMINARY PRESCRIPTION)',
    doctorApprovalStatus: 'डॉक्टर मंजूरी स्थिति (DOCTOR APPROVAL STATUS)',

    // Doctor Portal
    docAttending: 'वरिष्ठ सलाहकार चिकित्सक',
    docHospital: 'मैक्स सुपर स्पेशियलिटी अस्पताल, मुंबई',
    docTabReview: 'एआई प्रिस्क्रिप्शन',
    docTabClaims: 'बीमा क्लेम ऑडिट',
    docTabPatients: 'मरीज डायरेक्टरी वॉल्ट',
    docTabAnalytics: 'एआई मरीज विश्लेषण',
    docTabVideo: 'टेलीकंसल्टेशन',
    docAddPatientTitle: 'मरीज आईडी / आभा कोड द्वारा रोस्टर में मरीज जोड़ें',
    docAddPatientBtn: 'रोस्टर में जोड़ें',
    docQuickSample: 'त्वरित सैंपल आईडी',
    docVerifyBtn: 'सत्यापित करें और मरीज को भेजें (1-क्लिक)',
    docVerifyClaimBtn: 'क्लिनिकल आवश्यकता सत्यापित करें और हस्ताक्षर करें',

    // Insurance Portal
    insTitle: 'स्टार हेल्थ एंड एलाइड इंश्योरेंस कंपनी',
    insSubtitle: 'स्वचालित क्लेम निपटान नोड',
    insVolume: 'कुल क्लेम राशि',
    insFraudDetection: 'एआई धोखाधड़ी जांच',
    insHospitalizationRisk: 'अस्पताल में भर्ती जोखिम',
    insProcessingTime: 'औसत प्रोसेसिंग समय',
    insLiveQueue: 'लाइव क्लेम कतार',
    insAutomatedLoop: 'पूरा 4-चरणीय लूप स्वचालित चलाएं (निवेशक डेमो)',
    insStep1: '१. मरीज का क्लेम प्राप्त हुआ',
    insStep2: '२. मेडिकल हिस्ट्री का विश्लेषण और डॉक्टर को प्रेषित',
    insStep3: '३. डॉक्टर द्वारा क्लिनिकल आवश्यकता सत्यापित',
    insStep4: '४. तुरंत आईएमपीएस द्वारा भुगतान निपटान',
    insHoldMessage: '⚠️ क्लेम जांच के लिए होल्ड पर रखा गया',

    // Family Portal
    famTitle: 'पारिवारिक देखभाल नेटवर्क',
    famSubtitle: 'परिजनों की निगरानी और आपातकालीन टेलीमेट्री ट्रैकिंग',
    famDispatchSos: 'परिवार पोर्टल से एसओएस भेजें',
    famContacts: 'अधिकृत पारिवारिक संपर्क',
    famCompliance: 'दवा लेने का अनुपात',
    famUpcoming: 'आगामी डॉक्टर परामर्श',

    // Emergency SOS Modal
    sosTitle: 'आपातकालीन एसओएस सक्रिय',
    sosSubtitle: 'डॉक्टर, लीलावती अस्पताल ईआर, स्टार हेल्थ और परिवार को तुरंत प्रसारण',
    sosAmbulanceEta: 'एम्बुलेंस पहुंचने का समय',
    sosNearestHospital: 'निकटतम आपातकालीन केंद्र',
    sosCashless: 'कैशलेस टीपीए',
    sosMarkResolved: 'एसओएस को पूर्ण चिह्नित करें'
  },

  mr: {
    // Brand
    brandName: 'मेडिसेंस',
    brandTagline: 'कनेक्टेड हेल्थकेअर इकोसिस्टम',
    systemLive: 'थेट सिंक सक्रिय',

    // Navbar
    navPatient: 'रुग्ण पोर्टल',
    navDoctor: 'डॉक्टर पोर्टल',
    navInsurance: 'विमा पोर्टल',
    navFamily: 'कुटुंब पोर्टल',
    navMobile: 'मोबाईल ॲप',
    navAdmin: 'प्रशासक',
    navLogin: 'लॉग इन',
    sosButton: 'तातडीचे एसओएस',

    // Patient Portal
    patientTitle: 'रुग्ण आरोग्य पोर्टल',
    patientCode: 'रुग्ण आयडी',
    abhaId: 'आभा हेल्थ आयडी',
    bloodGroup: 'रक्तगट',
    healthScore: 'आरोग्य स्कोअर',
    tabVault: 'हेल्थ व्हॉल्ट',
    tabMedicines: 'औषधे',
    tabAiChat: 'एआय चॅट डॉक्टर',
    tabAiVoice: 'एआय व्हॉइस डॉक्टर',
    tabAiVideo: 'एआय व्हिडिओ डॉक्टर',
    tabAppointments: 'अपॉइंटमेंट्स',
    btnInsuranceClaim: 'विमा क्लेम',

    // AI Doctors
    aiChatTitle: 'मेडिसेंस एआय चॅट डॉक्टर',
    aiVoiceTitle: 'मेडिसेंस एआय व्हॉइस डॉक्टर',
    aiVideoTitle: 'मेडिसेंस एआय व्हिडिओ डॉक्टर',
    aiDoctorSubtitle: 'वैद्यकीय इतिहास, एलर्जी व तपासणी अहवाल तपासणारा क्लिनिकल ट्रायज',
    voiceTapToTalk: 'लक्षणे बोलण्यासाठी माइकवर टॅप करा',
    voiceListening: 'तुमचा आवाज ऐकला जात आहे... आपली लक्षणे स्पष्ट सांगा',
    voiceSpeaking: 'एआय डॉक्टर वैद्यकीय सल्ला बोलत आहेत...',
    videoDoctorSubtitle: 'थेट व्हिडिओ अवतारासह क्लिनिकल टेलीकन्सल्टेशन',
    btnSendToDoctor: 'मंजुरीसाठी डॉक्टरांकडे पाठवा',
    sentToDoctor: 'डॉक्टर पोर्टलमध्ये दिसत आहे ✓',

    // Clinical Script Labels
    symptomAnalysis: 'लक्षण विश्लेषण (SYMPTOM ANALYSIS)',
    riskLevel: 'जोखीम पातळी (RISK LEVEL)',
    preliminaryDiagnosis: 'प्राथमिक निदान (PRELIMINARY DIAGNOSIS)',
    recommendedCare: 'शिफारस केलेली काळजी (RECOMMENDED CARE)',
    preliminaryPrescription: 'प्राथमिक प्रिस्क्रिप्शन (PRELIMINARY PRESCRIPTION)',
    doctorApprovalStatus: 'डॉक्टर मंजुरी स्थिती (DOCTOR APPROVAL STATUS)',

    // Doctor Portal
    docAttending: 'वरिष्ठ सल्लागार डॉक्टर',
    docHospital: 'मॅक्स सुपर स्पेशालिटी हॉस्पिटल, मुंबई',
    docTabReview: 'एआय प्रिस्क्रिप्शन',
    docTabClaims: 'विमा क्लेम ऑडिट',
    docTabPatients: 'रुग्ण डिरेक्टरी व्हॉल्ट',
    docTabAnalytics: 'एआय रुग्ण विश्लेषण',
    docTabVideo: 'टेलीकन्सल्टेशन',
    docAddPatientTitle: 'रुग्ण आयडी / आभा कोड द्वारे रोस्टरमध्ये नोंदणी करा',
    docAddPatientBtn: 'रोस्टरमध्ये जोडा',
    docQuickSample: 'त्वरित नमुना आयडी',
    docVerifyBtn: 'प्रमाणित करा आणि रुग्णास पाठवा (१-क्लिक)',
    docVerifyClaimBtn: 'क्लिनिकल गरज प्रमाणित करा आणि स्वाक्षरी करा',

    // Insurance Portal
    insTitle: 'स्टार हेल्थ अँड अलाईड इन्शुरन्स कंपनी',
    insSubtitle: 'स्वयंचलित क्लेम निपटारा नोड',
    insVolume: 'एकूण क्लेम रक्कम',
    insFraudDetection: 'एआय फसवणूक तपासणी',
    insHospitalizationRisk: 'हॉस्पिटल दाखल जोखीम',
    insProcessingTime: 'सरासरी प्रक्रिया वेळ',
    insLiveQueue: 'थेट क्लेम रांग',
    insAutomatedLoop: 'पूर्ण ४-टप्प्यांची लूप स्वयंचलित चालवा (डेमो)',
    insStep1: '१. रुग्णाचा क्लेम प्राप्त झाला',
    insStep2: '२. वैद्यकीय इतिहास तपासला आणि डॉक्टरांकडे पाठवला',
    insStep3: '३. डॉक्टरांकडून क्लिनिकल गरज प्रमाणित',
    insStep4: '४. तात्काळ आयएमपीएस द्वारे रक्कम जमा',
    insHoldMessage: '⚠️ क्लेम तपासणीसाठी होल्डवर ठेवला आहे',

    // Family Portal
    famTitle: 'कौटुंबिक काळजी नेटवर्क',
    famSubtitle: 'नातेवाईक देखरेख आणि थेट आपत्कालीन ट्रॅकिंग',
    famDispatchSos: 'कुटुंब पोर्टलवरून एसओएस पाठवा',
    famContacts: 'अधिकृत कौटुंबिक संपर्क',
    famCompliance: 'औषध घेण्याचे प्रमाण',
    famUpcoming: 'पुढील डॉक्टर सल्ला',

    // Emergency SOS Modal
    sosTitle: 'तातडीचे एसओएस सक्रिय',
    sosSubtitle: 'डॉक्टर, लीलावती रुग्णालय, स्टार हेल्थ आणि कुटुंबाला त्वरित संदेश',
    sosAmbulanceEta: 'ॲम्ब्युलन्स पोहोचण्याची वेळ',
    sosNearestHospital: 'जवळचे आपत्कालीन केंद्र',
    sosCashless: 'कॅशलेस टीपीए',
    sosMarkResolved: 'एसओएस पूर्ण म्हणून चिन्हांकित करा'
  }
}

export function useTranslation(lang: Language) {
  return translations[lang] || translations.en
}
