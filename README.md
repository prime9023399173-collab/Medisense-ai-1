# Medisense AI — Connected Healthcare Ecosystem

> **Complete Production-Style MVP:** Full-stack healthcare platform connecting Patients, Doctors/Hospitals, and Insurance Providers in an interoperable, investor-grade ecosystem.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React%2019-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Hono API](https://img.shields.io/badge/Hono-E36002?style=flat&logo=fastapi&logoColor=white)](https://hono.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 🌟 Ecosystem Overview

Medisense AI integrates the three pillars of modern digital healthcare into a synchronized platform:

1. **Patient Portal**: Self-sovereign Universal Health ID (ABHA-compatible), encrypted health records vault, medication adherence manager with a 5-stage escalation engine, and multilingual AI Health Doctor.
2. **Doctor/Hospital Portal**: Patient search, OTP-based consent authorization, full medical history timeline, AI Doctor Copilot alerts, pending AI prescription clinical review queue, and encrypted WebRTC teleconsultation suite.
3. **Insurance Portal**: AI-assisted automated claim adjudication, fraud score evaluation, real-time hospital treatment verification, and 1-click settlement authorization.
4. **Family Portal**: Real-time kin emergency monitoring, missed medication alerts, live GPS ambulance route tracking, and rapid care coordination.
5. **Super Admin Dashboard**: Platform-wide node telemetry, provider network governance, and tamper-evident cryptographic audit logs.
6. **Mobile Application**: Pixel-perfect React Native companion application for iOS & Android (`mobile/` directory) and interactive web frame preview.

---

## 🚀 Quick Start (1-Click Run)

### Option A: Windows 1-Click Launch (Zero Configuration)
Simply double-click:
```bat
start-all.bat
```
This script automatically:
1. Starts the Medisense Backend on `http://localhost:4000` (auto-bootstraps embedded PostgreSQL via PGlite and seeds realistic investor demo data).
2. Starts the Medisense React Web Application on `http://localhost:3000`.
3. Opens your default browser directly into the tri-portal command center.

### Option B: Manual Node Launch
```bash
# Terminal 1: Backend
cd backend
npm run start

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Option C: Docker Compose Multi-Container Stack
```bash
docker-compose up --build
```

---

## 👥 Pre-Seeded Investor Demo Personas

Switch between any persona using the quick dropdown in the top navigation bar:

| Persona | Role | Condition / Specialization | Health ID / Code | Credentials |
| :--- | :--- | :--- | :--- | :--- |
| **Rahul Sharma** | Patient | Viral Pyrexia & Acute Headache | `MED-ABHA-91-4458-1290-7712` | `rahul@medisense.ai` / `demo123` |
| **Priya Patel** | Patient | Type 2 Diabetes Mellitus | `MED-ABHA-91-3829-9182-3341` | `priya@medisense.ai` / `demo123` |
| **Amit Verma** | Patient | Stage 2 Hypertension (Elevated BP Alert) | `MED-ABHA-91-7712-4411-9920` | `amit@medisense.ai` / `demo123` |
| **Dr. Anjali Mehta, MD** | Doctor | General Physician & Internal Medicine | `DOC-AI-0101` (Max Super Speciality) | `dr.anjali@medisense.ai` / `demo123` |
| **Dr. Rajesh Iyer, DM** | Doctor | Consultant Interventional Cardiologist | `DOC-AI-0102` (Fortis Escorts) | `dr.iyer@medisense.ai` / `demo123` |
| **Star Health Adjudicator**| Insurer | Automated Claims & Fraud Engine | License: `IRDAI/NL-044/2006` | `insurance@medisense.ai` / `demo123` |
| **Super Admin** | Admin | Full System Governance | Super Admin Node #01 | `admin@medisense.ai` / `demo123` |

---

## ⚡ Core Demonstrations (Interactive Workflows)

### 1. Single-Tap Emergency SOS & 30-Second Live GPS Tracking
1. Tap the pulsing red **"EMERGENCY SOS"** button anywhere in the app or mobile view.
2. Watch the multi-channel broadcast notify:
   - Primary Doctor (+919811001122 via SMS & IVRS)
   - Lilavati Hospital ER Desk (Automatic bed reservation)
   - Star Health Insurance (Emergency claim ticket)
   - Top 3 Family Members (+919820998811 via SMS & IVRS call)
3. The live GPS radar updates coordinates every 30 seconds with simulated moving ambulance beacon and ETA countdown until marked resolved.

### 2. 5-Stage Medication Escalation Engine
1. Navigate to **Medicines** tab.
2. View the escalation ladder:
   - **Step 1**: Push Alert (T+0m)
   - **Step 2**: SMS Reminder 1 (T+5m)
   - **Step 3**: Urgent Second SMS (T+10m)
   - **Step 4**: AI Voice Reminder Call (T+15m)
   - **Step 5**: Interactive IVRS Call (T+20m)
   - **Step 6**: Missed Dose Alert to Doctor & Family with automated compliance score penalty.
3. Tap **"Trigger Next Alert"** on any medicine to watch the engine advance step-by-step and listen to simulated voice scripts in English, Hindi, or Marathi!

### 3. AI Health Doctor Consultation to Doctor Prescription Approval
1. Open **AI Health Doctor**.
2. Select a symptom chip (e.g., *High Fever 102°F* or *Viral Cold*), or type a query in English, हिन्दी, or मराठी.
3. Observe how the AI cross-references patient allergies (e.g., Penicillin contraindication), current vitals, and chronic conditions.
4. AI generates a structured clinical summary and provisional prescription (Triage: Amber).
5. Click **"Forward to Doctor Portal"**.
6. Switch to **Doctor Portal** -> view the prescription in Dr. Anjali Mehta's review queue -> click **"Clinically Verify & Authorize"**.
7. The approved medicine is automatically delivered to the patient's active medication list!

### 4. 1-Click Automated Insurance Claim Adjudication
1. Switch to **Insurance Portal**.
2. Tap the gold button: **"⚡ 1-Click End-to-End Claim Simulation"**.
3. Watch the AI:
   - Ingest hospital daycare invoices and pathology reports.
   - Verify medical necessity against ICD-10 diagnostic benchmarks (`B34.9`).
   - Confirm policy schedule rules and fraud score (2% safe).
   - Instantly authorize a ₹24,800 payout via IMPS.

---

## 🏗️ Project Architecture

```
medisense-ai/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts            # Drizzle PostgreSQL Schema
│   │   │   ├── database.ts          # Dual Engine: PGlite Embedded & PG Pool
│   │   │   └── seed.ts              # Comprehensive Investor Seed Data
│   │   ├── routes/
│   │   │   ├── auth.routes.ts       # JWT Auth, OTP & Persona Switcher
│   │   │   ├── patient.routes.ts    # Vitals & Profile Telemetry
│   │   │   ├── vault.routes.ts      # Health Vault & Consent Management
│   │   │   ├── medicine.routes.ts   # OCR Scanner & 5-Stage Escalation
│   │   │   ├── appointment.routes.ts# WebRTC Rooms & Scheduling
│   │   │   ├── ai-doctor.routes.ts  # Clinical Inference Engine & OpenRouter
│   │   │   ├── doctor.routes.ts     # Clinical Search, History & Alerts
│   │   │   ├── insurance.routes.ts  # Automated Adjudication & Fraud Score
│   │   │   ├── sos.routes.ts        # Emergency SOS & Live GPS Radar
│   │   │   └── admin.routes.ts      # Platform Telemetry & Audit Logs
│   │   ├── services/
│   │   │   ├── ai-service.ts        # Llama 3.3 70B & Clinical Diagnostic Engine
│   │   │   ├── notification-service.ts # SMS, Push, Voice & IVRS Engine
│   │   │   ├── ocr-service.ts       # Prescription Optical Character Recognition
│   │   │   └── risk-engine.ts       # Health, Compliance, Hospitalization & Fraud Scores
│   │   └── server.ts                # Main Hono REST API Application
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # Multi-Portal Navigation & Language Switcher
│   │   │   ├── DesktopMultiPortalView.tsx # Side-by-side Tri-Portal View
│   │   │   ├── PatientPortal.tsx    # Universal Health ID & Telemetry
│   │   │   ├── HealthVaultView.tsx  # Decentralized Storage & AES-GCM-256 Badges
│   │   │   ├── AIDoctorChat.tsx     # Chat, Voice & Video Doctor
│   │   │   ├── MedicineManager.tsx  # 5-Stage Escalation & OCR Scanner
│   │   │   ├── DoctorPortal.tsx     # Clinical History, Queue & WebRTC Call
│   │   │   ├── InsurancePortal.tsx  # AI Adjudication & Claim Payouts
│   │   │   ├── FamilyPortal.tsx     # Guardian Oversight & Live SOS View
│   │   │   ├── AdminDashboard.tsx   # System Health & Cryptographic Audit Logs
│   │   │   ├── MobileViewFrame.tsx  # Native Phone Chassis Simulator
│   │   │   └── EmergencySOSModal.tsx# Live GPS Radar & Multi-Channel Broadcast
│   │   ├── services/api.ts          # Unified REST Client
│   │   ├── App.tsx                  # Root Orchestrator
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── mobile/                          # Standalone React Native Companion Codebase
│   ├── src/screens/
│   │   ├── HomeScreen.tsx           # Mobile Vitals & Quick SOS
│   │   ├── MedicineScreen.tsx       # Medication Schedule & Dose Confirmation
│   │   ├── AIDoctorScreen.tsx       # Conversational AI Triage
│   │   ├── SOSScreen.tsx            # Single-Tap Emergency Beacon
│   │   └── HealthVaultScreen.tsx    # Digital ABHA Card & Records
│   ├── App.tsx                      # Bottom Tab & Stack Navigation
│   └── app.json
│
├── database/
│   ├── schema.sql                   # Raw PostgreSQL DDL
│   └── er-diagram.md                # Full Mermaid ER Diagram
│
├── docker-compose.yml               # Multi-Service Production Compose
├── start-all.bat                    # Windows 1-Click Launch Script
├── start-all.sh                     # Linux/macOS 1-Click Launch Script
└── .env.example
```

---

## 🔒 Security, Compliance & Data Ownership

- **ABHA Compliant**: Interoperable Universal Health ID format compatible with national healthcare standards.
- **Patient Data Sovereignty**: Records remain encrypted on patient-controlled storage providers (Google Drive, OneDrive, iCloud, Local Device Storage). Medisense only maintains cryptographic access hashes and consent audit trails.
- **AES-GCM-256 Encryption**: Clinical files encrypted with user-derived key pairs.
- **Role-Based Access Control (RBAC)**: Enforced via cryptographic JWT tokens across `patient`, `doctor`, `insurance`, and `admin` scopes.
