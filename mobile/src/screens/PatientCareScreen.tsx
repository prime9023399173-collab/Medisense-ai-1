import React, { useContext, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { MobileLanguageContext, mobileText } from '../i18n'
import { AppointmentsScreen } from './AppointmentsScreen'
import { ClaimsScreen } from './ClaimsScreen'

export const PatientCareScreen = ({ route }: any) => {
  const [section, setSection] = useState<'appointments' | 'claims'>('appointments')
  const { language } = useContext(MobileLanguageContext)
  const t = mobileText[language]

  return (
    <View style={styles.container}>
      <View style={styles.switcher}>
        <TouchableOpacity onPress={() => setSection('appointments')} style={[styles.option, section === 'appointments' && styles.activeOption]}>
          <Text style={[styles.optionText, section === 'appointments' && styles.activeText]}>{t.appointments}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSection('claims')} style={[styles.option, section === 'claims' && styles.activeOption]}>
          <Text style={[styles.optionText, section === 'claims' && styles.activeOptionText]}>{t.claims}</Text>
        </TouchableOpacity>
      </View>
      {section === 'appointments' ? <AppointmentsScreen route={route} /> : <ClaimsScreen route={route} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f2' },
  switcher: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e9e1', paddingHorizontal: 10, paddingVertical: 7 },
  option: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 8 },
  activeOption: { backgroundColor: '#e8f2ed' },
  optionText: { color: '#72817b', fontSize: 11, fontWeight: '700' },
  activeOptionText: { color: '#215d50' },
  activeText: { color: '#215d50' }
})