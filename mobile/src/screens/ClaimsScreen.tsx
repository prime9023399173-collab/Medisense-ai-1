import React, { useContext, useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { mobileApi } from '../services/api'
import { MobileLanguageContext, mobileText } from '../i18n'

const statusLabels: Record<string, string> = {
  submitted: 'Received by insurer',
  forwarded_to_doctor: 'Clinical review',
  doctor_verified: 'Physician review complete',
  settled: 'Settled in demo',
  on_hold_manual_verification: 'Manual verification required'
}

export const ClaimsScreen = ({ route }: any) => {
  const patientId = route?.params?.patientId || 1
  const { language } = useContext(MobileLanguageContext)
  const t = mobileText[language]
  const [claims, setClaims] = useState<any[]>([])
  const [amount, setAmount] = useState('18500')
  const [hospital, setHospital] = useState('Max Super Speciality Hospital, Mumbai')
  const [diagnosis, setDiagnosis] = useState('B34.9 (Viral Pyrexia)')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  const loadClaims = async () => {
    try {
      const data = await mobileApi.getClaims()
      setClaims(data.filter((claim: any) => claim.patientId === patientId))
    } catch (error) {
      console.warn('Could not refresh claims:', error)
    }
  }

  useEffect(() => {
    loadClaims()
    const timer = setInterval(loadClaims, 2500)
    return () => clearInterval(timer)
  }, [patientId])

  const submitClaim = async () => {
    const parsedAmount = Number(amount)
    if (!parsedAmount || parsedAmount <= 0 || !hospital.trim()) {
      Alert.alert('Check claim details', 'Enter a positive claim amount and hospital name.')
      return
    }

    try {
      setBusy(true)
      const result = await mobileApi.submitClaim({
        patientId,
        claimedAmount: parsedAmount,
        hospitalName: hospital,
        diagnosisIcd10: diagnosis,
        treatmentSummary: 'Patient-submitted claim sent for policy, clinical, and document review.',
        billFileName: 'Hospital_Tax_Invoice.pdf'
      })
      setNotice('Claim sent to the insurer. Investor demo review is running; no payment is executed.')
      await loadClaims()
      const workflow = await mobileApi.runClaimLoop(result.claim.id)
      setNotice(workflow.message || `Claim status: ${statusLabels[workflow.status] || workflow.status}`)
      await loadClaims()
    } catch (error: any) {
      setNotice(error.message || 'Could not submit the claim.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t.claims}</Text>
      <Text style={styles.subtitle}>Submit and follow your claim through the demo adjudication workflow.</Text>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>{t.newClaim}</Text>
        <Text style={styles.label}>Claim amount (INR)</Text>
        <TextInput keyboardType="numeric" value={amount} onChangeText={setAmount} style={styles.input} />
        <Text style={styles.label}>Hospital</Text>
        <TextInput value={hospital} onChangeText={setHospital} style={styles.input} />
        <Text style={styles.label}>Diagnosis / code</Text>
        <TextInput value={diagnosis} onChangeText={setDiagnosis} style={styles.input} />
        <TouchableOpacity onPress={submitClaim} disabled={busy} style={[styles.button, busy && styles.disabled]}>
          <Text style={styles.buttonText}>{busy ? 'Review in progress...' : t.submitClaim}</Text>
        </TouchableOpacity>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </View>

      <Text style={styles.sectionTitle}>{t.timeline}</Text>
      {claims.length === 0 ? <Text style={styles.empty}>No claims yet.</Text> : claims.map(claim => (
        <View key={claim.id} style={styles.claim}>
          <View style={styles.claimHeader}>
            <Text style={styles.claimNumber}>{claim.claimNumber}</Text>
            <Text style={[styles.badge, claim.status === 'on_hold_manual_verification' && styles.holdBadge]}>{statusLabels[claim.status] || claim.status}</Text>
          </View>
          <Text style={styles.hospital}>{claim.hospitalName}</Text>
          <Text style={styles.amount}>INR {claim.claimedAmount?.toLocaleString()}</Text>
          <View style={styles.steps}>
            {['submitted', 'forwarded_to_doctor', 'doctor_verified', 'settled'].map((step, index) => {
              const completedCount: Record<string, number> = { submitted: 1, forwarded_to_doctor: 2, doctor_verified: 3, settled: 4, on_hold_manual_verification: 3 }
              const complete = index < (completedCount[claim.status] || 0)
              const label = claim.status === 'on_hold_manual_verification' && index === 3 ? 'On hold' : ['Filed', 'Insurer', 'Doctor', 'Outcome'][index]
              return <View key={step} style={styles.step}><View style={[styles.dot, complete && styles.dotComplete]} /><Text style={styles.stepText}>{label}</Text></View>
            })}
          </View>
          {claim.status === 'on_hold_manual_verification' ? <Text style={styles.holdNote}>The risk check stopped automated settlement. Manual review is required.</Text> : null}
        </View>
      ))}
      <Text style={styles.disclaimer}>{t.demoOnly}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f2' },
  content: { padding: 16, paddingBottom: 30 },
  title: { color: '#183b35', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#72817b', fontSize: 12, marginTop: 4, marginBottom: 16 },
  form: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e9e1', padding: 15, marginBottom: 18 },
  sectionTitle: { color: '#29483f', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  label: { color: '#53645e', fontSize: 11, fontWeight: '700', marginBottom: 5, marginTop: 8 },
  input: { minHeight: 42, borderRadius: 9, borderWidth: 1, borderColor: '#dce4df', paddingHorizontal: 10, color: '#263c36', backgroundColor: '#fcfdfb', fontSize: 12 },
  button: { backgroundColor: '#287866', borderRadius: 9, alignItems: 'center', paddingVertical: 12, marginTop: 14 },
  disabled: { opacity: 0.55 },
  buttonText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  notice: { color: '#416d61', fontSize: 11, lineHeight: 16, marginTop: 10 },
  claim: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e9e1', padding: 14, marginBottom: 10 },
  claimHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' },
  claimNumber: { color: '#287866', fontSize: 12, fontWeight: '800' },
  badge: { color: '#476a5f', backgroundColor: '#edf4ef', overflow: 'hidden', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, fontSize: 9, fontWeight: '700' },
  holdBadge: { color: '#91533f', backgroundColor: '#fbf0e9' },
  hospital: { color: '#4d5e58', fontSize: 11, marginTop: 8 },
  amount: { color: '#203d35', fontSize: 17, fontWeight: '800', marginTop: 3 },
  steps: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, borderTopWidth: 1, borderTopColor: '#edf0eb', paddingTop: 12 },
  step: { alignItems: 'center', flex: 1 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#d9e1dc', marginBottom: 5 },
  dotComplete: { backgroundColor: '#4a9b79' },
  stepText: { color: '#75827d', fontSize: 9 },
  holdNote: { color: '#91533f', fontSize: 11, marginTop: 12 },
  empty: { color: '#7b8983', fontSize: 12, paddingVertical: 18 },
  disclaimer: { color: '#87938e', fontSize: 10, lineHeight: 15, marginTop: 12 }
})