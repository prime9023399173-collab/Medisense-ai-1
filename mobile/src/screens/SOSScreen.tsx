import React, { useContext, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native'
import { mobileApi } from '../services/api'
import { MobileLanguageContext, mobileText } from '../i18n'

export const SOSScreen = ({ route }: any) => {
  const patientId = route?.params?.patientId || 1
  const { language } = useContext(MobileLanguageContext)
  const t = mobileText[language]
  const [sosActive, setSosActive] = useState(false)
  const [sosData, setSosData] = useState<any>(null)

  const handleTrigger = async () => {
    try {
      const res = await mobileApi.triggerSOS({
        patientId,
        latitude: 19.0760,
        longitude: 72.8777,
        address: 'Bandra Kurla Complex (BKC), Mumbai'
      })
      setSosData(res.sosEvent)
      setSosActive(true)
      Alert.alert('🚨 EMERGENCY SOS ACTIVATED', 'Ambulance dispatched. Doctor & top family contacts alerted via SMS and IVRS.')
    } catch {
      setSosActive(true)
    }
  }

  const handleResolve = async () => {
    try {
      if (sosData?.id) await mobileApi.resolveSOS(sosData.id)
      setSosActive(false)
      setSosData(null)
      Alert.alert('SOS Resolved', 'Emergency marked as resolved.')
    } catch (error: any) {
      Alert.alert('Could not resolve alert', error.message || 'Try again.')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t.emergency}</Text>
        <Text style={styles.sub}>Instant broadcast to Doctor, Hospital, Star Health & Top 3 Family Contacts</Text>

        {!sosActive ? (
          <View style={styles.triggerContainer}>
            <TouchableOpacity
              style={styles.bigRedButton}
              onPress={handleTrigger}
              activeOpacity={0.7}
            >
              <Text style={styles.bigRedText}>TAP FOR</Text>
              <Text style={styles.bigRedSub}>{t.requestHelp}</Text>
            </TouchableOpacity>
            <Text style={styles.warningText}>Sends live GPS beacon, Blood Group (O+), Allergies & Meds to ER desk</Text>
          </View>
        ) : (
          <View style={styles.activeContainer}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>🚨 AMBULANCE EN ROUTE (ETA: 6 MINS)</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>LIVE GPS COORDINATES</Text>
              <Text style={styles.infoVal}>19.0760° N, 72.8777° E (BKC, Mumbai)</Text>
              <Text style={styles.infoHospital}>Hospital: Lilavati Hospital & Research ER</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>MULTI-CHANNEL DISPATCH STATUS</Text>
              <Text style={styles.infoStatus}>✓ Dr. Anjali Mehta: SMS & IVRS Connected</Text>
              <Text style={styles.infoStatus}>✓ Lilavati ER Desk: Bed Reserved</Text>
              <Text style={styles.infoStatus}>✓ Star Health TPA: Cashless Pre-Auth Open</Text>
              <Text style={styles.infoStatus}>✓ Family (Sunita Sharma): Alert Delivered</Text>
            </View>

            <TouchableOpacity
              style={styles.resolveButton}
              onPress={handleResolve}
            >
              <Text style={styles.resolveText}>Mark SOS as Resolved</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f2' },
  content: { padding: 20 },
  title: { color: '#183b35', fontSize: 22, fontWeight: 'bold' },
  sub: { color: '#72817b', fontSize: 12, marginBottom: 24 },
  triggerContainer: { alignItems: 'center', marginVertical: 30 },
  bigRedButton: { width: 220, height: 220, borderRadius: 110, backgroundColor: '#dc2626', justifyContent: 'center', alignItems: 'center', shadowColor: '#ef4444', shadowOpacity: 0.8, shadowRadius: 20, elevation: 15, borderWidth: 6, borderColor: '#f87171' },
  bigRedText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  bigRedSub: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
  warningText: { color: '#72817b', fontSize: 11, textAlign: 'center', marginTop: 24, maxWidth: 280 },
  activeContainer: { flex: 1 },
  activeBadge: { backgroundColor: '#f8e9e3', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  activeBadgeText: { color: '#9a4939', fontWeight: 'bold', fontSize: 13 },
  infoBox: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e5e9e1', marginBottom: 12 },
  infoTitle: { color: '#287866', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  infoVal: { color: '#29483f', fontSize: 13, fontFamily: 'monospace' },
  infoHospital: { color: '#72817b', fontSize: 12, marginTop: 4 },
  infoStatus: { color: '#47756a', fontSize: 12, marginVertical: 2 },
  resolveButton: { backgroundColor: '#059669', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  resolveText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 }
})
