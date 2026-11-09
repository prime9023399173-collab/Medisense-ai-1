import { pgTable, text, serial, integer, timestamp, boolean, jsonb, doublePrecision } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'patient', 'doctor', 'insurance', 'admin'
  passwordHash: text('password_hash').notNull().default(''),
  otpCode: text('otp_code'),
  otpExpiresAt: timestamp('otp_expires_at'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  patientCode: text('patient_code').notNull().unique(), // e.g., 'MED-P-10924'
  universalHealthId: text('universal_health_id').notNull().unique(), // 'MED-ABHA-91-4458-1290'
  bloodGroup: text('blood_group').notNull(), // 'O+', 'A+', 'B+', 'AB-', etc.
  dateOfBirth: text('date_of_birth').notNull(),
  gender: text('gender').notNull(),
  allergies: jsonb('allergies').$type<string[]>().default([]),
  existingDiseases: jsonb('existing_diseases').$type<string[]>().default([]),
  insuranceProvider: text('insurance_provider'),
  insurancePolicyNumber: text('insurance_policy_number'),
  preferredLanguage: text('preferred_language').default('en'), // 'en', 'hi', 'mr'
  emergencyContacts: jsonb('emergency_contacts').$type<{
    name: string
    relationship: string
    phone: string
    isPrimary: boolean
  }[]>().default([]),
  familyMembers: jsonb('family_members').$type<{
    name: string
    relationship: string
    phone: string
    accessGranted: boolean
  }[]>().default([]),
  // Real-time AI Computed Scores
  healthScore: integer('health_score').default(88), // 0-100
  recoveryScore: integer('recovery_score').default(92), // 0-100
  complianceScore: integer('compliance_score').default(95), // 0-100
  diseaseRiskScore: text('disease_risk_score').default('Low'), // 'Low', 'Moderate', 'High', 'Critical'
  emergencyRiskScore: text('emergency_risk_score').default('Normal'), // 'Normal', 'Guarded', 'Elevated', 'High'
  storageProvider: text('storage_provider').default('google_drive'), // 'google_drive', 'onedrive', 'icloud', 'device_storage'
  storageReferenceHash: text('storage_reference_hash').default('sha256:vault_root_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  doctorCode: text('doctor_code').notNull().unique(), // 'DOC-AI-4401'
  specialization: text('specialization').notNull(), // 'General Physician', 'Cardiologist', etc.
  hospitalName: text('hospital_name').notNull(),
  registrationNumber: text('registration_number').notNull(),
  qualifications: text('qualifications').notNull(),
  experienceYears: integer('experience_years').default(10),
  consultationFee: integer('consultation_fee').default(500),
  availableDays: jsonb('available_days').$type<string[]>().default(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const insuranceCompanies = pgTable('insurance_companies', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  companyName: text('company_name').notNull(),
  licenseNumber: text('license_number').notNull(),
  tpaName: text('tpa_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone').notNull(),
  claimTurnaroundHours: integer('claim_turnaround_hours').default(24),
  automatedApprovalLimit: integer('automated_approval_limit').default(50000), // Max in INR for instant AI pass
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const healthVaultRecords = pgTable('health_vault_records', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  recordType: text('record_type').notNull(), // 'prescription', 'lab_report', 'xray', 'mri', 'ct_scan', 'doctor_note', 'vaccination'
  title: text('title').notNull(),
  description: text('description'),
  issuedBy: text('issued_by').notNull(),
  issuedDate: text('issued_date').notNull(),
  storageProvider: text('storage_provider').notNull().default('google_drive'),
  storageReferenceHash: text('storage_reference_hash').notNull(),
  encryptionAlgo: text('encryption_algo').default('AES-GCM-256'),
  encryptionMetadata: jsonb('encryption_metadata').$type<{
    keyDerivation: string
    iv: string
    authTag: string
    patientPublicKeyFingerprint: string
  }>(),
  consentLevel: text('consent_level').default('doctor_accessible'), // 'confidential', 'doctor_accessible', 'emergency_accessible'
  fileUrl: text('file_url'),
  fileSizeBytes: integer('file_size_bytes').default(1024000),
  tags: jsonb('tags').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const vaultConsentLogs = pgTable('vault_consent_logs', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  doctorId: integer('doctor_id').references(() => doctors.id).notNull(),
  purpose: text('purpose').notNull(),
  otpCode: text('otp_code'),
  isVerified: boolean('is_verified').default(false),
  grantedScope: jsonb('granted_scope').$type<string[]>().default(['prescriptions', 'reports', 'vitals']),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const medicines = pgTable('medicines', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  name: text('name').notNull(), // e.g. 'Paracetamol 650mg'
  dosage: text('dosage').notNull(), // '650mg', '1 Tablet'
  form: text('form').default('tablet'), // 'tablet', 'capsule', 'syrup', 'injection'
  frequency: text('frequency').default('Twice Daily'),
  timing: jsonb('timing').$type<{
    morning: boolean
    afternoon: boolean
    evening: boolean
    night: boolean
    customTimes?: string[]
  }>().notNull(),
  foodRelation: text('food_relation').default('after_food'), // 'before_food', 'after_food', 'with_food'
  startDate: text('start_date').notNull(),
  durationDays: integer('duration_days').default(7),
  remainingQuantity: integer('remaining_quantity').default(14),
  prescribedByDoctor: text('prescribed_by_doctor'),
  ocrExtracted: boolean('ocr_extracted').default(false),
  isActive: boolean('is_active').default(true),
  instructions: text('instructions'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const medicineReminders = pgTable('medicine_reminders', {
  id: serial('id').primaryKey(),
  medicineId: integer('medicine_id').references(() => medicines.id).notNull(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  scheduledTime: text('scheduled_time').notNull(), // '09:00 AM'
  scheduledDate: text('scheduled_date').notNull(), // '2026-11-07'
  status: text('status').default('pending'), // 'pending', 'taken', 'missed', 'snoozed'
  escalationStage: text('escalation_stage').default('1_push'), // '1_push', '2_sms1', '3_sms2', '4_voice', '5_ivrs', '6_doctor_escalated'
  acknowledgedAt: timestamp('acknowledged_at'),
  escalationHistory: jsonb('escalation_history').$type<{
    stage: string
    timestamp: string
    channel: string
    status: string
    details: string
  }[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  doctorId: integer('doctor_id').references(() => doctors.id).notNull(),
  date: text('date').notNull(),
  timeSlot: text('time_slot').notNull(),
  type: text('type').default('video'), // 'video', 'in_person'
  status: text('status').default('confirmed'), // 'requested', 'confirmed', 'completed', 'cancelled'
  chiefComplaint: text('chief_complaint'),
  clinicalNotes: text('clinical_notes'),
  webrtcRoomId: text('webrtc_room_id'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const aiConsultations = pgTable('ai_consultations', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  primarySymptom: text('primary_symptom').notNull(), // 'Fever', 'Viral Fever', 'Cold', 'Cough', 'Flu', 'Headache'
  language: text('language').default('en'), // 'en', 'hi', 'mr'
  conversationHistory: jsonb('conversation_history').$type<{
    sender: 'patient' | 'ai' | 'doctor'
    message: string
    timestamp: string
    options?: string[]
  }[]>().default([]),
  triageLevel: text('triage_level').default('green'), // 'green' (mild), 'amber' (moderate), 'red' (critical/escalate)
  aiSummary: text('ai_summary'),
  reviewedMedicalHistory: jsonb('reviewed_medical_history').$type<{
    allergiesChecked: string[]
    diseasesChecked: string[]
    activeMedicationsChecked: string[]
    recentVitalsChecked: Record<string, any>
  }>(),
  suggestedDiagnosis: text('suggested_diagnosis'),
  suggestedPrescription: jsonb('suggested_prescription').$type<{
    medicine: string
    dosage: string
    timing: string
    duration: string
    instructions: string
  }[]>().default([]),
  lifestyleAdvice: jsonb('lifestyle_advice').$type<string[]>().default([]),
  redFlagsDetected: jsonb('red_flags_detected').$type<string[]>().default([]),
  doctorReviewStatus: text('doctor_review_status').default('pending'), // 'pending', 'approved', 'modified', 'declined'
  assignedDoctorId: integer('assigned_doctor_id').references(() => doctors.id),
  doctorNotes: text('doctor_notes'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const insuranceClaims = pgTable('insurance_claims', {
  id: serial('id').primaryKey(),
  claimNumber: text('claim_number').notNull().unique(), // 'CLM-2026-8819'
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  insuranceCompanyId: integer('insurance_company_id').references(() => insuranceCompanies.id).notNull(),
  doctorId: integer('doctor_id').references(() => doctors.id),
  hospitalName: text('hospital_name').notNull(),
  diagnosisIcd10: text('diagnosis_icd_10').notNull(), // e.g. 'J06.9', 'E11.9', 'I10'
  treatmentSummary: text('treatment_summary').notNull(),
  claimedAmount: integer('claimed_amount').notNull(),
  approvedAmount: integer('approved_amount').default(0),
  documents: jsonb('documents').$type<{
    type: string
    fileName: string
    fileHash: string
    verified: boolean
  }[]>().default([]),
  // AI Insurance Engine Metrics
  aiEligibilityScore: integer('ai_eligibility_score').default(94), // 0-100%
  aiHospitalizationRisk: integer('ai_hospitalization_risk').default(18), // 0-100%
  aiFraudScore: integer('ai_fraud_score').default(4), // 0-100% (Low is good)
  aiVerificationChecklist: jsonb('ai_verification_checklist').$type<{
    check: string
    passed: boolean
    details: string
  }[]>().default([]),
  aiRecommendation: text('ai_recommendation').default('Approve'), // 'Approve', 'Review Required', 'Reject'
  status: text('status').default('submitted'), // 'submitted', 'ai_validated', 'doctor_verified', 'settled', 'rejected'
  settlementDate: text('settlement_date'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const sosEvents = pgTable('sos_events', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  status: text('status').default('active'), // 'active', 'dispatched', 'patient_reached', 'resolved'
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  address: text('address').notNull(),
  primaryDoctorId: integer('primary_doctor_id').references(() => doctors.id),
  nearestHospital: text('nearest_hospital').notNull(),
  ambulanceEtaMinutes: integer('ambulance_eta_minutes').default(8),
  emergencyPackage: jsonb('emergency_package').$type<{
    patientName: string
    patientId: string
    bloodGroup: string
    allergies: string[]
    existingDiseases: string[]
    currentMedicines: string[]
    insuranceDetails: string
    primaryDoctor: string
    emergencyContacts: any[]
  }>(),
  dispatchedChannels: jsonb('dispatched_channels').$type<{
    channel: 'sms' | 'push' | 'email' | 'ivrs'
    recipient: string
    recipientType: 'doctor' | 'hospital' | 'insurance' | 'family'
    status: 'sent' | 'delivered' | 'calling' | 'connected'
    timestamp: string
  }[]>().default([]),
  liveTrackingActive: boolean('live_tracking_active').default(true),
  trackingUpdates: jsonb('tracking_updates').$type<{
    timestamp: string
    latitude: number
    longitude: number
    statusNote: string
  }[]>().default([]),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const vitalsLogs = pgTable('vitals_logs', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  recordedAt: text('recorded_at').notNull(),
  systolicBp: integer('systolic_bp'), // e.g. 120
  diastolicBp: integer('diastolic_bp'), // e.g. 80
  bloodSugar: integer('blood_sugar'), // mg/dL
  bloodSugarType: text('blood_sugar_type').default('fasting'), // 'fasting', 'post_prandial', 'random'
  heartRate: integer('heart_rate'), // bpm e.g. 74
  spo2: integer('spo2'), // % e.g. 98
  temperature: doublePrecision('temperature'), // Fahrenheit e.g. 98.6
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id'),
  actorName: text('actor_name'),
  actorRole: text('actor_role'),
  action: text('action').notNull(), // 'LOGIN', 'SOS_TRIGGERED', 'CONSENT_GRANTED', 'PRESCRIPTION_APPROVED', 'CLAIM_SETTLED', etc.
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  details: jsonb('details'),
  ipAddress: text('ip_address').default('127.0.0.1'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})
