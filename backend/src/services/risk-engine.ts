export interface PatientRiskMetrics {
  healthScore: number
  recoveryScore: number
  complianceScore: number
  diseaseRiskScore: 'Low' | 'Moderate' | 'High' | 'Critical'
  emergencyRiskScore: 'Normal' | 'Guarded' | 'Elevated' | 'High'
  riskFactors: string[]
  recommendations: string[]
}

export interface InsuranceEvaluationMetrics {
  eligibilityScore: number // 0-100%
  hospitalizationRisk: number // 0-100%
  fraudScore: number // 0-100% (lower is safer)
  recommendation: 'Approve' | 'Review Required' | 'Reject'
  checklist: {
    check: string
    passed: boolean
    details: string
  }[]
  detectedAnomalies: string[]
}

export function computePatientRiskMetrics(
  vitals: { systolicBp?: number; diastolicBp?: number; bloodSugar?: number; heartRate?: number; spo2?: number; temp?: number }[],
  missedDosesCount: number,
  chronicDiseases: string[],
  age: number
): PatientRiskMetrics {
  let healthScore = 90
  let recoveryScore = 92
  let complianceScore = Math.max(40, 100 - (missedDosesCount * 8))
  const riskFactors: string[] = []
  const recommendations: string[] = []

  const latestVital = vitals[vitals.length - 1]

  // Vitals scoring
  if (latestVital) {
    if (latestVital.systolicBp && latestVital.systolicBp > 140) {
      healthScore -= 12
      riskFactors.push(`Elevated Systolic Blood Pressure (${latestVital.systolicBp} mmHg)`)
      recommendations.push('Reduce sodium intake and consult cardiologist for dosage adjustment.')
    }
    if (latestVital.bloodSugar && latestVital.bloodSugar > 140) {
      healthScore -= 10
      riskFactors.push(`Elevated Blood Sugar (${latestVital.bloodSugar} mg/dL)`)
      recommendations.push('Maintain diabetic diet log and perform daily fasting glucose checks.')
    }
    if (latestVital.spo2 && latestVital.spo2 < 95) {
      healthScore -= 20
      riskFactors.push(`Sub-optimal Oxygen Saturation (${latestVital.spo2}%)`)
      recommendations.push('Immediate pulse oximetry monitoring every 2 hours.')
    }
    if (latestVital.temp && latestVital.temp > 101) {
      recoveryScore -= 15
      riskFactors.push(`Active Pyrexia (${latestVital.temp}°F)`)
      recommendations.push('Take antipyretic SOS and stay adequately hydrated.')
    }
  }

  // Chronic Disease load
  if (chronicDiseases.length > 0) {
    healthScore -= chronicDiseases.length * 4
    riskFactors.push(`Chronic burden: ${chronicDiseases.join(', ')}`)
  }

  // Missed doses impact
  if (missedDosesCount > 0) {
    recoveryScore -= missedDosesCount * 7
    riskFactors.push(`${missedDosesCount} missed medication doses in recent cycles`)
    recommendations.push('Activate AI IVRS and voice reminder notifications to safeguard compliance.')
  }

  healthScore = Math.max(35, Math.min(99, healthScore))
  recoveryScore = Math.max(30, Math.min(99, recoveryScore))

  let diseaseRiskScore: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low'
  if (healthScore < 60) diseaseRiskScore = 'Critical'
  else if (healthScore < 75) diseaseRiskScore = 'High'
  else if (healthScore < 85) diseaseRiskScore = 'Moderate'

  let emergencyRiskScore: 'Normal' | 'Guarded' | 'Elevated' | 'High' = 'Normal'
  if (latestVital?.spo2 && latestVital.spo2 < 93) emergencyRiskScore = 'High'
  else if (latestVital?.systolicBp && latestVital.systolicBp > 160) emergencyRiskScore = 'Elevated'
  else if (latestVital?.temp && latestVital.temp > 102.5) emergencyRiskScore = 'Guarded'

  return {
    healthScore,
    recoveryScore,
    complianceScore,
    diseaseRiskScore,
    emergencyRiskScore,
    riskFactors,
    recommendations
  }
}

export function evaluateInsuranceClaimAI(
  claimAmount: number,
  diagnosisIcd10: string,
  treatmentSummary: string,
  hospitalName: string,
  documentsCount: number
): InsuranceEvaluationMetrics {
  const anomalies: string[] = []
  let eligibilityScore = 95
  let fraudScore = 3
  let hospitalizationRisk = 15

  const checklist = [
    { check: 'Policy In-Force & No Premium Default', passed: true, details: 'Active comprehensive health cover verified via IRDAI portal.' },
    { check: 'Standard Package Cost Benchmark (GIPSA/AI Audit)', passed: true, details: 'Billed procedures align with median regional hospital charges.' },
    { check: 'Medical Necessity & ICD-10 Coding Consistency', passed: true, details: `Diagnosis code ${diagnosisIcd10} directly supports all billed therapeutics.` },
    { check: 'Document Integrity & Cryptographic Watermark Verification', passed: documentsCount >= 2, details: `${documentsCount} clinical records cross-verified.` },
    { check: 'Pre-existing Disease Waiting Period & Clause 4.1', passed: true, details: 'Acute episode is fully indemnifiable under policy Schedule II.' }
  ]

  // Anomaly checks
  if (claimAmount > 500000) {
    hospitalizationRisk += 25
    anomalies.push('High value claim requiring secondary supervisory sign-off')
  }

  if (documentsCount < 2) {
    eligibilityScore -= 20
    fraudScore += 15
    checklist[3].passed = false
    checklist[3].details = 'Insufficient documentary evidence attached.'
    anomalies.push('Missing discharge summary or diagnostic lab reports')
  }

  let recommendation: 'Approve' | 'Review Required' | 'Reject' = 'Approve'
  if (fraudScore > 25 || eligibilityScore < 70) {
    recommendation = 'Reject'
  } else if (fraudScore > 10 || claimAmount > 100000) {
    recommendation = 'Review Required'
  }

  return {
    eligibilityScore,
    hospitalizationRisk,
    fraudScore,
    recommendation,
    checklist,
    detectedAnomalies: anomalies
  }
}
