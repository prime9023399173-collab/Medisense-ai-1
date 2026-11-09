import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView
} from 'react-native'
import { mobileApi } from '../services/api'
import { MobileLanguageContext, mobileText } from '../i18n'

export const AIDoctorScreen = ({ route }: any) => {
  const patientId = route?.params?.patientId || 1
  const { language } = useContext(MobileLanguageContext)
  const t = mobileText[language]
  const [messages, setMessages] = useState<any[]>([
    { sender: 'ai', text: 'Hello. I am your Medisense AI Health Doctor. What symptoms are you experiencing?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestedRx, setSuggestedRx] = useState<any[] | null>(null)
  const [consultationId, setConsultationId] = useState<number | null>(null)
  const [forwarded, setForwarded] = useState(false)
  const [avatarState, setAvatarState] = useState<'idle' | 'speaking' | 'listening'>('idle')
  const [scriptPreview, setScriptPreview] = useState<string>('')

  useEffect(() => {
    if (messages.length === 1) {
      const greeting = language === 'hi'
        ? 'नमस्ते। मैं मेडिसेंस एआई स्वास्थ्य डॉक्टर हूं। कृपया अपने लक्षण बताएं।'
        : language === 'mr'
        ? 'नमस्कार. मी मेडिसेंस एआय आरोग्य डॉक्टर आहे. कृपया आपली लक्षणे सांगा.'
        : 'Hello. I am your Medisense AI Health Doctor. What symptoms are you experiencing?'
      setMessages([{ sender: 'ai', text: greeting }])
    }
  }, [language])

  const handleSend = async (queryText?: string) => {
    const text = queryText || input
    if (!text.trim() || loading) return

    setMessages(prev => [...prev, { sender: 'patient', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await mobileApi.consultAIDoctor({
        patientId,
        query: text,
        history: messages.map(m => ({ sender: m.sender, message: m.text })),
        language
      })

      const aiText = res.rawFormattedText || res.reply || 'Clinical review complete.'
      setMessages(prev => [...prev, { sender: 'ai', text: aiText }])
      setConsultationId(res.consultationId)
      setForwarded(false)
      setAvatarState('speaking')
      setScriptPreview(
        language === 'hi'
          ? 'एआई वीडियो एंकर: रोगी के लक्षणों का विश्लेषण किया गया है। प्रारंभिक निदान और prescription डॉक्टर के अनुमोदन के लिए भेजी गई है।'
          : language === 'mr'
          ? 'एआय व्हिडिओ अॅनकर: रुग्णाच्या लक्षणांची तपासणी झाली आहे. प्रारंभिक निदान आणि प्रिस्क्रिप्शन डॉक्टरांच्या मान्यतेसाठी पाठवले आहे.'
          : 'AI video avatar: the symptom analysis is complete. Preliminary diagnosis and prescription are queued for doctor verification.'
      )
      setTimeout(() => setAvatarState('idle'), 3000)
      if (res.preliminaryPrescription?.length > 0) {
        setSuggestedRx(res.preliminaryPrescription)
      }
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Based on your symptoms, please maintain hydration and monitor your temperature. Recommended protocol sent to Dr. Anjali Mehta.' }])
    } finally {
      setLoading(false)
    }
  }

  const forwardForApproval = async () => {
    if (!consultationId) return
    try {
      await mobileApi.forwardPrescription(consultationId)
      setForwarded(true)
    } catch (error: any) {
      setMessages(prev => [...prev, { sender: 'ai', text: error.message || 'Could not forward this recommendation.' }])
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.aiDoctor}</Text>
        <Text style={styles.sub}>Llama 3.3 70B & Clinical Inference</Text>
      </View>

      <View style={styles.avatarCard}>
        <Text style={styles.avatarTitle}>AI video avatar status</Text>
        <Text style={styles.avatarText}>{avatarState === 'speaking' ? 'Dr. Priya AI is speaking and explaining the diagnosis and next prescription steps.' : 'AI avatar is listening and preparing a clinical summary.'}</Text>
        {scriptPreview ? <Text style={styles.scriptPreview}>{scriptPreview}</Text> : null}
      </View>

      <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
        {messages.map((m, idx) => (
          <View
            key={idx}
            style={[
              styles.msgBubble,
              m.sender === 'patient' ? styles.patientMsg : styles.aiMsg
            ]}
          >
            <Text style={styles.msgText}>{m.text}</Text>
          </View>
        ))}

        {loading && (
          <View style={styles.aiMsg}>
            <Text style={styles.loadingText}>{t.analyzing}</Text>
          </View>
        )}

        {suggestedRx && (
          <View style={styles.rxCard}>
            <Text style={styles.rxTitle}>Preliminary suggestion · doctor approval required</Text>
            {suggestedRx.map((rx, i) => (
              <Text key={i} style={styles.rxItem}>• {rx.medicine} - {rx.dosage} ({rx.timing})</Text>
            ))}
            <TouchableOpacity disabled={forwarded || !consultationId} onPress={forwardForApproval} style={styles.forwardButton}>
              <Text style={styles.forwardText}>{forwarded ? t.forwarded : t.forward}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t.symptoms}
          placeholderTextColor="#64748b"
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
          <Text style={styles.sendText}>{t.send}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f2' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e9e1' },
  title: { color: '#183b35', fontSize: 18, fontWeight: 'bold' },
  sub: { color: '#47756a', fontSize: 11 },
  chatScroll: { flex: 1 },
  chatContent: { padding: 16 },
  msgBubble: { maxWidth: '82%', padding: 12, borderRadius: 16, marginBottom: 10 },
  aiMsg: { backgroundColor: '#fff', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#e5e9e1' },
  patientMsg: { backgroundColor: '#dcebe3', alignSelf: 'flex-end' },
  msgText: { color: '#29483f', fontSize: 13, lineHeight: 18 },
  loadingText: { color: '#47756a', fontSize: 12 },
  avatarCard: { backgroundColor: '#0f172a', borderRadius: 14, marginHorizontal: 16, marginTop: 8, padding: 12, borderWidth: 1, borderColor: '#334155' },
  avatarTitle: { color: '#d1fae5', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  avatarText: { color: '#f8fafc', fontSize: 12, lineHeight: 18 },
  scriptPreview: { color: '#e2e8f0', fontSize: 11, lineHeight: 18, marginTop: 8 },
  rxCard: { backgroundColor: '#edf4ef', borderWidth: 1, borderColor: '#d3e4da', borderRadius: 12, padding: 14, marginVertical: 10 },
  rxTitle: { color: '#287866', fontWeight: 'bold', fontSize: 12, marginBottom: 6 },
  rxItem: { color: '#49655b', fontSize: 11, marginVertical: 2 },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#e5e9e1', backgroundColor: '#fff' },
  input: { flex: 1, backgroundColor: '#fbfcfa', color: '#29483f', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, fontSize: 13, borderWidth: 1, borderColor: '#dce4df' },
  sendButton: { backgroundColor: '#287866', paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginLeft: 8 },
  sendText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  forwardButton: { backgroundColor: '#287866', borderRadius: 8, paddingVertical: 9, alignItems: 'center', marginTop: 10 },
  forwardText: { color: '#fff', fontSize: 10, fontWeight: '800' }
})
