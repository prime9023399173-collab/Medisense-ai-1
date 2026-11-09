# Medisense AI - Entity-Relationship (ER) Architecture

```mermaid
erDiagram
    USERS ||--o| PATIENTS : "identifies as"
    USERS ||--o| DOCTORS : "practices as"
    USERS ||--o| INSURANCE_COMPANIES : "operates as"
    USERS ||--o{ AUDIT_LOGS : "logs actions"

    PATIENTS ||--o{ HEALTH_VAULT_RECORDS : "owns encrypted"
    PATIENTS ||--o{ VAULT_CONSENT_LOGS : "grants access"
    DOCTORS ||--o{ VAULT_CONSENT_LOGS : "requests access"

    PATIENTS ||--o{ MEDICINES : "prescribed"
    MEDICINES ||--o{ MEDICINE_REMINDERS : "schedules 5-stage"

    PATIENTS ||--o{ APPOINTMENTS : "books"
    DOCTORS ||--o{ APPOINTMENTS : "conducts teleconsult"

    PATIENTS ||--o{ AI_CONSULTATIONS : "initiates triage"
    DOCTORS ||--o{ AI_CONSULTATIONS : "reviews & signs"

    PATIENTS ||--o{ INSURANCE_CLAIMS : "submits"
    INSURANCE_COMPANIES ||--o{ INSURANCE_CLAIMS : "adjudicates & settles"
    DOCTORS ||--o{ INSURANCE_CLAIMS : "verifies treatment"

    PATIENTS ||--o{ SOS_EVENTS : "triggers"
    DOCTORS ||--o{ SOS_EVENTS : "receives emergency alert"

    PATIENTS ||--o{ VITALS_LOGS : "records daily telemetry"

    USERS {
        int id PK
        string email
        string phone
        string name
        string role
        string password_hash
        timestamp created_at
    }

    PATIENTS {
        int id PK
        int user_id FK
        string patient_code
        string universal_health_id
        string blood_group
        jsonb allergies
        jsonb existing_diseases
        string preferred_language
        int health_score
        int recovery_score
        int compliance_score
        string storage_provider
        string storage_reference_hash
    }

    DOCTORS {
        int id PK
        int user_id FK
        string doctor_code
        string specialization
        string hospital_name
        string registration_number
        int experience_years
        int consultation_fee
    }

    INSURANCE_COMPANIES {
        int id PK
        int user_id FK
        string company_name
        string license_number
        string tpa_name
        int automated_approval_limit
    }

    HEALTH_VAULT_RECORDS {
        int id PK
        int patient_id FK
        string record_type
        string title
        string storage_provider
        string storage_reference_hash
        string encryption_algo
        jsonb encryption_metadata
        string consent_level
    }

    MEDICINE_REMINDERS {
        int id PK
        int medicine_id FK
        int patient_id FK
        string scheduled_time
        string status
        string escalation_stage
        jsonb escalation_history
    }

    AI_CONSULTATIONS {
        int id PK
        int patient_id FK
        string primary_symptom
        string triage_level
        text ai_summary
        jsonb suggested_prescription
        string doctor_review_status
        int assigned_doctor_id FK
    }

    INSURANCE_CLAIMS {
        int id PK
        string claim_number
        int patient_id FK
        int insurance_company_id FK
        string diagnosis_icd_10
        int claimed_amount
        int approved_amount
        int ai_fraud_score
        string status
    }

    SOS_EVENTS {
        int id PK
        int patient_id FK
        float latitude
        float longitude
        string address
        int ambulance_eta_minutes
        jsonb emergency_package
        jsonb dispatched_channels
        string status
    }
```

## Architectural Design Highlights

1. **Self-Sovereign Health Vault**: The platform only stores encryption metadata and decentralized access pointers (Google Drive, OneDrive, iCloud, Local Device Storage). Patient holds private cryptographic authority.
2. **5-Stage Escalation Ladder**: Push Notification → First SMS → Urgent Second SMS → AI Voice Call → Interactive IVRS → Doctor & Family Escalation with automated compliance penalty.
3. **AI Consultation Loop**: AI collects symptoms, ingests vault medical history, flags red flags, formulates ICD-10 diagnosis & suggested Rx, and queues it directly in the Doctor Portal for 1-click clinical sign-off.
4. **4-Stage Claims Automation**: Claim Submission → AI Medical Necessity & Fraud Validation → Doctor Verification → Instant Settlement Payout.
5. **Real-Time SOS Broadcast**: Single-tap alert dispatches patient blood group, allergies, active meds, and live GPS location to Doctor, Hospital ER, Insurer, and Top 3 Family Members across SMS, Push, Email, and IVRS.
