import React, { useContext, useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { mobileApi } from '../services/api'
import { MobileLanguageContext, mobileText } from '../i18n'

export const FamilyScreen = ({ route }: any) => {
  const patientId = route?.params?.patientId || 1
  const { language } = useContext(MobileLanguageContext)
  const t = mobileText[language]
  const [patient, setPatient] = useState<any>(null)
  const [activeSos, setActiveSos] = useState<any[]>([])

  const loadData = async () => {
    try {
      const [patientData, sosData] = await Promise.all([mobileApi.getPatient(patientId), mobileApi.getActiveSOS()])
      setPatient(patientData)
      setActiveSos(sosData.filter((event: any) => event.patientId === patientId))
    } catch (error) {
      console.warn('Could not refresh family view:', error)
    }
  }

  useEffect(() => {
    loadData()
    const timer = setInterval(loadData, 5000)
    return () => clearInterval(timer)
  }, [patientId])

  const triggerSos = async () => {
    try {
      await mobileApi.triggerSOS({ patientId, latitude: 19.076, longitude: 72.8777, address: 'Mumbai, Maharashtra (demo location)' })
      await loadData()
      Alert.alert('SOS sent', 'The demo emergency alert was sent to the connected care team.')
    } catch (error: any) {
      Alert.alert('Could not send SOS', error.message || 'Check the API connection and try again.')
    }
  }

  const resolveSos = async (id: number) => {
    try {
      await mobileApi.resolveSOS(id)
      await loadData()
    } catch (error: any) {
      Alert.alert('Could not resolve alert', error.message || 'Try again.')
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t.family}</Text>
      <Text style={styles.subtitle}>{t.familySubtitle}</Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{patient?.name || 'Patient'}</Text>
        <Text style={styles.detail}>Patient ID: {patient?.patientCode || 'Loading...'}</Text>
        <Text style={styles.detail}>Blood group: {patient?.bloodGroup || 'Not on file'}</Text>
        <Text style={styles.detail}>Allergies: {patient?.allergies?.join(', ') || 'None listed'}</Text>
        <Text style={styles.detail}>Conditions: {patient?.existingDiseases?.join(', ') || 'None listed'}</Text>
      </View>
      <TouchableOpacity onPress={triggerSos} style={styles.sosButton}><Text style={styles.sosText}>{t.requestHelp}</Text></TouchableOpacity>
      <Text style={styles.sectionTitle}>Emergency timeline</Text>
      {activeSos.length === 0 ? <Text style={styles.empty}>{t.noAlerts}</Text> : activeSos.map(event => <View key={event.id} style={styles.alert}>
        <Text style={styles.alertTitle}>Active emergency response</Text>
        <Text style={styles.detail}>{event.address}</Text>
        <Text style={styles.detail}>Location: {event.latitude}, {event.longitude}</Text>
        <TouchableOpacity onPress={() => resolveSos(event.id)} style={styles.resolveButton}><Text style={styles.resolveText}>Resolve alert</Text></TouchableOpacity>
      </View>)}
      <Text style={styles.sectionTitle}>Authorized family contacts</Text>
      {(patient?.familyMembers || []).map((member: any, index: number) => <View key={`${member.phone}-${index}`} style={styles.contact}>
        <Text style={styles.contactName}>{member.name}</Text>
        <Text style={styles.detail}>{member.relationship} · {member.phone}</Text>
      </View>)}
      <Text style={styles.disclaimer}>The location shown is a demo coordinate. Live device GPS and emergency-service dispatch require deployment credentials and platform permissions.</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f2' },
  content: { padding: 16, paddingBottom: 30 },
  title: { color: '#183b35', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#72817b', fontSize: 12, lineHeight: 17, marginTop: 4, marginBottom: 14 },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e9e1', padding: 14, marginBottom: 12 },
  sectionTitle: { color: '#29483f', fontSize: 14, fontWeight: '800', marginTop: 12, marginBottom: 8 },
  detail: { color: '#73817b', fontSize: 11, lineHeight: 17, marginTop: 3 },
  sosButton: { backgroundColor: '#b95a48', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  sosText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  alert: { backgroundColor: '#fff8f4', borderColor: '#f0d7ca', borderWidth: 1, borderRadius: 13, padding: 13, marginBottom: 9 },
  alertTitle: { color: '#91533f', fontSize: 12, fontWeight: '800' },
  resolveButton: { backgroundColor: '#eaf3ed', paddingVertical: 9, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  resolveText: { color: '#416d61', fontSize: 11, fontWeight: '800' },
  contact: { backgroundColor: '#fff', borderRadius: 11, borderWidth: 1, borderColor: '#e5e9e1', padding: 12, marginBottom: 7 },
  contactName: { color: '#29483f', fontSize: 12, fontWeight: '800' },
  empty: { color: '#7b8983', fontSize: 12, paddingVertical: 10 },
  disclaimer: { color: '#87938e', fontSize: 10, lineHeight: 15, marginTop: 16 }
})