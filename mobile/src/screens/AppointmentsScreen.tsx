import React, { useContext, useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { mobileApi } from '../services/api'
import { MobileLanguageContext, mobileText } from '../i18n'

export const AppointmentsScreen = ({ route }: any) => {
  const patientId = route?.params?.patientId || 1
  const { language } = useContext(MobileLanguageContext)
  const t = mobileText[language]
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctorId, setDoctorId] = useState('1')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [timeSlot, setTimeSlot] = useState('10:30 AM')
  const [chiefComplaint, setChiefComplaint] = useState('General clinical review')
  const [notice, setNotice] = useState('')

  const loadAppointments = async () => {
    try {
      setAppointments(await mobileApi.getAppointments(patientId))
    } catch (error) {
      console.warn('Could not load appointments:', error)
    }
  }

  useEffect(() => {
    loadAppointments()
    const timer = setInterval(loadAppointments, 5000)
    return () => clearInterval(timer)
  }, [patientId])

  const bookAppointment = async () => {
    try {
      const result = await mobileApi.bookAppointment({
        patientId,
        doctorId: Number(doctorId),
        date,
        timeSlot,
        type: 'video',
        chiefComplaint
      })
      setNotice(`Appointment ${result.status || 'confirmed'} for ${result.date} at ${result.timeSlot}.`)
      await loadAppointments()
    } catch (error: any) {
      setNotice(error.message || 'Could not book the appointment.')
    }
  }

  const updateAppointment = async (id: number, status: string) => {
    try {
      await mobileApi.updateAppointmentStatus(id, status, status === 'rescheduled' ? { date, timeSlot } : undefined)
      await loadAppointments()
    } catch (error: any) {
      Alert.alert('Appointment update failed', error.message || 'Please try again.')
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Appointments</Text>
      <Text style={styles.subtitle}>Book, reschedule, or cancel a doctor consultation.</Text>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Book a video appointment</Text>
        <Text style={styles.label}>Doctor</Text>
        <View style={styles.doctorRow}>
          {[{ id: '1', name: 'Dr. Anjali Mehta · General Physician' }, { id: '2', name: 'Dr. Rajesh Iyer · Cardiologist' }].map(doctor => <TouchableOpacity key={doctor.id} onPress={() => setDoctorId(doctor.id)} style={[styles.doctorOption, doctorId === doctor.id && styles.doctorSelected]}><Text style={[styles.doctorText, doctorId === doctor.id && styles.doctorTextSelected]}>{doctor.name}</Text></TouchableOpacity>)}
        </View>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput value={date} onChangeText={setDate} style={styles.input} placeholder="2026-11-08" />
          </View>
          <View style={styles.flex}>
            <Text style={styles.label}>Time</Text>
            <TextInput value={timeSlot} onChangeText={setTimeSlot} style={styles.input} placeholder="10:30 AM" />
          </View>
        </View>
        <Text style={styles.label}>Reason for visit</Text>
        <TextInput value={chiefComplaint} onChangeText={setChiefComplaint} style={styles.input} />
        <TouchableOpacity onPress={bookAppointment} style={styles.button}><Text style={styles.buttonText}>Book appointment</Text></TouchableOpacity>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </View>

      <Text style={styles.sectionTitle}>Your appointments</Text>
      {appointments.length === 0 ? <Text style={styles.empty}>No appointments scheduled.</Text> : appointments.map(appointment => <View key={appointment.id} style={styles.card}>
        <View style={styles.cardHeader}><Text style={styles.cardTitle}>{appointment.doctorName}</Text><Text style={styles.badge}>{appointment.status}</Text></View>
        <Text style={styles.detail}>{appointment.doctorSpecialization}</Text>
        <Text style={styles.detail}>{appointment.date} · {appointment.timeSlot}</Text>
        <Text style={styles.detail}>{appointment.chiefComplaint}</Text>
        <View style={styles.actions}>
          {appointment.status !== 'cancelled' && <TouchableOpacity onPress={() => updateAppointment(appointment.id, 'rescheduled')} style={styles.secondaryButton}><Text style={styles.secondaryText}>Reschedule to form time</Text></TouchableOpacity>}
          {appointment.status !== 'cancelled' && <TouchableOpacity onPress={() => updateAppointment(appointment.id, 'cancelled')} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>}
        </View>
      </View>)}
      <Text style={styles.disclaimer}>{t.demoOnly}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f2' },
  content: { padding: 16, paddingBottom: 30 },
  title: { color: '#183b35', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#72817b', fontSize: 12, marginTop: 4, marginBottom: 16 },
  form: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e9e1', padding: 14, marginBottom: 18 },
  sectionTitle: { color: '#29483f', fontSize: 14, fontWeight: '800', marginBottom: 10, marginTop: 8 },
  label: { color: '#53645e', fontSize: 11, fontWeight: '700', marginBottom: 5, marginTop: 8 },
  doctorRow: { gap: 7 },
  doctorOption: { borderWidth: 1, borderColor: '#dce4df', borderRadius: 8, padding: 10 },
  doctorSelected: { backgroundColor: '#edf4ef', borderColor: '#79aa99' },
  doctorText: { color: '#65736e', fontSize: 11 },
  doctorTextSelected: { color: '#215d50', fontWeight: '800' },
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  input: { minHeight: 40, borderRadius: 8, borderWidth: 1, borderColor: '#dce4df', backgroundColor: '#fcfdfb', color: '#263c36', paddingHorizontal: 10, fontSize: 11 },
  button: { backgroundColor: '#287866', borderRadius: 9, paddingVertical: 12, alignItems: 'center', marginTop: 14 },
  buttonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  notice: { color: '#416d61', fontSize: 11, marginTop: 10, lineHeight: 16 },
  card: { backgroundColor: '#fff', borderRadius: 13, borderWidth: 1, borderColor: '#e5e9e1', padding: 13, marginBottom: 9 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardTitle: { color: '#29483f', fontSize: 12, fontWeight: '800', flexShrink: 1 },
  badge: { color: '#416d61', backgroundColor: '#edf4ef', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 4, fontSize: 9, overflow: 'hidden' },
  detail: { color: '#73817b', fontSize: 10, lineHeight: 15, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 11 },
  secondaryButton: { backgroundColor: '#edf4ef', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  secondaryText: { color: '#416d61', fontSize: 9, fontWeight: '700' },
  cancelButton: { backgroundColor: '#fbf0e9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  cancelText: { color: '#91533f', fontSize: 9, fontWeight: '700' },
  empty: { color: '#7b8983', fontSize: 12, paddingVertical: 15 },
  disclaimer: { color: '#87938e', fontSize: 10, lineHeight: 15, marginTop: 10 }
})