# Medisense AI — REST API Documentation

Base URL: `http://localhost:4000/api`

---

## 1. Authentication & Personas

### POST `/auth/login`
Authenticates a user via email and password.
- **Request Body**:
  ```json
  { "email": "rahul@medisense.ai", "password": "demo123" }
  ```
- **Response**: Returns JWT token, user profile, and linked role record.

### POST `/auth/send-otp`
Dispatches a 6-digit OTP code to the requested phone number or email address.
- **Request Body**: `{ "phone": "+919820112233" }`
- **Response**: `{ "success": true, "demoOtp": "882910" }`

### POST `/auth/switch-persona`
Instantly switches active user session to any pre-seeded investor persona.
- **Request Body**: `{ "email": "dr.anjali@medisense.ai" }`

---

## 2. Patients & Vitals

### GET `/patients/:id`
Retrieves comprehensive patient profile, emergency contacts, family members, recent vitals telemetry, and active medications.

### POST `/patients/:id/vitals`
Logs daily patient vitals and automatically recalculates Health Score, Recovery Score, Compliance Score, and Disease Risk.
- **Request Body**:
  ```json
  {
    "systolicBp": 122,
    "diastolicBp": 78,
    "bloodSugar": 95,
    "heartRate": 74,
    "spo2": 98,
    "temperature": 98.6
  }
  ```

---

## 3. Health Vault & Consent

### GET `/vault/patient/:patientId`
Retrieves all encrypted health records, storage provider references, and consent audit logs for a patient.

### POST `/vault/request-consent`
Doctor requests OTP-authorized consent to inspect a patient's medical records.
- **Request Body**:
  ```json
  { "patientId": 1, "doctorId": 1, "purpose": "Clinical consultation" }
  ```

### POST `/vault/verify-consent`
Verifies OTP code and unlocks medical history for the attending physician.
- **Request Body**: `{ "consentId": 1, "otpCode": "441920" }`

### GET `/vault/verify-integrity/:recordId`
Performs real-time SHA-256 cryptographic checksum validation to ensure document has not been tampered with.

---

## 4. Medicine Management & Escalation

### GET `/medicines/patient/:patientId`
Returns active medicines, dosage schedules, and reminder statuses.

### POST `/medicines`
Adds a new medicine regimen with dosage, frequency, and food relation.

### POST `/medicines/ocr-scan`
Simulates Optical Character Recognition on an uploaded or sample prescription, extracting drug names, dosages, and schedules.

### POST `/medicines/reminders/:id/acknowledge`
Marks a scheduled medication dose as taken and increments patient compliance score.

### POST `/medicines/reminders/:id/escalate`
Advances the 5-stage reminder escalation ladder (`1_push` -> `2_sms1` -> `3_sms2` -> `4_voice` -> `5_ivrs` -> `6_doctor_escalated`).

---

## 5. Clinical AI Health Doctor

### POST `/ai-doctor/consult`
Executes conversational clinical triage via OpenRouter Meta Llama 3.3 70B or built-in clinical engine.
- **Request Body**:
  ```json
  {
    "patientId": 1,
    "query": "I have had a 102F fever and severe body pain for 2 days.",
    "language": "en"
  }
  ```
- **Response**: Structured clinical summary, red flag detection, triage level (`green`, `amber`, `red`), and suggested prescription forwarded to Doctor Portal.

### GET `/ai-doctor/pending-prescriptions`
Returns all AI-generated prescriptions awaiting doctor review and signature.

### POST `/ai-doctor/prescriptions/:id/review`
Doctor approves, modifies, or declines an AI prescription. Approvals automatically add medications to patient's active regimen.

---

## 6. Insurance & Claims

### GET `/insurance/dashboard`
Returns platform-wide insurance metrics (total claimed, settled amounts, auto-approval percentage, fraud risk averages).

### POST `/insurance/claims`
Submits a new insurance claim with itemized bills and diagnostic reports.

### POST `/insurance/claims/:id/settle`
Authorizes instant claim payout settlement.

### POST `/insurance/demo-simulate-workflow`
⚡ 1-Click Investor Demo: Executes complete claim lifecycle (Submission -> AI Validation -> Doctor Verification -> Settlement) in a single request.

---

## 7. Emergency SOS & Live GPS Tracking

### POST `/sos/trigger`
Triggers single-tap Emergency SOS and immediately broadcasts to Doctor, Hospital ER, Insurer, and Top 3 Family Members across SMS, Push, Email, and IVRS.
- **Request Body**:
  ```json
  {
    "patientId": 1,
    "latitude": 19.0760,
    "longitude": 72.8777,
    "address": "Bandra Kurla Complex (BKC), Mumbai"
  }
  ```

### POST `/sos/:id/update-gps`
Simulates live GPS beacon telemetry and updates moving ambulance distance and ETA every 30 seconds.

### POST `/sos/:id/resolve`
Marks the emergency event as resolved.
