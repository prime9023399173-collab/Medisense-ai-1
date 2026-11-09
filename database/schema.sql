-- =========================================================================
-- MEDISENSE AI - PRODUCTION POSTGRESQL DATABASE SCHEMA DDL
-- Standard: PostgreSQL 14+ / 15+ / 16+ / ElectricSQL PGlite
-- =========================================================================

-- 1. USERS & IDENTITY
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('patient', 'doctor', 'insurance', 'admin')),
    password_hash VARCHAR(255) NOT NULL DEFAULT '',
    otp_code VARCHAR(16),
    otp_expires_at TIMESTAMP,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. PATIENTS & UNIVERSAL HEALTH ID
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    patient_code VARCHAR(64) NOT NULL UNIQUE,
    universal_health_id VARCHAR(128) NOT NULL UNIQUE,
    blood_group VARCHAR(16) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(16) NOT NULL,
    allergies JSONB DEFAULT '[]'::jsonb,
    existing_diseases JSONB DEFAULT '[]'::jsonb,
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(128),
    preferred_language VARCHAR(16) DEFAULT 'en',
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    family_members JSONB DEFAULT '[]'::jsonb,
    health_score INTEGER DEFAULT 88 CHECK (health_score BETWEEN 0 AND 100),
    recovery_score INTEGER DEFAULT 92 CHECK (recovery_score BETWEEN 0 AND 100),
    compliance_score INTEGER DEFAULT 95 CHECK (compliance_score BETWEEN 0 AND 100),
    disease_risk_score VARCHAR(32) DEFAULT 'Low',
    emergency_risk_score VARCHAR(32) DEFAULT 'Normal',
    storage_provider VARCHAR(64) DEFAULT 'google_drive',
    storage_reference_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patients_code ON patients(patient_code);
CREATE INDEX IF NOT EXISTS idx_patients_health_id ON patients(universal_health_id);

-- 3. DOCTORS & CLINICAL SPECIALISTS
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    doctor_code VARCHAR(64) NOT NULL UNIQUE,
    specialization VARCHAR(128) NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(128) NOT NULL UNIQUE,
    qualifications VARCHAR(255) NOT NULL,
    experience_years INTEGER DEFAULT 10,
    consultation_fee INTEGER DEFAULT 500,
    available_days JSONB DEFAULT '["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]'::jsonb,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. INSURANCE COMPANIES & TPAS
CREATE TABLE IF NOT EXISTS insurance_companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(128) NOT NULL UNIQUE,
    tpa_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(32) NOT NULL,
    claim_turnaround_hours INTEGER DEFAULT 24,
    automated_approval_limit INTEGER DEFAULT 50000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. HEALTH VAULT RECORDS (PATIENT CONTROLLED ENCRYPTION METADATA)
CREATE TABLE IF NOT EXISTS health_vault_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    record_type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    issued_by VARCHAR(255) NOT NULL,
    issued_date DATE NOT NULL,
    storage_provider VARCHAR(64) NOT NULL DEFAULT 'google_drive',
    storage_reference_hash VARCHAR(255) NOT NULL,
    encryption_algo VARCHAR(64) DEFAULT 'AES-GCM-256',
    encryption_metadata JSONB,
    consent_level VARCHAR(64) DEFAULT 'doctor_accessible',
    file_url TEXT,
    file_size_bytes INTEGER DEFAULT 1024000,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vault_patient ON health_vault_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_vault_type ON health_vault_records(record_type);

-- 6. VAULT CONSENT & OTP AUDIT
CREATE TABLE IF NOT EXISTS vault_consent_logs (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
    purpose TEXT NOT NULL,
    otp_code VARCHAR(16),
    is_verified BOOLEAN DEFAULT FALSE,
    granted_scope JSONB DEFAULT '["prescriptions", "reports", "vitals"]'::jsonb,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. MEDICINE MANAGEMENT & DOSAGE
CREATE TABLE IF NOT EXISTS medicines (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(128) NOT NULL,
    form VARCHAR(64) DEFAULT 'tablet',
    frequency VARCHAR(128) DEFAULT 'Twice Daily',
    timing JSONB NOT NULL,
    food_relation VARCHAR(64) DEFAULT 'after_food',
    start_date DATE NOT NULL,
    duration_days INTEGER DEFAULT 7,
    remaining_quantity INTEGER DEFAULT 14,
    prescribed_by_doctor VARCHAR(255),
    ocr_extracted BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. 5-STAGE MEDICINE REMINDER ESCALATION ENGINE
CREATE TABLE IF NOT EXISTS medicine_reminders (
    id SERIAL PRIMARY KEY,
    medicine_id INTEGER REFERENCES medicines(id) ON DELETE CASCADE NOT NULL,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    scheduled_time VARCHAR(32) NOT NULL,
    scheduled_date DATE NOT NULL,
    status VARCHAR(32) DEFAULT 'pending',
    escalation_stage VARCHAR(32) DEFAULT '1_push',
    acknowledged_at TIMESTAMP,
    escalation_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 9. APPOINTMENTS & WEBRTC ROOMS
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(32) NOT NULL,
    type VARCHAR(32) DEFAULT 'video',
    status VARCHAR(32) DEFAULT 'confirmed',
    chief_complaint TEXT,
    clinical_notes TEXT,
    webrtc_room_id VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. AI HEALTH DOCTOR CONSULTATIONS & SUGGESTED PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS ai_consultations (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    primary_symptom VARCHAR(255) NOT NULL,
    language VARCHAR(16) DEFAULT 'en',
    conversation_history JSONB DEFAULT '[]'::jsonb,
    triage_level VARCHAR(16) DEFAULT 'green',
    ai_summary TEXT,
    reviewed_medical_history JSONB,
    suggested_diagnosis TEXT,
    suggested_prescription JSONB DEFAULT '[]'::jsonb,
    lifestyle_advice JSONB DEFAULT '[]'::jsonb,
    redFlags_detected JSONB DEFAULT '[]'::jsonb,
    doctor_review_status VARCHAR(32) DEFAULT 'pending',
    assigned_doctor_id INTEGER REFERENCES doctors(id),
    doctor_notes TEXT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 11. INSURANCE CLAIMS & AI ADJUDICATION
CREATE TABLE IF NOT EXISTS insurance_claims (
    id SERIAL PRIMARY KEY,
    claim_number VARCHAR(128) NOT NULL UNIQUE,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    insurance_company_id INTEGER REFERENCES insurance_companies(id) ON DELETE CASCADE NOT NULL,
    doctor_id INTEGER REFERENCES doctors(id),
    hospital_name VARCHAR(255) NOT NULL,
    diagnosis_icd_10 VARCHAR(64) NOT NULL,
    treatment_summary TEXT NOT NULL,
    claimed_amount INTEGER NOT NULL,
    approved_amount INTEGER DEFAULT 0,
    documents JSONB DEFAULT '[]'::jsonb,
    ai_eligibility_score INTEGER DEFAULT 94,
    ai_hospitalization_risk INTEGER DEFAULT 18,
    ai_fraud_score INTEGER DEFAULT 4,
    ai_verification_checklist JSONB DEFAULT '[]'::jsonb,
    ai_recommendation VARCHAR(64) DEFAULT 'Approve',
    status VARCHAR(32) DEFAULT 'submitted',
    settlement_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 12. EMERGENCY SOS & LIVE TRACKING
CREATE TABLE IF NOT EXISTS sos_events (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(32) DEFAULT 'active',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    primary_doctor_id INTEGER REFERENCES doctors(id),
    nearest_hospital VARCHAR(255) NOT NULL,
    ambulance_eta_minutes INTEGER DEFAULT 8,
    emergency_package JSONB,
    dispatched_channels JSONB DEFAULT '[]'::jsonb,
    live_tracking_active BOOLEAN DEFAULT TRUE,
    tracking_updates JSONB DEFAULT '[]'::jsonb,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 13. DAILY VITALS TELEMETRY LOGS
CREATE TABLE IF NOT EXISTS vitals_logs (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    recorded_at DATE NOT NULL,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    blood_sugar INTEGER,
    blood_sugar_type VARCHAR(32) DEFAULT 'fasting',
    heart_rate INTEGER,
    spo2 INTEGER,
    temperature DOUBLE PRECISION,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 14. IMMUTABLE AUDIT TRAIL
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER,
    actor_name VARCHAR(255),
    actor_role VARCHAR(64),
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(128) NOT NULL,
    resource_id VARCHAR(128),
    details JSONB,
    ip_address VARCHAR(64) DEFAULT '127.0.0.1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
