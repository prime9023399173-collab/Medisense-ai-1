# Medisense AI — Technical Architecture Specification

## 1. High-Level Architectural Topology

Medisense AI is architected as an event-driven, micro-modular healthcare platform designed for high concurrency, zero-trust cryptographic security, and multi-tenant portal interoperability.

```
                              ┌───────────────────────────────────────────────┐
                              │            Clients / Presentation             │
                              ├───────────────────────┬───────────────────────┤
                              │  Desktop Web (React)  │ Mobile (React Native) │
                              └───────────┬───────────┴───────────┬───────────┘
                                          │                       │
                                          ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                               API Gateway & Backend (Hono / Node.js)                         │
├───────────────┬────────────────┬────────────────┬──────────────────────────┬────────────────┤
│ Auth & RBAC   │ Patients Vault │ Clinical AI    │ Medicine Escalation      │ SOS Broadcast  │
│ (JWT / OTP)   │ (Decentralized)│ (OpenRouter/70B)│ (5-Stage Auto Engine)   │ (Live GPS)     │
└───────┬───────┴────────┬───────┴────────┬───────┴──────────────┬───────────┴────────┬───────┘
        │                │                │                      │                    │
        ▼                ▼                ▼                      ▼                    ▼
┌──────────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────────────┐ ┌─────────────┐
│ PostgreSQL 16    │ │ Cloud Vault   │ │ OpenRouter    │ │ Multi-Channel Engine │ │ WebRTC STUN │
│ / Embedded PGlite│ │ (GDrive/Cloud)│ │ Llama 3.3 70B │ │ SMS/Push/IVRS/Voice  │ │ Signaling   │
└──────────────────┘ └───────────────┘ └───────────────┘ └──────────────────────┘ └─────────────┘
```

---

## 2. Core Subsystems

### A. Decentralized Patient Health Vault
- **Concept**: The patient is the absolute owner of their health records.
- **Implementation**: Records are saved in patient-controlled cloud storage (Google Drive, OneDrive, iCloud, or encrypted device storage).
- **Metadata Layer**: Medisense stores only:
  - Patient Universal Health ID (ABHA)
  - Storage Reference Pointer (e.g. `sha256:cbc_rahul_991823abce88`)
  - Encryption Metadata: AES-GCM-256 with PBKDF2-SHA512 key derivation, IV, and authTag.
  - Consent Audit Logs: Doctors must obtain verified OTP consent before decryption keys are negotiated.

### B. 5-Stage Medication Escalation Engine
To counteract non-adherence in chronic and acute treatments:
- **T+0m (Stage 1)**: Mobile Push Alert dispatched to patient device.
- **T+5m (Stage 2)**: Primary SMS Reminder with one-touch acknowledgment link.
- **T+10m (Stage 3)**: Urgent Second SMS Warning regarding physiological risks of missed doses.
- **T+15m (Stage 4)**: Automated AI Voice Reminder Call reading personalized dosage instructions.
- **T+20m (Stage 5)**: Interactive IVRS Call (Press 1 to confirm, 2 for side effects, 3 to speak with clinic).
- **T+25m (Stage 6)**: Escalation to primary physician and top family members; patient compliance score reduced.

### C. Clinical AI Diagnostic Engine
- **Model Ingestion**: Powered by OpenRouter Meta Llama 3.3 70B Instruct with zero-latency fallback to Medisense Clinical Inference Engine.
- **Context Injection**: Patient allergies, contraindications, current active medications, and latest vitals are pre-injected into the clinical prompt prior to inference.
- **Safety Triaging**:
  - `Red`: Acute chest pain, shortness of breath, rigid neck, SPO2 < 94%, fever > 103°F -> Immediate ER / SOS dispatch recommendation.
  - `Amber`: Moderate fever 101-102.5°F, myalgia, dehydration signs -> Symptomatic antipyretic protocol requiring physician sign-off.
  - `Green`: Mild cold, tension headache, rhinitis -> Supportive hydration and home care.
- **Physician-in-the-Loop**: All AI-generated prescriptions require treating physician sign-off in the Doctor Portal before dispensing.

### D. Automated Insurance Adjudication
- **ICD-10 Consistency**: Cross-references billed procedures against standard diagnostic codes (`B34.9`, `E11.9`, `I10`).
- **Fraud Score**: Evaluates document authenticity, cryptographic watermarks, and cost benchmark deviations.
- **Instant Settlement**: Claims meeting the auto-adjudication criteria (< ₹75,000, fraud score < 5%, verified clinical note) receive automated approval and instant IMPS disbursement.

---

## 3. Technology Stack Reference

| Layer | Technologies | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, TailwindCSS, Lucide Icons, Vite 6 | Sub-second load times, responsive glassmorphism aesthetic. |
| **Backend** | Node.js 22, Hono, `@hono/node-server`, Drizzle ORM | Ultra-lightweight memory footprint, near-native HTTP throughput. |
| **Database** | PostgreSQL 16 & `@electric-sql/pglite` | Zero-configuration local embedded execution + production PG pool support. |
| **AI Layer** | OpenRouter (Llama 3.3 70B) & Rule-based Inference | Clinical safety, contraindication checks, multi-language synthesis. |
| **Security** | `jose` (JWT), AES-GCM-256, SHA-256 | Cryptographic integrity and zero-trust data sovereignty. |
| **Realtime** | WebRTC (DTLS-SRTP), STUN, SSE | Low-latency telemedicine and emergency beacon streaming. |
