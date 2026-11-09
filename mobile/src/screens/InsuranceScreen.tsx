import React, { useContext, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { mobileApi } from '../services/api'
import { MobileLanguageContext, mobileText } from '../i18n'

const labels: Record<string, string> = {
  submitted: 'Submitted',
  forwarded_to_doctor: 'With doctor',
  doctor_verified: 'Doctor verified',
  settled: 'Settled in demo',
  on_hold_manual_verification: 'Manual review hold'
}

export const InsuranceScreen = () => {
  const { language } = useContext(MobileLanguageContext)
  const t = mobileText[language]
  const [claims, setClaims] = useState<any[]>([])
  const [running, setRunning] = useState<number | null>(null)
  const [notice, setNotice] = useState('')

  const loadClaims = async () => {
    try {
      setClaims(await mobileApi.getClaims())
    } catch (error) {
      console.warn('Could not refresh insurance claims:', error)
    }
  }

  useEffect(() => {
    loadClaims()
    const timer = setInterval(loadClaims, 2500)
    return () => clearInterval(timer)
  }, [])

  const runReview = async (id: number) => {
    try {
      setRunning(id)
      setNotice('Reviewing policy, patient records, clinical sign-off, and fraud indicators...')
      const result = await mobileApi.runClaimLoop(id)
      setNotice(result.message || `Claim status: ${labels[result.status] || result.status}`)
      await loadClaims()
    } catch (error: any) {
      setNotice(error.message || 'Could not run the demo review.')
    } finally {
      setRunning(null)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t.claims}</Text>
      <Text style={styles.subtitle}>Automated demo queue with a manual-review stop for elevated risk.</Text>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {claims.length === 0 ? <Text style={styles.empty}>No claims have been submitted.</Text> : claims.map(claim => (
        <View key={claim.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.claimNumber}>{claim.claimNumber}</Text>
            <Text style={[styles.badge, claim.status === 'on_hold_manual_verification' && styles.holdBadge]}>{labels[claim.status] || claim.status}</Text>
          </View>
          <Text style={styles.patient}>{claim.patientName} · {claim.patientCode}</Text>
          <Text style={styles.detail}>{claim.hospitalName}</Text>
          <Text style={styles.amount}>INR {claim.claimedAmount?.toLocaleString()}</Text>
          <Text style={styles.detail}>Eligibility {claim.aiEligibilityScore}% · Fraud risk {claim.aiFraudScore}%</Text>
          <Text style={styles.detail}>Review: {claim.aiRecommendation}</Text>
          {claim.status !== 'settled' && claim.status !== 'on_hold_manual_verification' ? (
            <TouchableOpacity disabled={running !== null} onPress={() => runReview(claim.id)} style={[styles.button, running !== null && styles.disabled]}>
              <Text style={styles.buttonText}>{running === claim.id ? 'Review in progress...' : 'Run automated demo review'}</Text>
            </TouchableOpacity>
          ) : null}
          {claim.status === 'on_hold_manual_verification' ? <Text style={styles.holdNote}>Automated settlement is stopped. An authorized reviewer must investigate.</Text> : null}
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
  subtitle: { color: '#72817b', fontSize: 12, lineHeight: 17, marginTop: 4, marginBottom: 14 },
  notice: { color: '#416d61', backgroundColor: '#eaf3ed', borderRadius: 10, padding: 11, fontSize: 11, lineHeight: 16, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e9e1', padding: 14, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  claimNumber: { color: '#287866', fontSize: 12, fontWeight: '800' },
  badge: { color: '#476a5f', backgroundColor: '#edf4ef', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, overflow: 'hidden', fontSize: 9, fontWeight: '800' },
  holdBadge: { color: '#91533f', backgroundColor: '#fbf0e9' },
  patient: { color: '#29483f', fontSize: 12, fontWeight: '700', marginTop: 10 },
  detail: { color: '#73817b', fontSize: 10, lineHeight: 15, marginTop: 5 },
  amount: { color: '#203d35', fontSize: 17, fontWeight: '800', marginTop: 4 },
  button: { backgroundColor: '#287866', borderRadius: 9, alignItems: 'center', paddingVertical: 12, marginTop: 12 },
  disabled: { opacity: 0.55 },
  buttonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  holdNote: { color: '#91533f', fontSize: 11, lineHeight: 16, marginTop: 10 },
  empty: { color: '#7b8983', fontSize: 12, paddingVertical: 18 },
  disclaimer: { color: '#87938e', fontSize: 10, lineHeight: 15, marginTop: 4 }
})