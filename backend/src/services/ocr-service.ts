export interface ExtractedPrescriptionMedicine {
  name: string
  dosage: string
  form: 'tablet' | 'capsule' | 'syrup' | 'injection'
  frequency: string
  timing: {
    morning: boolean
    afternoon: boolean
    evening: boolean
    night: boolean
  }
  foodRelation: 'before_food' | 'after_food' | 'with_food'
  durationDays: number
  instructions: string
  confidenceScore: number
}

export interface PrescriptionScanResult {
  scanId: string
  doctorName?: string
  hospitalName?: string
  date?: string
  diagnosis?: string
  extractedMedicines: ExtractedPrescriptionMedicine[]
  rawOcrText: string
}

// Sample prescription templates that OCR can match or parse
export const SAMPLE_OCR_TEMPLATES: Record<string, PrescriptionScanResult> = {
  fever_prescription: {
    scanId: 'OCR-RX-98210',
    doctorName: 'Dr. Anjali Mehta, MD',
    hospitalName: 'Max Super Speciality Hospital, Mumbai',
    date: '2026-11-06',
    diagnosis: 'Acute Viral Fever with Upper Respiratory Tract Symptoms',
    rawOcrText: `MAX SUPER SPECIALITY HOSPITAL
Dr. Anjali Mehta, MD (Internal Medicine)
Reg No: MCI-MH-2012-09412
Patient: Rahul Sharma | Age: 32 | Date: 06/11/2026
Rx:
1. Tab. Dolo 650mg (Paracetamol) - 1 tab TID after meals x 5 days (SOS for fever > 100°F)
2. Tab. Levocetirizine 5mg - 1 tab HS after dinner x 5 days
3. Tab. Limcee (Vit C 500mg) - 1 tab OD chewable morning x 7 days
Adv: Steam inhalation BID, ORS hydration 2.5L/day. Review after 3 days.`,
    extractedMedicines: [
      {
        name: 'Dolo 650mg (Paracetamol)',
        dosage: '650mg - 1 Tablet',
        form: 'tablet',
        frequency: 'Three times a day (TID)',
        timing: { morning: true, afternoon: true, evening: false, night: true },
        foodRelation: 'after_food',
        durationDays: 5,
        instructions: 'Take after meals for fever > 100°F or severe body ache. Max 3g in 24 hrs.',
        confidenceScore: 0.98
      },
      {
        name: 'Levocetirizine 5mg',
        dosage: '5mg - 1 Tablet',
        form: 'tablet',
        frequency: 'Once Daily at Bedtime (HS)',
        timing: { morning: false, afternoon: false, evening: false, night: true },
        foodRelation: 'after_food',
        durationDays: 5,
        instructions: 'Take after food at bedtime. May cause mild sedation.',
        confidenceScore: 0.96
      },
      {
        name: 'Limcee Chewable (Vitamin C 500mg)',
        dosage: '500mg - 1 Chewable Tab',
        form: 'tablet',
        frequency: 'Once Daily (OD)',
        timing: { morning: true, afternoon: false, evening: false, night: false },
        foodRelation: 'after_food',
        durationDays: 7,
        instructions: 'Chew in the morning after breakfast.',
        confidenceScore: 0.97
      }
    ]
  },
  cardiac_prescription: {
    scanId: 'OCR-RX-98211',
    doctorName: 'Dr. Rajesh Iyer, DM',
    hospitalName: 'Fortis Escorts Heart Institute',
    date: '2026-10-15',
    diagnosis: 'Stage 2 Hypertension with Grade 1 Diastolic Dysfunction',
    rawOcrText: `FORTIS ESCORTS HEART INSTITUTE
Dr. Rajesh Iyer, DM (Cardiology), FACC
Patient: Amit Verma | Age: 58 | Date: 15/10/2026
Rx:
1. Tab. Telma AM (Telmisartan 40mg + Amlodipine 5mg) - 1 tab OD morning before food x 30 days
2. Tab. Atorva 20mg (Atorvastatin) - 1 tab HS after food x 30 days
3. Tab. Ecosprin 75mg (Aspirin Enteric Coated) - 1 tab post lunch x 30 days
Adv: Restrict dietary salt < 4g/day. Monitor BP daily.`,
    extractedMedicines: [
      {
        name: 'Telmisartan 40mg + Amlodipine 5mg',
        dosage: '40mg/5mg - 1 Tablet',
        form: 'tablet',
        frequency: 'Once daily morning',
        timing: { morning: true, afternoon: false, evening: false, night: false },
        foodRelation: 'before_food',
        durationDays: 30,
        instructions: 'Take early morning before breakfast with water. Monitor BP.',
        confidenceScore: 0.99
      },
      {
        name: 'Atorvastatin 20mg',
        dosage: '20mg - 1 Tablet',
        form: 'tablet',
        frequency: 'Once daily at bedtime',
        timing: { morning: false, afternoon: false, evening: false, night: true },
        foodRelation: 'after_food',
        durationDays: 30,
        instructions: 'Take at night after food for lipid stabilization.',
        confidenceScore: 0.97
      }
    ]
  }
}

export function simulateOcrExtraction(rawTextOrType?: string): PrescriptionScanResult {
  if (rawTextOrType && rawTextOrType.toLowerCase().includes('cardiac')) {
    return SAMPLE_OCR_TEMPLATES.cardiac_prescription
  }
  return SAMPLE_OCR_TEMPLATES.fever_prescription
}
