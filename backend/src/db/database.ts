import * as schema from './schema'
import path from 'node:path'
import fs from 'node:fs'

export interface DbHandle {
  db: any
  kind: 'pg' | 'pglite'
  execRaw(sqlText: string): Promise<void>
  close(): Promise<void>
}

let dbInstance: DbHandle | null = null

export async function getDb(): Promise<DbHandle> {
  if (dbInstance) return dbInstance

  const databaseUrl = process.env.DATABASE_URL
  if (process.env.NODE_ENV === 'production' && !databaseUrl) {
    throw new Error('DATABASE_URL is required in production; embedded PGlite storage is ephemeral on most free hosts.')
  }
  const pgliteDir = process.env.PGLITE_DIR || path.resolve(process.cwd(), '.data/medisense_db')

  if (databaseUrl) {
    try {
      const { default: pg } = await import('pg')
      const { drizzle } = await import('drizzle-orm/node-postgres')
      const pool = new pg.Pool({ connectionString: databaseUrl })
      const db = drizzle(pool, { schema })
      dbInstance = {
        db,
        kind: 'pg',
        execRaw: async (s: string) => { await pool.query(s) },
        close: () => pool.end()
      }
      await initializeTables(dbInstance)
      return dbInstance
    } catch (e) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Production PostgreSQL connection failed: ${(e as Error).message}`)
      }
      console.warn('Failed to connect to PG pool, falling back to embedded PGlite:', (e as Error).message)
    }
  }

  // Use embedded PGlite for local development only. Production must use durable PostgreSQL.
  const { PGlite } = await import('@electric-sql/pglite')
  const { drizzle } = await import('drizzle-orm/pglite')

  fs.mkdirSync(pgliteDir, { recursive: true })
  const client = new PGlite(pgliteDir)
  await client.waitReady
  const db = drizzle(client, { schema })

  dbInstance = {
    db,
    kind: 'pglite',
    execRaw: async (s: string) => { await client.exec(s) },
    close: () => client.close()
  }

  await initializeTables(dbInstance)
  return dbInstance
}

async function initializeTables(dbHandle: DbHandle) {
  const ddl = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL DEFAULT '',
      otp_code TEXT,
      otp_expires_at TIMESTAMP,
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      patient_code TEXT NOT NULL UNIQUE,
      universal_health_id TEXT NOT NULL UNIQUE,
      blood_group TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      gender TEXT NOT NULL,
      allergies JSONB DEFAULT '[]'::jsonb,
      existing_diseases JSONB DEFAULT '[]'::jsonb,
      insurance_provider TEXT,
      insurance_policy_number TEXT,
      preferred_language TEXT DEFAULT 'en',
      emergency_contacts JSONB DEFAULT '[]'::jsonb,
      family_members JSONB DEFAULT '[]'::jsonb,
      health_score INTEGER DEFAULT 88,
      recovery_score INTEGER DEFAULT 92,
      compliance_score INTEGER DEFAULT 95,
      disease_risk_score TEXT DEFAULT 'Low',
      emergency_risk_score TEXT DEFAULT 'Normal',
      storage_provider TEXT DEFAULT 'google_drive',
      storage_reference_hash TEXT DEFAULT 'sha256:vault_root_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      doctor_code TEXT NOT NULL UNIQUE,
      specialization TEXT NOT NULL,
      hospital_name TEXT NOT NULL,
      registration_number TEXT NOT NULL,
      qualifications TEXT NOT NULL,
      experience_years INTEGER DEFAULT 10,
      consultation_fee INTEGER DEFAULT 500,
      available_days JSONB DEFAULT '["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]'::jsonb,
      bio TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS insurance_companies (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      company_name TEXT NOT NULL,
      license_number TEXT NOT NULL,
      tpa_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      claim_turnaround_hours INTEGER DEFAULT 24,
      automated_approval_limit INTEGER DEFAULT 50000,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS health_vault_records (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id) NOT NULL,
      record_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      issued_by TEXT NOT NULL,
      issued_date TEXT NOT NULL,
      storage_provider TEXT NOT NULL DEFAULT 'google_drive',
      storage_reference_hash TEXT NOT NULL,
      encryption_algo TEXT DEFAULT 'AES-GCM-256',
      encryption_metadata JSONB,
      consent_level TEXT DEFAULT 'doctor_accessible',
      file_url TEXT,
      file_size_bytes INTEGER DEFAULT 1024000,
      tags JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vault_consent_logs (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id) NOT NULL,
      doctor_id INTEGER REFERENCES doctors(id) NOT NULL,
      purpose TEXT NOT NULL,
      otp_code TEXT,
      is_verified BOOLEAN DEFAULT FALSE,
      granted_scope JSONB DEFAULT '["prescriptions", "reports", "vitals"]'::jsonb,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id) NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      form TEXT DEFAULT 'tablet',
      frequency TEXT DEFAULT 'Twice Daily',
      timing JSONB NOT NULL,
      food_relation TEXT DEFAULT 'after_food',
      start_date TEXT NOT NULL,
      duration_days INTEGER DEFAULT 7,
      remaining_quantity INTEGER DEFAULT 14,
      prescribed_by_doctor TEXT,
      ocr_extracted BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      instructions TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medicine_reminders (
      id SERIAL PRIMARY KEY,
      medicine_id INTEGER REFERENCES medicines(id) NOT NULL,
      patient_id INTEGER REFERENCES patients(id) NOT NULL,
      scheduled_time TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      escalation_stage TEXT DEFAULT '1_push',
      acknowledged_at TIMESTAMP,
      escalation_history JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id) NOT NULL,
      doctor_id INTEGER REFERENCES doctors(id) NOT NULL,
      date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      type TEXT DEFAULT 'video',
      status TEXT DEFAULT 'confirmed',
      chief_complaint TEXT,
      clinical_notes TEXT,
      webrtc_room_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_consultations (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id) NOT NULL,
      primary_symptom TEXT NOT NULL,
      language TEXT DEFAULT 'en',
      conversation_history JSONB DEFAULT '[]'::jsonb,
      triage_level TEXT DEFAULT 'green',
      ai_summary TEXT,
      reviewed_medical_history JSONB,
      suggested_diagnosis TEXT,
      suggested_prescription JSONB DEFAULT '[]'::jsonb,
      lifestyle_advice JSONB DEFAULT '[]'::jsonb,
      red_flags_detected JSONB DEFAULT '[]'::jsonb,
      doctor_review_status TEXT DEFAULT 'pending',
      assigned_doctor_id INTEGER REFERENCES doctors(id),
      doctor_notes TEXT,
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS insurance_claims (
      id SERIAL PRIMARY KEY,
      claim_number TEXT NOT NULL UNIQUE,
      patient_id INTEGER REFERENCES patients(id) NOT NULL,
      insurance_company_id INTEGER REFERENCES insurance_companies(id) NOT NULL,
      doctor_id INTEGER REFERENCES doctors(id),
      hospital_name TEXT NOT NULL,
      diagnosis_icd_10 TEXT NOT NULL,
      treatment_summary TEXT NOT NULL,
      claimed_amount INTEGER NOT NULL,
      approved_amount INTEGER DEFAULT 0,
      documents JSONB DEFAULT '[]'::jsonb,
      ai_eligibility_score INTEGER DEFAULT 94,
      ai_hospitalization_risk INTEGER DEFAULT 18,
      ai_fraud_score INTEGER DEFAULT 4,
      ai_verification_checklist JSONB DEFAULT '[]'::jsonb,
      ai_recommendation TEXT DEFAULT 'Approve',
      status TEXT DEFAULT 'submitted',
      settlement_date TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sos_events (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id) NOT NULL,
      status TEXT DEFAULT 'active',
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      address TEXT NOT NULL,
      primary_doctor_id INTEGER REFERENCES doctors(id),
      nearest_hospital TEXT NOT NULL,
      ambulance_eta_minutes INTEGER DEFAULT 8,
      emergency_package JSONB,
      dispatched_channels JSONB DEFAULT '[]'::jsonb,
      live_tracking_active BOOLEAN DEFAULT TRUE,
      tracking_updates JSONB DEFAULT '[]'::jsonb,
      resolved_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vitals_logs (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id) NOT NULL,
      recorded_at TEXT NOT NULL,
      systolic_bp INTEGER,
      diastolic_bp INTEGER,
      blood_sugar INTEGER,
      blood_sugar_type TEXT DEFAULT 'fasting',
      heart_rate INTEGER,
      spo2 INTEGER,
      temperature DOUBLE PRECISION,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      actor_id INTEGER,
      actor_name TEXT,
      actor_role TEXT,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      details JSONB,
      ip_address TEXT DEFAULT '127.0.0.1',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `
  await dbHandle.execRaw(ddl)

  // Forward-compatible migration for databases created by earlier MediSense builds.
  // CREATE TABLE IF NOT EXISTS does not add columns to an existing table; the auth
  // routes select the complete users row, so missing legacy columns break login.
  await dbHandle.execRaw(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'patient';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
  `)

  // Ensure email lookups remain indexed/unique where possible without deleting or
  // rewriting existing user records. Existing duplicates are preserved; in that
  // case the index is skipped and login can still query by email.
  try {
    await dbHandle.execRaw(`CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users (email) WHERE email IS NOT NULL`)
  } catch (error) {
    console.warn('Could not create users email unique index (existing duplicates may be present):', (error as Error).message)
  }
}
