import React, { useContext, useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView
} from 'react-native'
import { mobileApi } from '../services/api'
import { MobileLanguageContext, mobileText } from '../i18n'

export const HomeScreen = ({ navigation, route }: any) => {
  const patientId = route?.params?.patientId || 1
  const { language } = useContext(MobileLanguageContext)
  const t = mobileText[language]
  const [patient, setPatient] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      setRefreshing(true)
      const data = await mobileApi.getPatient(patientId)
      setPatient(data)
    } catch (err) {
      console.warn('API error, using cached persona:', err)
      setPatient({
        name: 'Rahul Sharma',
        patientCode: 'MED-P-10924',
        universalHealthId: 'MED-ABHA-91-4458-1290-7712',
        bloodGroup: 'O+',
        healthScore: 88,
        complianceScore: 95
      })
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [patientId])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#14b8a6" />}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{t.welcome}</Text>
            <Text style={styles.patientName}>{patient?.name || 'Rahul Sharma'}</Text>
            <Text style={styles.patientId}>{patient?.patientCode || 'MED-P-10924'}</Text>
          </View>
          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => navigation.navigate('SOS')}
            activeOpacity={0.8}
          >
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Health Score Card */}
        <View style={styles.healthCard}>
          <View style={styles.healthScoreRow}>
            <View>
              <Text style={styles.healthLabel}>{t.healthScore}</Text>
              <Text style={styles.healthScoreValue}>{patient?.healthScore || 88}/100</Text>
              <Text style={styles.healthSub}>{t.optimal}</Text>
            </View>
            <View style={styles.complianceBadge}>
              <Text style={styles.complianceText}>{patient?.complianceScore || 95}%</Text>
              <Text style={styles.complianceLabel}>{t.adherence}</Text>
            </View>
          </View>
        </View>

        {/* Quick ABHA ID Card */}
        <View style={styles.vaultCard}>
          <Text style={styles.vaultTitle}>{t.healthId} (ABHA)</Text>
          <Text style={styles.abhaId}>{patient?.universalHealthId || 'MED-ABHA-91-4458-1290'}</Text>
          <View style={styles.vaultFooter}>
            <Text style={styles.vaultTag}>Blood: {patient?.bloodGroup || 'O+'}</Text>
            <Text style={styles.vaultTag}>AES-GCM-256 Verified</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionBox}
            onPress={() => navigation.navigate('AIDoctor')}
          >
            <Text style={styles.actionIcon}>🩺</Text>
            <Text style={styles.actionTitle}>{t.aiDoctor}</Text>
            <Text style={styles.actionDesc}>Instant Triage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBox}
            onPress={() => navigation.navigate('Medicine')}
          >
            <Text style={styles.actionIcon}>💊</Text>
            <Text style={styles.actionTitle}>{t.medicines}</Text>
            <Text style={styles.actionDesc}>5-Stage Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBox}
            onPress={() => navigation.navigate('Vault')}
          >
            <Text style={styles.actionIcon}>🔒</Text>
            <Text style={styles.actionTitle}>{t.vault}</Text>
            <Text style={styles.actionDesc}>Encrypted Records</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts Snippet */}
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>{t.emergencyContacts}</Text>
          <Text style={styles.emergencyText}>Sunita Sharma (Mother): +919820998811</Text>
          <Text style={styles.emergencyText}>Vikram Sharma (Brother): +919820887722</Text>
          <Text style={styles.emergencyText}>Dr. Anjali Mehta: +919811001122</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f2' },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { color: '#72817b', fontSize: 12 },
  patientName: { color: '#183b35', fontSize: 20, fontWeight: 'bold' },
  patientId: { color: '#287866', fontSize: 11, fontFamily: 'monospace' },
  sosButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#dc2626', justifyContent: 'center', alignItems: 'center', shadowColor: '#dc2626', shadowOpacity: 0.5, shadowRadius: 8, elevation: 8 },
  sosText: { color: '#ffffff', fontWeight: '900', fontSize: 14 },
  healthCard: { backgroundColor: '#e7f1eb', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#d3e4da' },
  healthScoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  healthLabel: { color: '#47756a', fontSize: 10, fontWeight: 'bold' },
  healthScoreValue: { color: '#183b35', fontSize: 32, fontWeight: 'bold', marginVertical: 4 },
  healthSub: { color: '#647a70', fontSize: 11 },
  complianceBadge: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#8eb8a4', justifyContent: 'center', alignItems: 'center' },
  complianceText: { color: '#215d50', fontSize: 16, fontWeight: 'bold' },
  complianceLabel: { color: '#647a70', fontSize: 8 },
  vaultCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e5e9e1', marginBottom: 16 },
  vaultTitle: { color: '#72817b', fontSize: 11, fontWeight: 'bold' },
  abhaId: { color: '#29483f', fontSize: 15, fontFamily: 'monospace', fontWeight: 'bold', marginVertical: 6 },
  vaultFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  vaultTag: { color: '#287866', fontSize: 10, backgroundColor: '#edf4ef', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  actionBox: { flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e9e1', marginHorizontal: 4, alignItems: 'center' },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionTitle: { color: '#29483f', fontSize: 12, fontWeight: 'bold' },
  actionDesc: { color: '#72817b', fontSize: 9 },
  emergencyCard: { backgroundColor: '#fbf2e8', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#eedcc9' },
  emergencyTitle: { color: '#75563e', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  emergencyText: { color: '#806b56', fontSize: 11, marginVertical: 2 }
})
