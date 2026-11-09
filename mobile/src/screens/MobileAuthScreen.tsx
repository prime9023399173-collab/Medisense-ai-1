import React, { useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { mobileApi, setMobileAuthToken } from '../services/api'

type PortalRole = 'patient' | 'doctor' | 'insurance'

const demoAccounts: Record<PortalRole, string> = {
  patient: 'rahul@medisense.ai',
  doctor: 'dr.anjali@medisense.ai',
  insurance: 'insurance@medisense.ai'
}

export const MobileAuthScreen = ({ onAuthenticated }: { onAuthenticated: (session: any) => void }) => {
  const [role, setRole] = useState<PortalRole>('patient')
  const [email, setEmail] = useState(demoAccounts.patient)
  const [password, setPassword] = useState('demo123')
  const [otp, setOtp] = useState('')
  const [otpMode, setOtpMode] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  const selectRole = (nextRole: PortalRole) => {
    setRole(nextRole)
    setEmail(demoAccounts[nextRole])
    setNotice('')
  }

  const sendOtp = async () => {
    try {
      setBusy(true)
      await mobileApi.sendOtp(email)
      setNotice('Investor demo OTP: 882910')
    } catch (error: any) {
      setNotice(error.message || 'Could not send OTP.')
    } finally {
      setBusy(false)
    }
  }

  const authenticate = async () => {
    try {
      setBusy(true)
      setNotice('')
      const result = otpMode
        ? await mobileApi.verifyOtp(email, otp)
        : await mobileApi.login(email, password)

      if (result.user?.role !== role) {
        setNotice(`This account belongs to the ${result.user?.role || 'unknown'} portal.`)
        return
      }

      setMobileAuthToken(result.token)
      let patientProfile = result.patientProfile
      if (role === 'patient' && !patientProfile) {
        const patients = await mobileApi.getPatients()
        patientProfile = patients.find((patient: any) => patient.userId === result.user.id)
      }
      onAuthenticated({ ...result, patientProfile })
    } catch (error: any) {
      setNotice(error.message || 'Sign-in failed. Check your account and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>M</Text></View>
        <Text style={styles.brand}>Medisense AI</Text>
        <Text style={styles.subtitle}>Connected care, in one place</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Choose your portal</Text>
          <View style={styles.roleRow}>
            {(['patient', 'doctor', 'insurance'] as const).map(item => (
              <TouchableOpacity key={item} onPress={() => selectRole(item)} style={[styles.roleButton, role === item && styles.roleSelected]}>
                <Text style={[styles.roleText, role === item && styles.roleTextSelected]}>{item === 'insurance' ? 'Insurer' : item[0].toUpperCase() + item.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} placeholder="name@example.com" placeholderTextColor="#8c9994" />
          {otpMode ? (
            <>
              <Text style={styles.label}>One-time code</Text>
              <TextInput keyboardType="number-pad" value={otp} onChangeText={setOtp} style={styles.input} placeholder="Enter 6-digit code" placeholderTextColor="#8c9994" />
              <TouchableOpacity onPress={sendOtp} disabled={busy} style={styles.textButton}><Text style={styles.textButtonLabel}>Send a demo code</Text></TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Password</Text>
              <TextInput secureTextEntry value={password} onChangeText={setPassword} style={styles.input} placeholder="Password" placeholderTextColor="#8c9994" />
            </>
          )}

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <TouchableOpacity onPress={authenticate} disabled={busy} style={[styles.submit, busy && styles.disabled]}>
            <Text style={styles.submitText}>{busy ? 'Signing in...' : 'Continue securely'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setOtpMode(!otpMode); setNotice('') }} style={styles.textButton}>
            <Text style={styles.textButtonLabel}>{otpMode ? 'Use email and password' : 'Use a one-time code instead'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.demoNote}>Demo accounts use password demo123. OTP mode uses the backend demo code.</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f2' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brandMark: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#287866', marginBottom: 16 },
  brandMarkText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  brand: { color: '#183b35', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#70807a', fontSize: 14, marginTop: 4, marginBottom: 26 },
  form: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#e5e9e1', padding: 18 },
  label: { color: '#394d47', fontSize: 12, fontWeight: '700', marginTop: 12, marginBottom: 7 },
  roleRow: { flexDirection: 'row', gap: 6 },
  roleButton: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: '#dce4df', paddingVertical: 10, alignItems: 'center' },
  roleSelected: { backgroundColor: '#e8f2ed', borderColor: '#79aa99' },
  roleText: { color: '#65736e', fontSize: 11, fontWeight: '600' },
  roleTextSelected: { color: '#215d50', fontWeight: '800' },
  input: { height: 46, borderRadius: 10, borderWidth: 1, borderColor: '#dce4df', backgroundColor: '#fbfcfa', paddingHorizontal: 12, color: '#263c36', fontSize: 14 },
  submit: { backgroundColor: '#287866', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  textButton: { alignSelf: 'center', paddingVertical: 12 },
  textButtonLabel: { color: '#287866', fontSize: 12, fontWeight: '700' },
  notice: { color: '#8a513b', backgroundColor: '#fbf2e8', borderRadius: 8, padding: 10, marginTop: 12, fontSize: 12 },
  demoNote: { color: '#85918c', textAlign: 'center', fontSize: 11, marginTop: 18, lineHeight: 16 }
})