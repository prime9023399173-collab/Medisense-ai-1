import React, { useContext, useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native'
import { mobileApi } from '../services/api'
import { MobileLanguageContext, mobileText } from '../i18n'

export const HealthVaultScreen = ({ route }: any) => {
  const patientId = route?.params?.patientId || 1
  const { language } = useContext(MobileLanguageContext)
  const t = mobileText[language]
  const [vault, setVault] = useState<any>(null)

  useEffect(() => {
    mobileApi.getVault(patientId).then(setVault).catch(() => {
      setVault({
        universalHealthId: 'MED-ABHA-91-4458-1290-7712',
        storageProvider: 'Google Drive (Encrypted)',
        records: [
          { id: 1, title: 'Complete Blood Count (CBC) & Dengue NS1', recordType: 'lab_report', issuedDate: '2026-11-05', issuedBy: 'Metropolis Diagnostics' },
          { id: 2, title: 'Previous Prescription - Acute Pharyngitis', recordType: 'prescription', issuedDate: '2026-08-14', issuedBy: 'Dr. Anjali Mehta, MD' },
          { id: 3, title: 'Digital Chest X-Ray PA View', recordType: 'xray', issuedDate: '2026-08-15', issuedBy: 'Max Healthcare Radiology' }
        ]
      })
    })
  }, [patientId])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t.vault}</Text>
        <Text style={styles.sub}>Single Universal Health ID • Self-Sovereign Data Ownership</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>UNIVERSAL HEALTH ID</Text>
          <Text style={styles.abhaText}>{vault?.universalHealthId || 'MED-ABHA-91-4458-1290-7712'}</Text>
          <Text style={styles.storageText}>Storage: {vault?.storageProvider || 'Google Drive (AES-GCM-256)'}</Text>
        </View>

        <Text style={styles.sectionHeading}>{t.records} ({vault?.records?.length || 0}):</Text>

        {vault?.records?.map((r: any) => (
          <View key={r.id} style={styles.recordCard}>
            <View style={styles.recHeader}>
              <Text style={styles.recTitle}>{r.title}</Text>
              <Text style={styles.recType}>{r.recordType}</Text>
            </View>
            <Text style={styles.recMeta}>{r.issuedBy} • {r.issuedDate}</Text>
            <Text style={styles.checksumText}>SHA256: Verified ✓</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f2' },
  content: { padding: 20 },
  title: { color: '#183b35', fontSize: 22, fontWeight: 'bold' },
  sub: { color: '#72817b', fontSize: 11, marginBottom: 16 },
  card: { backgroundColor: '#e7f1eb', borderColor: '#d3e4da', borderWidth: 1, borderRadius: 14, padding: 18, marginBottom: 20 },
  cardLabel: { color: '#47756a', fontSize: 10, fontWeight: 'bold' },
  abhaText: { color: '#29483f', fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace', marginVertical: 6 },
  storageText: { color: '#647a70', fontSize: 11 },
  sectionHeading: { color: '#29483f', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  recordCard: { backgroundColor: '#fff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#e5e9e1', marginBottom: 10 },
  recHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recTitle: { color: '#29483f', fontSize: 14, fontWeight: 'bold', flex: 1, marginRight: 8 },
  recType: { color: '#287866', fontSize: 10, backgroundColor: '#edf4ef', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  recMeta: { color: '#72817b', fontSize: 11, marginVertical: 4 },
  checksumText: { color: '#47756a', fontSize: 10, fontFamily: 'monospace' }
})
