import React, { useContext, useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { mobileApi } from '../services/api'
import { MobileLanguageContext, mobileText } from '../i18n'

type Section = 'directory' | 'analytics' | 'requests' | 'claims'

export const DoctorScreen = () => {
  const { language } = useContext(MobileLanguageContext)
  const t = mobileText[language]
  const [section, setSection] = useState<Section>('directory')
  const [patients, setPatients] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [patientId, setPatientId] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [history, setHistory] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [claims, setClaims] = useState<any[]>([])
  const [doctorNote, setDoctorNote] = useState('')
  const [editingPatient, setEditingPatient] = useState(false)

  const loadData = async () => {
    try {
      const [patientsData, analyticsData, prescriptionData, claimData] = await Promise.all([
        mobileApi.getPatients(query),
        mobileApi.getDoctorAnalytics(),
        mobileApi.getPendingPrescriptions(),
        mobileApi.getClaims()
      ])
      setPatients(patientsData)
      setAnalytics(analyticsData.patientAIAnalyses || [])
      setPrescriptions(prescriptionData)
      setClaims(claimData)
    } catch (error) {
      console.warn('Could not refresh doctor workspace:', error)
    }
  }

  useEffect(() => {
    loadData()
    const timer = setInterval(loadData, 4000)
    return () => clearInterval(timer)
  }, [query])

  const selectPatient = async (patient: any) => {
    try {
      const result = await mobileApi.getPatientHistory(patient.id)
      setSelectedPatient(result.patient)
      setHistory(result)
      setDoctorNote(result.patient?.clinicalNote || '')
      setEditingPatient(false)
    } catch (error: any) {
      Alert.alert('Patient record unavailable', error.message || 'Could not load the patient history.')
    }
  }

  const savePatientRecord = async () => {
    if (!selectedPatient) return
    try {
      const nextAllergies = selectedPatient.allergies?.length ? selectedPatient.allergies : []
      const nextDiseases = selectedPatient.existingDiseases?.length ? selectedPatient.existingDiseases : []
      await mobileApi.updatePatient(selectedPatient.id, {
        preferredLanguage: language,
        allergies: nextAllergies,
        existingDiseases: nextDiseases,
        emergencyContacts: selectedPatient.emergencyContacts || [],
        familyMembers: selectedPatient.familyMembers || [],
        storageProvider: 'google_drive'
      })
      const result = await mobileApi.getPatientHistory(selectedPatient.id)
      setSelectedPatient(result.patient)
      setHistory(result)
      setDoctorNote(doctorNote || result.patient?.clinicalNote || '')
      setEditingPatient(false)
      Alert.alert('Patient details updated', 'The directory entry and care note have been saved.')
    } catch (error: any) {
      Alert.alert('Could not save record', error.message || 'Please try again.')
    }
  }

  const addPatient = async () => {
    try {
      const result = await mobileApi.addPatient(patientId)
      setPatientId('')
      await loadData()
      if (result.patient) await selectPatient(result.patient)
    } catch (error: any) {
      Alert.alert('Patient not found', error.message || 'Check the patient ID and try again.')
    }
  }

  const reviewPrescription = async (id: number) => {
    try {
      await mobileApi.reviewPrescription(id, 'approved')
      await loadData()
    } catch (error: any) {
      Alert.alert('Review failed', error.message || 'Could not approve this recommendation.')
    }
  }

  const verifyClaim = async (id: number) => {
    try {
      await mobileApi.verifyClaim(id)
      await loadData()
    } catch (error: any) {
      Alert.alert('Review failed', error.message || 'Could not send the clinical review.')
    }
  }

  const tabs: { id: Section; label: string }[] = [
    { id: 'directory', label: t.directory },
    { id: 'analytics', label: t.analytics },
    { id: 'requests', label: t.aiRequests },
    { id: 'claims', label: t.claimQueue }
  ]

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Doctor workspace</Text>
      <Text style={styles.subtitle}>Patient records, review queues, and health signals</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {tabs.map(tab => <TouchableOpacity key={tab.id} onPress={() => setSection(tab.id)} style={[styles.tab, section === tab.id && styles.tabActive]}><Text style={[styles.tabText, section === tab.id && styles.tabTextActive]}>{tab.label}</Text></TouchableOpacity>)}
      </ScrollView>

      {section === 'directory' && <>
        <Text style={styles.sectionTitle}>Patient directory</Text>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search name or patient ID" placeholderTextColor="#8c9994" style={styles.input} />
        <View style={styles.sampleRow}>
          {['MED-P-10924', 'MED-P-10925', 'MED-P-10926'].map(id => <TouchableOpacity key={id} onPress={() => setPatientId(id)} style={styles.sample}><Text style={styles.sampleText}>{id}</Text></TouchableOpacity>)}
        </View>
        <View style={styles.inlineForm}>
          <TextInput value={patientId} onChangeText={setPatientId} placeholder="Patient ID / ABHA" placeholderTextColor="#8c9994" style={[styles.input, styles.flexInput]} />
          <TouchableOpacity onPress={addPatient} style={styles.smallButton}><Text style={styles.buttonText}>Add</Text></TouchableOpacity>
        </View>
        {patients.map(patient => <TouchableOpacity key={patient.id} onPress={() => selectPatient(patient)} style={styles.card}>
          <Text style={styles.cardTitle}>{patient.name}</Text>
          <Text style={styles.meta}>{patient.patientCode} · {patient.bloodGroup}</Text>
          <Text style={styles.meta}>{patient.existingDiseases?.join(', ') || 'No conditions listed'}</Text>
        </TouchableOpacity>)}
        {selectedPatient && <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{selectedPatient.name} · Medical record</Text>
            <TouchableOpacity onPress={() => setEditingPatient(!editingPatient)} style={styles.smallSecondaryButton}>
              <Text style={styles.smallSecondaryButtonText}>{editingPatient ? 'Close' : 'Edit record'}</Text>
            </TouchableOpacity>
          </View>

          {editingPatient ? (
            <View style={styles.editBox}>
              <Text style={styles.metaLabel}>Conditions</Text>
              <TextInput value={(selectedPatient.existingDiseases || []).join(', ')} onChangeText={text => setSelectedPatient({ ...selectedPatient, existingDiseases: text.split(',').map(item => item.trim()).filter(Boolean) })} style={styles.textArea} multiline />
              <Text style={styles.metaLabel}>Allergies</Text>
              <TextInput value={(selectedPatient.allergies || []).join(', ')} onChangeText={text => setSelectedPatient({ ...selectedPatient, allergies: text.split(',').map(item => item.trim()).filter(Boolean) })} style={styles.textArea} multiline />
              <Text style={styles.metaLabel}>Clinical note / care summary</Text>
              <TextInput value={doctorNote} onChangeText={setDoctorNote} style={styles.textArea} multiline placeholder="Add note, plan, summary and follow-up direction" placeholderTextColor="#8c9994" />
              <TouchableOpacity onPress={savePatientRecord} style={styles.button}><Text style={styles.buttonText}>Save record</Text></TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.meta}>Conditions: {selectedPatient.existingDiseases?.join(', ') || 'None listed'}</Text>
              <Text style={styles.meta}>Allergies: {selectedPatient.allergies?.join(', ') || 'None listed'}</Text>
              <Text style={styles.meta}>Active medicines: {history?.medicines?.map((item: any) => item.name).join(', ') || 'No active medicines'}</Text>
              <Text style={styles.meta}>Reports: {history?.records?.map((item: any) => item.title).join(', ') || 'No reports on file'}</Text>
              <Text style={styles.meta}>Clinical note: {doctorNote || 'No summary saved yet.'}</Text>
            </>
          )}
        </View>}
      </>}

      {section === 'analytics' && <>
        <Text style={styles.sectionTitle}>AI health overview</Text>
        <Text style={styles.disclaimer}>Decision support only. Review source records before making clinical decisions.</Text>
        {analytics.map(item => <View key={item.patientId} style={styles.card}>
          <View style={styles.row}><Text style={styles.cardTitle}>{item.patientName}</Text><Text style={[styles.status, item.aiConditionStatus === 'CRITICAL' && styles.statusCritical]}>{item.aiConditionStatus}</Text></View>
          <Text style={styles.meta}>{item.patientCode} · Health {item.healthScore}/100 · Adherence {item.complianceScore}%</Text>
          <Text style={styles.meta}>{item.activeMedicationsCount} medicines · {item.uploadedReportsCount} reports</Text>
          <Text style={styles.body}>{item.aiClinicalRecommendation}</Text>
        </View>)}
      </>}

      {section === 'requests' && <>
        <Text style={styles.sectionTitle}>AI recommendations awaiting review</Text>
        {prescriptions.map(item => <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.patientName} · {item.suggestedDiagnosis}</Text>
          <Text style={styles.meta}>{item.patientCode} · Risk {item.triageLevel}</Text>
          <Text style={styles.body}>{item.aiSummary}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={() => reviewPrescription(item.id)} style={styles.button}><Text style={styles.buttonText}>Approve recommendation</Text></TouchableOpacity>
          </View>
        </View>)}
        {prescriptions.length === 0 && <Text style={styles.empty}>No AI recommendations are waiting for review.</Text>}
      </>}

      {section === 'claims' && <>
        <Text style={styles.sectionTitle}>Claims needing clinical review</Text>
        {claims.filter(item => item.status === 'forwarded_to_doctor').map(item => <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.claimNumber} · {item.patientName}</Text>
          <Text style={styles.meta}>{item.diagnosisIcd10} · INR {item.claimedAmount?.toLocaleString()}</Text>
          <Text style={styles.body}>{item.treatmentSummary}</Text>
          <TouchableOpacity onPress={() => verifyClaim(item.id)} style={styles.button}><Text style={styles.buttonText}>Complete clinical review</Text></TouchableOpacity>
        </View>)}
        {!claims.some(item => item.status === 'forwarded_to_doctor') && <Text style={styles.empty}>No claims are currently assigned for review.</Text>}
      </>}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f2' },
  content: { padding: 16, paddingBottom: 30 },
  title: { color: '#183b35', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#72817b', fontSize: 12, marginTop: 4 },
  tabs: { marginVertical: 14, maxHeight: 40 },
  tab: { paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#fff', borderRadius: 9, borderWidth: 1, borderColor: '#e5e9e1', marginRight: 6 },
  tabActive: { backgroundColor: '#e8f2ed', borderColor: '#79aa99' },
  tabText: { color: '#65736e', fontSize: 11, fontWeight: '700' },
  tabTextActive: { color: '#215d50' },
  sectionTitle: { color: '#29483f', fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 4 },
  input: { minHeight: 42, borderRadius: 9, borderWidth: 1, borderColor: '#dce4df', paddingHorizontal: 10, color: '#263c36', backgroundColor: '#fff', fontSize: 12, marginBottom: 8 },
  sampleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  sample: { backgroundColor: '#edf4ef', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 6 },
  sampleText: { color: '#416d61', fontSize: 9, fontWeight: '700' },
  inlineForm: { flexDirection: 'row', gap: 8 },
  flexInput: { flex: 1 },
  smallButton: { backgroundColor: '#287866', borderRadius: 9, paddingHorizontal: 16, justifyContent: 'center', marginBottom: 8 },
  button: { backgroundColor: '#287866', borderRadius: 9, paddingVertical: 11, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  smallSecondaryButton: { backgroundColor: '#edf4ef', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#d7e7df' },
  smallSecondaryButtonText: { color: '#215d50', fontSize: 10, fontWeight: '800' },
  textArea: { minHeight: 72, borderRadius: 8, borderWidth: 1, borderColor: '#dce4df', padding: 10, backgroundColor: '#fbfcfa', color: '#263c36', marginBottom: 8, textAlignVertical: 'top' },
  metaLabel: { color: '#4a5f5a', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  editBox: { marginTop: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 13, borderWidth: 1, borderColor: '#e5e9e1', padding: 13, marginBottom: 9 },
  cardTitle: { color: '#29483f', fontSize: 13, fontWeight: '800', flexShrink: 1 },
  meta: { color: '#73817b', fontSize: 10, lineHeight: 15, marginTop: 4 },
  body: { color: '#475a53', fontSize: 11, lineHeight: 16, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  status: { color: '#3c795f', backgroundColor: '#edf5ee', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, fontSize: 9, fontWeight: '800' },
  statusCritical: { color: '#9a4939', backgroundColor: '#faeee9' },
  empty: { color: '#7b8983', fontSize: 12, paddingVertical: 18 },
  disclaimer: { color: '#87938e', fontSize: 10, lineHeight: 15, marginBottom: 10 }
})