import { getDb } from './database'
import * as schema from './schema'
import { eq } from 'drizzle-orm'

export async function seed() {
  const { db } = await getDb()

  console.log('🌱 Seeding Medisense AI database with investor-grade demo data...')

  // Check if users already seeded
  const existingUsers = await db.select().from(schema.users).limit(1)
  if (existingUsers.length > 0) {
    console.log('Database already contains records. Skipping seed.')
    return
  }

  // 1. Insert Users
  const userList = [
    // Patients
    { email: 'rahul@medisense.ai', phone: '+919820112233', name: 'Rahul Sharma', role: 'patient', passwordHash: 'demo123', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
    { email: 'priya@medisense.ai', phone: '+919820223344', name: 'Priya Patel', role: 'patient', passwordHash: 'demo123', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
    { email: 'amit@medisense.ai', phone: '+919820334455', name: 'Amit Verma', role: 'patient', passwordHash: 'demo123', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
    // Doctors
    { email: 'dr.anjali@medisense.ai', phone: '+919811001122', name: 'Dr. Anjali Mehta, MD', role: 'doctor', passwordHash: 'demo123', avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80' },
    { email: 'dr.iyer@medisense.ai', phone: '+919811334455', name: 'Dr. Rajesh Iyer, DM', role: 'doctor', passwordHash: 'demo123', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80' },
    // Insurance
    { email: 'insurance@medisense.ai', phone: '+911800200889', name: 'Star Health & Allied Claims', role: 'insurance', passwordHash: 'demo123', avatarUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80' },
    // Admin
    { email: 'admin@medisense.ai', phone: '+919999900000', name: 'Medisense Super Admin', role: 'admin', passwordHash: 'demo123', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' }
  ]

  const insertedUsers = await db.insert(schema.users).values(userList).returning()
  const [uRahul, uPriya, uAmit, uDrAnjali, uDrIyer, uInsurance, uAdmin] = insertedUsers

  // 2. Insert Doctors
  const insertedDoctors = await db.insert(schema.doctors).values([
    {
      userId: uDrAnjali.id,
      doctorCode: 'DOC-AI-0101',
      specialization: 'General Physician & Internal Medicine',
      hospitalName: 'Max Super Speciality Hospital, Mumbai',
      registrationNumber: 'MCI-MH-2012-09412',
      qualifications: 'MBBS, MD (Internal Medicine), FACP',
      experienceYears: 14,
      consultationFee: 700,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      bio: 'Senior consultant physician specializing in infectious diseases, viral epidemics, preventive health, and metabolic disorders.'
    },
    {
      userId: uDrIyer.id,
      doctorCode: 'DOC-AI-0102',
      specialization: 'Consultant Interventional Cardiologist',
      hospitalName: 'Fortis Escorts Heart Institute, Mumbai',
      registrationNumber: 'MCI-MH-2008-04192',
      qualifications: 'MBBS, MD, DM (Cardiology), FACC',
      experienceYears: 18,
      consultationFee: 1500,
      availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
      bio: 'Leading cardiologist handling advanced hypertension, cardiac risk stratification, preventive cardiology, and arrhythmia management.'
    }
  ]).returning()
  const [docAnjali, docIyer] = insertedDoctors

  // 3. Insert Insurance Company
  const [insStarHealth] = await db.insert(schema.insuranceCompanies).values([
    {
      userId: uInsurance.id,
      companyName: 'Star Health & Allied Insurance Co.',
      licenseNumber: 'IRDAI/NL-044/2006',
      tpaName: 'MediShield Global TPA Services',
      contactEmail: 'claims-adjudication@starhealth.in',
      contactPhone: '1800-425-2255',
      claimTurnaroundHours: 12,
      automatedApprovalLimit: 75000
    }
  ]).returning()

  // 4. Insert Patients
  const insertedPatients = await db.insert(schema.patients).values([
    // Patient 1: Fever Patient (Rahul Sharma)
    {
      userId: uRahul.id,
      patientCode: 'MED-P-10924',
      universalHealthId: 'MED-ABHA-91-4458-1290-7712',
      bloodGroup: 'O+',
      dateOfBirth: '1992-05-14',
      gender: 'Male',
      allergies: ['Penicillin', 'Sulfa Antibiotics'],
      existingDiseases: ['Mild Allergic Rhinitis'],
      insuranceProvider: 'Star Health & Allied Insurance Co.',
      insurancePolicyNumber: 'SH-IND-2026-904128',
      preferredLanguage: 'hi', // Hindi
      emergencyContacts: [
        { name: 'Sunita Sharma', relationship: 'Mother', phone: '+919820998811', isPrimary: true },
        { name: 'Vikram Sharma', relationship: 'Brother', phone: '+919820887722', isPrimary: false }
      ],
      familyMembers: [
        { name: 'Sunita Sharma', relationship: 'Mother', phone: '+919820998811', accessGranted: true },
        { name: 'Vikram Sharma', relationship: 'Brother', phone: '+919820887722', accessGranted: true }
      ],
      healthScore: 78,
      recoveryScore: 84,
      complianceScore: 92,
      diseaseRiskScore: 'Moderate',
      emergencyRiskScore: 'Guarded',
      storageProvider: 'google_drive',
      storageReferenceHash: 'sha256:gdrive_enc_91a0f88210e74b91b8a9cfd034a1'
    },
    // Patient 2: Diabetes Patient (Priya Patel)
    {
      userId: uPriya.id,
      patientCode: 'MED-P-10925',
      universalHealthId: 'MED-ABHA-91-3829-9182-3341',
      bloodGroup: 'B+',
      dateOfBirth: '1979-11-23',
      gender: 'Female',
      allergies: ['NSAIDs (Ibuprofen)'],
      existingDiseases: ['Type 2 Diabetes Mellitus', 'Dyslipidemia'],
      insuranceProvider: 'Star Health & Allied Insurance Co.',
      insurancePolicyNumber: 'SH-FLT-2025-441092',
      preferredLanguage: 'en',
      emergencyContacts: [
        { name: 'Kirit Patel', relationship: 'Spouse', phone: '+919821119933', isPrimary: true },
        { name: 'Ananya Patel', relationship: 'Daughter', phone: '+919821228844', isPrimary: false }
      ],
      familyMembers: [
        { name: 'Kirit Patel', relationship: 'Spouse', phone: '+919821119933', accessGranted: true }
      ],
      healthScore: 85,
      recoveryScore: 89,
      complianceScore: 96,
      diseaseRiskScore: 'Moderate',
      emergencyRiskScore: 'Normal',
      storageProvider: 'onedrive',
      storageReferenceHash: 'sha256:onedrive_enc_b98401ec8891f034bce904'
    },
    // Patient 3: Hypertension Patient (Amit Verma)
    {
      userId: uAmit.id,
      patientCode: 'MED-P-10926',
      universalHealthId: 'MED-ABHA-91-7712-4411-9920',
      bloodGroup: 'A+',
      dateOfBirth: '1966-08-10',
      gender: 'Male',
      allergies: ['Contrast Dye'],
      existingDiseases: ['Stage 2 Essential Hypertension', 'Hyperuricemia'],
      insuranceProvider: 'Star Health & Allied Insurance Co.',
      insurancePolicyNumber: 'SH-SNR-2024-118833',
      preferredLanguage: 'mr', // Marathi
      emergencyContacts: [
        { name: 'Neelam Verma', relationship: 'Spouse', phone: '+919833445566', isPrimary: true },
        { name: 'Rohan Verma', relationship: 'Son', phone: '+919833556677', isPrimary: false }
      ],
      familyMembers: [
        { name: 'Neelam Verma', relationship: 'Spouse', phone: '+919833445566', accessGranted: true },
        { name: 'Rohan Verma', relationship: 'Son', phone: '+919833556677', accessGranted: true }
      ],
      healthScore: 68,
      recoveryScore: 72,
      complianceScore: 81,
      diseaseRiskScore: 'High',
      emergencyRiskScore: 'Elevated',
      storageProvider: 'icloud',
      storageReferenceHash: 'sha256:icloud_vault_cc99104fae8701912'
    }
  ]).returning()
  const [patRahul, patPriya, patAmit] = insertedPatients

  // 5. Seed Health Vault Records
  await db.insert(schema.healthVaultRecords).values([
    {
      patientId: patRahul.id,
      recordType: 'lab_report',
      title: 'Complete Blood Count (CBC) & Dengue NS1 / Widal Panel',
      description: 'CBC showed mild leukocytosis (WBC 11,200), Dengue NS1 Antigen Negative, Platelet count 240,000.',
      issuedBy: 'Metropolis Diagnostics Lab, Mumbai',
      issuedDate: '2026-11-05',
      storageProvider: 'google_drive',
      storageReferenceHash: 'sha256:cbc_rahul_991823abce88',
      encryptionAlgo: 'AES-GCM-256',
      encryptionMetadata: {
        keyDerivation: 'PBKDF2-SHA512-100000',
        iv: 'c0a80101b0b1b2b3',
        authTag: '8f9e1d2c3b4a5f6e',
        patientPublicKeyFingerprint: 'FP-91-4458-1290-7712'
      },
      consentLevel: 'doctor_accessible',
      fileSizeBytes: 245000,
      tags: ['Hematology', 'Viral Fever', 'CBC', 'Platelets']
    },
    {
      patientId: patRahul.id,
      recordType: 'prescription',
      title: 'Previous Prescription - Acute Pharyngitis',
      description: 'Prescribed Azithromycin 500mg, Paracetamol 650mg, Lozenges by Dr. Anjali Mehta.',
      issuedBy: 'Dr. Anjali Mehta, MD',
      issuedDate: '2026-08-14',
      storageProvider: 'google_drive',
      storageReferenceHash: 'sha256:rx_aug2026_9011881',
      encryptionAlgo: 'AES-GCM-256',
      consentLevel: 'doctor_accessible',
      fileSizeBytes: 180000,
      tags: ['Prescription', 'ENT', 'Antibiotics']
    },
    {
      patientId: patRahul.id,
      recordType: 'xray',
      title: 'Digital Chest X-Ray PA View',
      description: 'Normal cardiac silhouette, clear bilateral lung fields, no focal consolidation or pleural effusion.',
      issuedBy: 'Max Healthcare Imaging Wing',
      issuedDate: '2026-08-15',
      storageProvider: 'google_drive',
      storageReferenceHash: 'sha256:cxr_rahul_33881188',
      encryptionAlgo: 'AES-GCM-256',
      consentLevel: 'doctor_accessible',
      fileSizeBytes: 4200000,
      tags: ['Imaging', 'Chest', 'Radiology']
    },
    // Priya's records
    {
      patientId: patPriya.id,
      recordType: 'lab_report',
      title: 'HbA1c Glycated Hemoglobin & Lipid Profile',
      description: 'HbA1c: 6.8% (Target < 7.0%), Fasting Glucose: 118 mg/dL, Total Cholesterol: 185 mg/dL, Triglycerides: 160 mg/dL.',
      issuedBy: 'Dr. Lal PathLabs, Mumbai',
      issuedDate: '2026-10-20',
      storageProvider: 'onedrive',
      storageReferenceHash: 'sha256:hba1c_priya_2026_10',
      consentLevel: 'doctor_accessible',
      fileSizeBytes: 310000,
      tags: ['Endocrinology', 'Diabetes', 'HbA1c', 'Lipids']
    },
    // Amit's records
    {
      patientId: patAmit.id,
      recordType: 'doctor_note',
      title: 'Cardiology 2D Echocardiography & ECG Report',
      description: 'ECG: Sinus rhythm with mild LVH voltage criteria. Echo: Normal LV systolic function, EF 58%, Grade 1 diastolic dysfunction.',
      issuedBy: 'Dr. Rajesh Iyer, DM - Fortis Escorts',
      issuedDate: '2026-09-12',
      storageProvider: 'icloud',
      storageReferenceHash: 'sha256:echo_amit_fortis_2026',
      consentLevel: 'doctor_accessible',
      fileSizeBytes: 1850000,
      tags: ['Cardiology', 'ECG', 'Echocardiogram', 'Hypertension']
    }
  ])

  // 6. Seed Medicines
  const insertedMedicines = await db.insert(schema.medicines).values([
    // Rahul's medicines
    {
      patientId: patRahul.id,
      name: 'Dolo 650mg (Paracetamol)',
      dosage: '650mg - 1 Tablet',
      form: 'tablet',
      frequency: 'Every 6 to 8 hours as needed for fever > 100°F',
      timing: { morning: true, afternoon: true, evening: false, night: true },
      foodRelation: 'after_food',
      startDate: '2026-11-06',
      durationDays: 5,
      remainingQuantity: 12,
      prescribedByDoctor: 'Dr. Anjali Mehta, MD',
      ocrExtracted: true,
      isActive: true,
      instructions: 'Do not exceed 3 tablets in 24 hours. Maintain adequate hydration.'
    },
    {
      patientId: patRahul.id,
      name: 'Levocetirizine 5mg',
      dosage: '5mg - 1 Tablet',
      form: 'tablet',
      frequency: 'Once Daily at Bedtime',
      timing: { morning: false, afternoon: false, evening: false, night: true },
      foodRelation: 'after_food',
      startDate: '2026-11-06',
      durationDays: 5,
      remainingQuantity: 4,
      prescribedByDoctor: 'Dr. Anjali Mehta, MD',
      ocrExtracted: true,
      isActive: true,
      instructions: 'For allergic rhinitis, runny nose and throat irritation. May cause mild drowsiness.'
    },
    // Priya's medicines
    {
      patientId: patPriya.id,
      name: 'Metformin Hydrochloride 500mg (SR)',
      dosage: '500mg - 1 Tablet',
      form: 'tablet',
      frequency: 'Twice Daily',
      timing: { morning: true, afternoon: false, evening: false, night: true },
      foodRelation: 'after_food',
      startDate: '2026-01-10',
      durationDays: 90,
      remainingQuantity: 42,
      prescribedByDoctor: 'Dr. Anjali Mehta, MD',
      isActive: true,
      instructions: 'Take immediately after breakfast and dinner to minimize GI upset.'
    },
    // Amit's medicines
    {
      patientId: patAmit.id,
      name: 'Telmisartan 40mg + Amlodipine 5mg',
      dosage: '40mg/5mg - 1 Tablet',
      form: 'tablet',
      frequency: 'Once Daily in Morning',
      timing: { morning: true, afternoon: false, evening: false, night: false },
      foodRelation: 'before_food',
      startDate: '2025-06-15',
      durationDays: 90,
      remainingQuantity: 30,
      prescribedByDoctor: 'Dr. Rajesh Iyer, DM',
      isActive: true,
      instructions: 'Monitor blood pressure weekly. Report any ankle swelling.'
    }
  ]).returning()
  const [medDolo, medLevo, medMetformin, medTelmi] = insertedMedicines

  // 7. Seed Medicine Reminders with 5-stage Escalation
  await db.insert(schema.medicineReminders).values([
    {
      medicineId: medDolo.id,
      patientId: patRahul.id,
      scheduledTime: '09:00 AM',
      scheduledDate: '2026-11-07',
      status: 'pending',
      escalationStage: '2_sms1',
      escalationHistory: [
        {
          stage: '1_push',
          timestamp: '2026-11-07T09:00:00Z',
          channel: 'Push Notification',
          status: 'sent',
          details: 'Dose reminder dispatched to Medisense mobile app'
        },
        {
          stage: '2_sms1',
          timestamp: '2026-11-07T09:05:00Z',
          channel: 'SMS Reminder 1',
          status: 'delivered',
          details: 'SMS sent to +919820112233: "Medisense Reminder: Take Dolo 650mg after breakfast."'
        }
      ]
    },
    {
      medicineId: medMetformin.id,
      patientId: patPriya.id,
      scheduledTime: '08:30 AM',
      scheduledDate: '2026-11-07',
      status: 'taken',
      escalationStage: '1_push',
      acknowledgedAt: new Date(),
      escalationHistory: [
        {
          stage: '1_push',
          timestamp: '2026-11-07T08:30:00Z',
          channel: 'Push Notification',
          status: 'acknowledged',
          details: 'Patient confirmed dose via single-tap in app'
        }
      ]
    },
    {
      medicineId: medTelmi.id,
      patientId: patAmit.id,
      scheduledTime: '08:00 AM',
      scheduledDate: '2026-11-07',
      status: 'missed',
      escalationStage: '6_doctor_escalated',
      escalationHistory: [
        { stage: '1_push', timestamp: '2026-11-07T08:00:00Z', channel: 'Push', status: 'delivered', details: 'Initial app notification' },
        { stage: '2_sms1', timestamp: '2026-11-07T08:05:00Z', channel: 'SMS', status: 'delivered', details: 'First SMS reminder' },
        { stage: '3_sms2', timestamp: '2026-11-07T08:10:00Z', channel: 'SMS', status: 'delivered', details: 'Urgent second SMS warning' },
        { stage: '4_voice', timestamp: '2026-11-07T08:15:00Z', channel: 'AI Voice Call', status: 'unanswered', details: 'Automated voice reminder rang 45s, no answer' },
        { stage: '5_ivrs', timestamp: '2026-11-07T08:20:00Z', channel: 'AI IVRS Call', status: 'unanswered', details: 'Interactive IVRS call failed to connect' },
        { stage: '6_doctor_escalated', timestamp: '2026-11-07T08:25:00Z', channel: 'Clinical Escalation', status: 'notified', details: 'Compliance dropped to 81%. Doctor Dr. Rajesh Iyer & family member Neelam Verma alerted.' }
      ]
    }
  ])

  // 8. Seed Appointments
  await db.insert(schema.appointments).values([
    {
      patientId: patRahul.id,
      doctorId: docAnjali.id,
      date: '2026-11-07',
      timeSlot: '03:30 PM',
      type: 'video',
      status: 'confirmed',
      chiefComplaint: 'High grade viral fever 102.4°F, retro-orbital headache, body aches for 2 days.',
      webrtcRoomId: 'room-consult-rahul-anjali-8812'
    },
    {
      patientId: patAmit.id,
      doctorId: docIyer.id,
      date: '2026-11-08',
      timeSlot: '11:00 AM',
      type: 'video',
      status: 'confirmed',
      chiefComplaint: 'Follow-up on fluctuating morning systolic BP (155-165 mmHg).',
      webrtcRoomId: 'room-consult-amit-iyer-4491'
    }
  ])

  // 9. Seed AI Consultations
  await db.insert(schema.aiConsultations).values([
    {
      patientId: patRahul.id,
      primarySymptom: 'Viral Fever & Headache',
      language: 'en',
      conversationHistory: [
        { sender: 'patient', message: 'Hello doctor, I have had a high fever for 2 days with severe headache and body pain.', timestamp: '10:00 AM' },
        { sender: 'ai', message: 'Hello Rahul. I have analyzed your health vault. I note your Penicillin allergy and mild allergic rhinitis. What was your latest temperature reading, and do you have any vomiting or rash?', timestamp: '10:01 AM' },
        { sender: 'patient', message: 'My temp is 101.8°F. No rash, mild nausea but no vomiting. My throat feels scratchy.', timestamp: '10:02 AM' },
        { sender: 'ai', message: 'Thank you. I have checked for red flags: SPO2 is normal (98%), no chest pain or stiff neck. Clinical impression: Acute Viral Syndrome with Upper Respiratory Symptoms. I am preparing a provisional treatment protocol for Dr. Anjali Mehta to verify and sign.', timestamp: '10:03 AM' }
      ],
      triageLevel: 'amber',
      aiSummary: '32-year-old male with 48h acute onset fever (101.8°F), frontal headache, myalgia, scratchy throat. Penicillin allergic. No respiratory distress (SPO2 98%). Platelets verified normal (240k) in recent CBC.',
      reviewedMedicalHistory: {
        allergiesChecked: ['Penicillin', 'Sulfa Antibiotics'],
        diseasesChecked: ['Mild Allergic Rhinitis'],
        activeMedicationsChecked: ['None currently'],
        recentVitalsChecked: { temp: 101.8, hr: 88, spo2: 98, bp: '122/78' }
      },
      suggestedDiagnosis: 'Acute Viral Pyrexia with Upper Respiratory Symptoms (ICD-10: B34.9)',
      suggestedPrescription: [
        { medicine: 'Paracetamol (Dolo) 650mg', dosage: '1 Tab', timing: 'TID after meals', duration: '3 days', instructions: 'Take for fever > 100°F or body pain' },
        { medicine: 'Levocetirizine 5mg', dosage: '1 Tab', timing: 'HS (Bedtime)', duration: '5 days', instructions: 'For throat irritation and allergic symptoms' },
        { medicine: 'Vitamin C + Zinc (Limcee Chewable)', dosage: '1 Tab', timing: 'OD morning', duration: '7 days', instructions: 'Immune support' }
      ],
      lifestyleAdvice: [
        'Drink at least 2.5 to 3 liters of warm water and electrolyte fluids daily.',
        'Steam inhalation twice daily for throat and nasal soothing.',
        'Strict rest and monitor temperature every 4 hours.'
      ],
      redFlagsDetected: ['High fever > 101°F duration > 48 hours'],
      doctorReviewStatus: 'pending',
      assignedDoctorId: docAnjali.id
    }
  ])

  // 10. Seed Insurance Claims
  await db.insert(schema.insuranceClaims).values([
    {
      claimNumber: 'CLM-2026-8819',
      patientId: patRahul.id,
      insuranceCompanyId: insStarHealth.id,
      doctorId: docAnjali.id,
      hospitalName: 'Max Super Speciality Hospital, Mumbai',
      diagnosisIcd10: 'B34.9 (Viral infection, unspecified)',
      treatmentSummary: 'Emergency OPD Daycare pyrexia workup, intravenous fluids, blood cultures, NS1 & CBC rapid assays.',
      claimedAmount: 14500,
      approvedAmount: 14500,
      documents: [
        { type: 'Daycare Discharge Bill', fileName: 'Bill_OPD_Nov05.pdf', fileHash: 'sha256:bill901844', verified: true },
        { type: 'Lab Investigation Reports', fileName: 'CBC_NS1_Report.pdf', fileHash: 'sha256:cbc901844', verified: true },
        { type: 'Treating Doctor Clinical Note', fileName: 'DrAnjali_ClinicalNote.pdf', fileHash: 'sha256:docnote901844', verified: true }
      ],
      aiEligibilityScore: 98,
      aiHospitalizationRisk: 12,
      aiFraudScore: 2, // Very low fraud risk
      aiVerificationChecklist: [
        { check: 'Policy Active & Premium Paid', passed: true, details: 'Active Star Health Comprehensive Policy' },
        { check: 'Pre-existing Disease Waiting Period', passed: true, details: 'Acute condition, not subject to exclusions' },
        { check: 'Treatment Cost Standard Benchmark', passed: true, details: 'Within standard GIPSA OPD package limits' },
        { check: 'Prescription & Diagnostic Match', passed: true, details: '100% correlation between doctor notes and billed services' }
      ],
      aiRecommendation: 'Approve',
      status: 'settled',
      settlementDate: '2026-11-06'
    },
    {
      claimNumber: 'CLM-2026-9042',
      patientId: patPriya.id,
      insuranceCompanyId: insStarHealth.id,
      doctorId: docAnjali.id,
      hospitalName: 'Apollo Hospitals, Mumbai',
      diagnosisIcd10: 'E11.9 (Type 2 diabetes without complications)',
      treatmentSummary: 'Annual comprehensive diabetic microvascular screening: fundus examination, biothesiometry, microalbuminuria, HbA1c.',
      claimedAmount: 18200,
      approvedAmount: 18200,
      documents: [
        { type: 'Hospital Screening Invoice', fileName: 'Apollo_Screening_Inv.pdf', fileHash: 'sha256:apollobill991', verified: true },
        { type: 'Diabetic Health Audit Report', fileName: 'Diabetic_Audit.pdf', fileHash: 'sha256:auditrep991', verified: true }
      ],
      aiEligibilityScore: 95,
      aiHospitalizationRisk: 16,
      aiFraudScore: 3,
      aiVerificationChecklist: [
        { check: 'Preventive Diabetic Health Rider', passed: true, details: 'Covered under Annual Wellness Benefit' },
        { check: 'ICD-10 Compatibility', passed: true, details: 'Codes match documented endocrinology protocol' }
      ],
      aiRecommendation: 'Approve',
      status: 'ai_validated',
      settlementDate: '2026-11-07'
    }
  ])

  // 11. Seed SOS Event (Active Emergency Tracking)
  await db.insert(schema.sosEvents).values([
    {
      patientId: patRahul.id,
      status: 'active',
      latitude: 19.0760,
      longitude: 72.8777,
      address: 'Near Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051',
      primaryDoctorId: docAnjali.id,
      nearestHospital: 'Asian Heart Institute & Lilavati Hospital',
      ambulanceEtaMinutes: 6,
      emergencyPackage: {
        patientName: 'Rahul Sharma',
        patientId: 'MED-P-10924',
        bloodGroup: 'O+',
        allergies: ['Penicillin', 'Sulfa Antibiotics'],
        existingDiseases: ['Mild Allergic Rhinitis'],
        currentMedicines: ['Dolo 650mg', 'Levocetirizine 5mg'],
        insuranceDetails: 'Star Health Policy # SH-IND-2026-904128, Sum Insured: ₹10,00,000',
        primaryDoctor: 'Dr. Anjali Mehta, MD (+919811001122)',
        emergencyContacts: [
          { name: 'Sunita Sharma (Mother)', phone: '+919820998811' },
          { name: 'Vikram Sharma (Brother)', phone: '+919820887722' }
        ]
      },
      dispatchedChannels: [
        { channel: 'sms', recipient: '+919811001122 (Dr. Anjali Mehta)', recipientType: 'doctor', status: 'delivered', timestamp: '2026-11-07T01:30:00Z' },
        { channel: 'ivrs', recipient: '+919811001122 (Dr. Anjali Mehta)', recipientType: 'doctor', status: 'connected', timestamp: '2026-11-07T01:30:15Z' },
        { channel: 'sms', recipient: '+919820998811 (Sunita Sharma)', recipientType: 'family', status: 'delivered', timestamp: '2026-11-07T01:30:02Z' },
        { channel: 'ivrs', recipient: '+919820998811 (Sunita Sharma)', recipientType: 'family', status: 'connected', timestamp: '2026-11-07T01:30:20Z' },
        { channel: 'push', recipient: 'Lilavati Emergency ER Desk', recipientType: 'hospital', status: 'delivered', timestamp: '2026-11-07T01:30:01Z' },
        { channel: 'email', recipient: 'claims-sos@starhealth.in', recipientType: 'insurance', status: 'sent', timestamp: '2026-11-07T01:30:05Z' }
      ],
      liveTrackingActive: true,
      trackingUpdates: [
        { timestamp: '2026-11-07T01:30:00Z', latitude: 19.0760, longitude: 72.8777, statusNote: 'SOS Triggered by Patient' },
        { timestamp: '2026-11-07T01:30:30Z', latitude: 19.0764, longitude: 72.8781, statusNote: 'Ambulance DL-01-MH-9412 Dispatched from Lilavati' },
        { timestamp: '2026-11-07T01:31:00Z', latitude: 19.0770, longitude: 72.8788, statusNote: 'Ambulance en route. Distance: 1.2 km' }
      ]
    }
  ])

  // 12. Seed Vitals Logs (Last 7 Days)
  const vitalsData = [
    // Rahul (Fever trend)
    { patientId: patRahul.id, recordedAt: '2026-11-01', systolicBp: 118, diastolicBp: 76, bloodSugar: 92, heartRate: 72, spo2: 99, temperature: 98.4, notes: 'Normal baseline' },
    { patientId: patRahul.id, recordedAt: '2026-11-03', systolicBp: 120, diastolicBp: 78, bloodSugar: 96, heartRate: 76, spo2: 98, temperature: 98.6, notes: 'Felt slight fatigue' },
    { patientId: patRahul.id, recordedAt: '2026-11-05', systolicBp: 124, diastolicBp: 80, bloodSugar: 104, heartRate: 94, spo2: 98, temperature: 102.4, notes: 'High fever, shivering, body ache' },
    { patientId: patRahul.id, recordedAt: '2026-11-06', systolicBp: 122, diastolicBp: 79, bloodSugar: 99, heartRate: 88, spo2: 98, temperature: 101.8, notes: 'After Dolo 650mg fever dropped slightly' },
    { patientId: patRahul.id, recordedAt: '2026-11-07', systolicBp: 120, diastolicBp: 78, bloodSugar: 95, heartRate: 84, spo2: 98, temperature: 100.2, notes: 'Improving on medication' },

    // Priya (Diabetes tracking)
    { patientId: patPriya.id, recordedAt: '2026-11-01', systolicBp: 122, diastolicBp: 80, bloodSugar: 132, heartRate: 74, spo2: 99, temperature: 98.6, notes: 'Fasting glucose' },
    { patientId: patPriya.id, recordedAt: '2026-11-03', systolicBp: 124, diastolicBp: 82, bloodSugar: 128, heartRate: 75, spo2: 98, temperature: 98.5, notes: 'Fasting glucose post workout' },
    { patientId: patPriya.id, recordedAt: '2026-11-05', systolicBp: 120, diastolicBp: 78, bloodSugar: 122, heartRate: 72, spo2: 99, temperature: 98.4, notes: 'Fasting glucose' },
    { patientId: patPriya.id, recordedAt: '2026-11-07', systolicBp: 122, diastolicBp: 80, bloodSugar: 118, heartRate: 74, spo2: 99, temperature: 98.6, notes: 'Optimal fasting control on Metformin' },

    // Amit (Hypertension tracking - elevated alerts)
    { patientId: patAmit.id, recordedAt: '2026-11-01', systolicBp: 148, diastolicBp: 92, bloodSugar: 105, heartRate: 78, spo2: 97, temperature: 98.4, notes: 'Evening reading' },
    { patientId: patAmit.id, recordedAt: '2026-11-03', systolicBp: 154, diastolicBp: 96, bloodSugar: 108, heartRate: 82, spo2: 97, temperature: 98.6, notes: 'Work stress, missed morning dose' },
    { patientId: patAmit.id, recordedAt: '2026-11-05', systolicBp: 162, diastolicBp: 98, bloodSugar: 112, heartRate: 86, spo2: 96, temperature: 98.4, notes: 'Elevated BP alert flagged by AI monitor' },
    { patientId: patAmit.id, recordedAt: '2026-11-07', systolicBp: 158, diastolicBp: 95, bloodSugar: 110, heartRate: 84, spo2: 97, temperature: 98.5, notes: 'Clinical consultation scheduled with Dr. Iyer' }
  ]
  await db.insert(schema.vitalsLogs).values(vitalsData)

  // 13. Seed Audit Logs
  await db.insert(schema.auditLogs).values([
    { actorId: uRahul.id, actorName: 'Rahul Sharma', actorRole: 'patient', action: 'VAULT_RECORD_CREATED', resourceType: 'health_vault_records', resourceId: '1', details: { title: 'CBC Lab Report' } },
    { actorId: uRahul.id, actorName: 'Rahul Sharma', actorRole: 'patient', action: 'EMERGENCY_SOS_TRIGGERED', resourceType: 'sos_events', resourceId: '1', details: { location: 'Bandra Kurla Complex' } },
    { actorId: uDrAnjali.id, actorName: 'Dr. Anjali Mehta', actorRole: 'doctor', action: 'PATIENT_CONSENT_ACCESSED', resourceType: 'patients', resourceId: '1', details: { purpose: 'Clinical review of viral pyrexia' } },
    { actorId: uInsurance.id, actorName: 'Star Health Adjudicator', actorRole: 'insurance', action: 'CLAIM_SETTLED_AI_INSTANT', resourceType: 'insurance_claims', resourceId: '1', details: { amount: 14500, score: 98 } }
  ])

  console.log('✅ Medisense AI database seeded successfully with all investor personas and records!')
}
