import React, { useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

import { HomeScreen } from './src/screens/HomeScreen'
import { MedicineScreen } from './src/screens/MedicineScreen'
import { AIDoctorScreen } from './src/screens/AIDoctorScreen'
import { SOSScreen } from './src/screens/SOSScreen'
import { HealthVaultScreen } from './src/screens/HealthVaultScreen'
import { MobileAuthScreen } from './src/screens/MobileAuthScreen'
import { PatientCareScreen } from './src/screens/PatientCareScreen'
import { DoctorScreen } from './src/screens/DoctorScreen'
import { InsuranceScreen } from './src/screens/InsuranceScreen'
import { FamilyScreen } from './src/screens/FamilyScreen'
import { MobileLanguageContext, MobileLanguage } from './src/i18n'
import { setMobileAuthToken } from './src/services/api'

const Tab = createBottomTabNavigator()

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [language, setLanguage] = useState<MobileLanguage>('en')

  if (!session) {
    return <MobileAuthScreen onAuthenticated={setSession} />
  }

  const role = session.user.role
  const patientId = session.patientProfile?.id || 1

  return (
    <NavigationContainer>
      <MobileLanguageContext.Provider value={{ language, setLanguage }}>
        <StatusBar style="dark" />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f2' }}>
          <View style={{ minHeight: 54, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e9e1' }}>
            <View>
              <Text style={{ color: '#183b35', fontSize: 16, fontWeight: '700' }}>Medisense AI</Text>
              <Text style={{ color: '#6b7b76', fontSize: 10 }}>{session.user.name} · {role}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              {(['en', 'hi', 'mr'] as const).map(item => <TouchableOpacity key={item} onPress={() => setLanguage(item)} style={{ paddingHorizontal: 6, paddingVertical: 5, borderRadius: 6, backgroundColor: language === item ? '#e8f2ed' : 'transparent' }}><Text style={{ color: language === item ? '#215d50' : '#73817b', fontSize: 9, fontWeight: '700' }}>{item.toUpperCase()}</Text></TouchableOpacity>)}
              <TouchableOpacity onPress={() => { setMobileAuthToken(null); setSession(null) }} style={{ marginLeft: 4 }}>
                <Text style={{ color: '#47756a', fontSize: 11, fontWeight: '700' }}>Sign out</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopColor: '#e5e9e1',
              height: 64,
              paddingBottom: 8,
              paddingTop: 8
            },
            tabBarActiveTintColor: '#287866',
            tabBarInactiveTintColor: '#82908b'
          }}
        >
          {role === 'patient' && (
            <>
              <Tab.Screen name="Home" component={HomeScreen} initialParams={{ patientId }} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⌂</Text> }} />
              <Tab.Screen name="Medicine" component={MedicineScreen} initialParams={{ patientId }} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>Rx</Text> }} />
              <Tab.Screen name="Care" component={PatientCareScreen} initialParams={{ patientId }} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 17, color }}>▤</Text> }} />
              <Tab.Screen name="Emergency" component={SOSScreen} initialParams={{ patientId }} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>SOS</Text> }} />
              <Tab.Screen name="AI Doctor" component={AIDoctorScreen} initialParams={{ patientId }} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 17, color }}>AI</Text> }} />
              <Tab.Screen name="Family" component={FamilyScreen} initialParams={{ patientId }} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>♡</Text> }} />
              <Tab.Screen name="Vault" component={HealthVaultScreen} initialParams={{ patientId }} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 17, color }}>▣</Text> }} />
            </>
          )}
          {role === 'doctor' && <Tab.Screen name="Doctor Desk" component={DoctorScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>MD</Text> }} />}
          {role === 'insurance' && <Tab.Screen name="Insurance" component={InsuranceScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>▤</Text> }} />}
          </Tab.Navigator>
        </SafeAreaView>
      </MobileLanguageContext.Provider>
    </NavigationContainer>
  )
}
