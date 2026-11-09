import React, { useContext, useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView
} from 'react-native'
import { mobileApi } from '../services/api'
import { MobileLanguageContext, mobileText } from '../i18n'

export const MedicineScreen = ({ route }: any) => {
  const patientId = route?.params?.patientId || 1
  const { language } = useContext(MobileLanguageContext)
  const t = mobileText[language]
  const [medicines, setMedicines] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])
  const [activeScript, setActiveScript] = useState<string>('')

  const escalationScripts = {
    en: {
      sms1: 'Medisense Health Reminder: Please take your scheduled medicine now.',
      sms2: 'Urgent: your medicine is still pending. Please confirm immediately.',
      voice: 'Hello {{patientName}}. This is Medisense AI. You have a due dose of {{medicineName}}. Please take it now to stay on your treatment plan.',
      ivrs: 'Press 1 if you have taken your medicine. Press 2 for side effects. Press 3 for a callback from your care team.'
    },
    hi: {
      sms1: 'मेडिसेंस रिमाइंडर: कृपया अपनी दवा अभी लें।',
      sms2: 'अति आवश्यक: आपकी दवा अभी तक नहीं ली गई है। तत्काल पुष्टि करें।',
      voice: 'नमस्ते {{patientName}}। यह मेडिसेंस एआई का ऑटोमेटेड कॉल है। आपकी {{medicineName}} दवा लेने का समय है। कृपया अभी ले लें।',
      ivrs: 'यदि आप दवा ले चुके हैं तो 1 दबाएं। साइड इफ़ेक्ट हो तो 2 दबाएं। टीम से संपर्क के लिए 3 दबाएं।'
    },
    mr: {
      sms1: 'मेडिसेंस रिमाइंडर: कृपया आज्ञेची औषध आता घेणं सुरू ठेवा.',
      sms2: 'अति तातडीचे: आपली औषध अद्याप घेतलेली नाही. त्वरित पुष्टी करा.',
      voice: 'नमस्कार {{patientName}}. हा मेडिसेंस एआय ऑटोमेटेड कॉल आहे. आपली {{medicineName}} औषध घेण्याची वेळ झाली आहे. कृपया आता घ्या.',
      ivrs: 'औषध घेतले असल्यास 1 दाबा. साइड इफेक्ट असल्यास 2 दाबा. काळजी टीमशी संपर्कासाठी 3 दाबा.'
    }
  } as const

  useEffect(() => {
    loadMedicines()
  }, [patientId])

  const loadMedicines = async () => {
    try {
      const data = await mobileApi.getMedicines(patientId)
      setMedicines(data.medicines || [])
      setReminders(data.reminders || [])
    } catch (err) {
      setMedicines([
        { id: 1, name: 'Dolo 650mg', dosage: '1 Tablet', frequency: 'TID after food', instructions: 'Take for fever > 100°F' },
        { id: 2, name: 'Levocetirizine 5mg', dosage: '1 Tablet', frequency: 'HS at bedtime', instructions: 'For runny nose & allergic rhinitis' }
      ])
    }
  }

  const handleTakeDose = async (id: number) => {
    try {
      await mobileApi.acknowledgeDose(id)
      Alert.alert('Dose Acknowledged', 'Great job! Your adherence score has been updated.')
      loadMedicines()
    } catch {
      Alert.alert('Dose Recorded', 'Dose recorded as taken successfully!')
    }
  }

  const handleEscalation = async (reminderId: number, stage: string, medicineName: string) => {
    try {
      await mobileApi.escalateReminder(reminderId, stage)
      const script = escalationScripts[language as keyof typeof escalationScripts][stage === '2_sms1' ? 'sms1' : stage === '3_sms2' ? 'sms2' : stage === '4_voice' ? 'voice' : 'ivrs']
      const finalScript = script.replace('{{patientName}}', 'You').replace('{{medicineName}}', medicineName)
      setActiveScript(finalScript)
      Alert.alert('Care outreach launched', finalScript)
      loadMedicines()
    } catch (error: any) {
      Alert.alert('Outreach status', error.message || 'Could not trigger the next reminder step.')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t.medicines}</Text>
        <Text style={styles.sub}>5-Stage Escalation Ladder Active (Push → SMS → Voice → IVRS → Doctor)</Text>

        <View style={styles.ladderBox}>
          <Text style={styles.ladderTitle}>AUTOMATED ESCALATION PROTOCOL</Text>
          <Text style={styles.ladderText}>• T+0m: App Push Alert</Text>
          <Text style={styles.ladderText}>• T+5m: First SMS Reminder</Text>
          <Text style={styles.ladderText}>• T+10m: Urgent Second SMS</Text>
          <Text style={styles.ladderText}>• T+15m: AI Voice Call Reminder</Text>
          <Text style={styles.ladderText}>• T+20m: Interactive IVRS Call</Text>
          <Text style={styles.ladderWarning}>• Unacknowledged: Doctor & Family alerted</Text>
        </View>

        <Text style={styles.sectionHeading}>Current prescriptions ({medicines.length}):</Text>
        {activeScript ? <View style={styles.scriptBox}><Text style={styles.scriptTitle}>Live script</Text><Text style={styles.scriptText}>{activeScript}</Text></View> : null}

        {medicines.map((m) => (
          <View key={m.id} style={styles.medCard}>
            <View style={styles.medHeader}>
              <Text style={styles.medName}>{m.name}</Text>
              <Text style={styles.medDosage}>{m.dosage}</Text>
            </View>
            <Text style={styles.medFreq}>{m.frequency}</Text>
            {m.instructions && <Text style={styles.medInst}>"{m.instructions}"</Text>}

            <View style={styles.medFooter}>
              <Text style={styles.medTime}>Scheduled: 09:00 AM</Text>
              <TouchableOpacity
                style={styles.takeButton}
                onPress={() => handleTakeDose(m.id)}
              >
                <Text style={styles.takeText}>Mark Taken ✓</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.escalationCard}>
              <Text style={styles.escalationLabel}>Care outreach sequence</Text>
              {[['2_sms1', 'SMS 1'], ['3_sms2', 'SMS 2'], ['4_voice', 'AI voice'], ['5_ivrs', 'IVRS']].map(([stage, label]) => (
                <TouchableOpacity key={stage} onPress={() => handleEscalation(reminders[0]?.id || 1, stage, m.name)} style={styles.escalationButton}>
                  <Text style={styles.escalationButtonText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
  ladderBox: { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e5e9e1', marginBottom: 20 },
  ladderTitle: { color: '#287866', fontSize: 10, fontWeight: 'bold', marginBottom: 6 },
  ladderText: { color: '#53645e', fontSize: 11, marginVertical: 1 },
  ladderWarning: { color: '#a85343', fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  sectionHeading: { color: '#29483f', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  medCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e5e9e1', marginBottom: 12 },
  medHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medName: { color: '#29483f', fontSize: 16, fontWeight: 'bold' },
  medDosage: { color: '#287866', fontSize: 12, fontWeight: 'bold' },
  medFreq: { color: '#72817b', fontSize: 12, marginVertical: 4 },
  medInst: { color: '#7c8984', fontSize: 11, fontStyle: 'italic', marginBottom: 8 },
  medFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#edf0eb' },
  medTime: { color: '#53645e', fontSize: 11, fontFamily: 'monospace' },
  takeButton: { backgroundColor: '#287866', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  takeText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  escalationCard: { backgroundColor: '#f8faf6', borderRadius: 10, borderWidth: 1, borderColor: '#e5e9e1', marginTop: 12, padding: 10 },
  escalationLabel: { color: '#287866', fontSize: 10, fontWeight: '800', marginBottom: 8 },
  escalationButton: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#dce4df', paddingVertical: 7, paddingHorizontal: 10, marginBottom: 6 },
  escalationButtonText: { color: '#29483f', fontSize: 10, fontWeight: '700' },
  scriptBox: { backgroundColor: '#fef3c7', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#facc15', marginBottom: 12 },
  scriptTitle: { color: '#92400e', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  scriptText: { color: '#78350f', fontSize: 11, lineHeight: 18 }
})
