import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { Calendar } from 'react-native-calendars'
import { Picker } from '@react-native-picker/picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { registerUser, loginUser } from './database'
import { Checkbox } from 'react-native-paper'

const Tab = createBottomTabNavigator()

const availableTimes = [
  '12:00',
  '12:15',
  '12:30',
  '12:45',
  '13:00',
  '13:15',
  '13:30',
  '13:45',
  '14:00',
  '14:15',
  '14:30',
  '14:45',
  '15:00',
  '15:15',
  '15:30',
  '15:45',
  '16:00',
  '16:15',
  '16:30',
  '16:45',
  '17:00',
  '17:15',
  '17:30',
  '17:45',
  '18:00',
  '18:15',
  '18:30',
  '18:45',
  '19:00',
  '19:15',
  '19:30',
  '19:45',
  '20:00',
]

const services = ['Corte de cabelo', 'Luzes no cabelo', 'Sobrancelha simples']

function CalendarScreen({
  events,
  selectedDate,
  setSelectedDate,
  addEvent,
  removeEvent,
}) {
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedServices, setSelectedServices] = useState([])

  const handleDatePress = (day) => {
    setSelectedDate(day.dateString)
  }

  const handleAddEvent = () => {
    if (selectedTime && selectedServices.length > 0) {
      const eventDetails =
        selectedServices.length === 1
          ? `${selectedServices[0]} às ${selectedTime}`
          : `${selectedServices.slice(0, -1).join(', ')} e ${
              selectedServices[selectedServices.length - 1]
            } às ${selectedTime}`

      addEvent(selectedDate, eventDetails)
      setSelectedTime('')
      setSelectedServices([])
    } else {
      Alert.alert('Erro', 'Selecione um horário e pelo menos um serviço.')
    }
  }

  const toggleServiceSelection = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    )
  }

  return (
    <View style={styles.container}>
      <Calendar
  onDayPress={handleDatePress}
  theme={{
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    textSectionTitleColor: '#b6c1cd',
    selectedDayBackgroundColor: '#00adf5',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#00adf5',
    dayTextColor: '#2d4150',
    textDisabledColor: '#d9e1e8',
    dotColor: '#00adf5',
    selectedDotColor: '#ffffff',
    arrowColor: 'orange',
    monthTextColor: 'blue',
    indicatorColor: 'blue',
    textDayFontFamily: 'monospace',
    textMonthFontFamily: 'monospace',
    textDayHeaderFontFamily: 'monospace',
    textDayFontWeight: '300',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '300',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 16
  }}
/>
      {selectedDate ? (
        <View style={styles.eventContainer}>
          <Text style={styles.eventDate}>Eventos em {selectedDate}:</Text>
          {events[selectedDate]?.map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventText}>• {event}</Text>
              <TouchableOpacity
                onPress={() => removeEvent(selectedDate, index)}
                style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Desmarcar</Text>
              </TouchableOpacity>
            </View>
          ))}

          <Text style={styles.label}>Selecione o horário:</Text>
          <Picker
            selectedValue={selectedTime}
            onValueChange={(itemValue) => setSelectedTime(itemValue)}
            style={styles.picker}>
            <Picker.Item label="Escolha o horário" value="" />
            {availableTimes.map((time) => (
              <Picker.Item key={time} label={time} value={time} />
            ))}
          </Picker>

          <Text style={styles.label}>Selecione o(s) serviço(s):</Text>
          {services.map((service) => (
            <View key={service} style={styles.checkboxContainer}>
              <Checkbox
                status={
                  selectedServices.includes(service) ? 'checked' : 'unchecked'
                }
                onPress={() => toggleServiceSelection(service)}
              />
              <Text style={styles.checkboxLabel}>{service}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.button} onPress={handleAddEvent}>
            <Text style={styles.buttonText}>Salvar Evento</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.infoText}>
          Selecione uma data para agendar um evento.
        </Text>
      )}
    </View>
  )
}

function ScheduledEventsScreen({ events, handleLogout }) {
  return (
    <View style={[styles.container, { justifyContent: 'space-between' }]}>
      <ScrollView>
        <Text style={styles.title}>Horários Agendados</Text>
        {Object.keys(events).length > 0 ? (
          Object.entries(events).map(([date, eventList]) => (
            <View key={date} style={styles.eventContainer}>
              <Text style={styles.eventDate}>Eventos em {date}:</Text>
              {eventList.map((event, index) => (
                <Text key={index} style={styles.eventText}>
                  • {event}
                </Text>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.infoText}>Nenhum evento agendado.</Text>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [events, setEvents] = useState({})

  useEffect(() => {
    const loadEvents = async () => {
      const storedEvents = await AsyncStorage.getItem(username)
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents))
      }
    }

    if (isAuthenticated) {
      loadEvents()
    }
  }, [isAuthenticated, username])

  const handleLogin = async () => {
    const success = await loginUser(username, password)
    if (success) {
      setIsAuthenticated(true)
      Alert.alert('Sucesso', 'Login realizado com sucesso!')
    } else {
      Alert.alert('Erro', 'Usuário ou senha incorretos.')
    }
  }

  const handleRegister = async () => {
    if (name && username && password) {
      const success = await registerUser(username, password, name)
      if (success) {
        Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!')
        setIsRegistering(false)
      } else {
        Alert.alert('Erro', 'Erro ao cadastrar usuário.')
      }
    } else {
      Alert.alert('Erro', 'Preencha todos os campos.')
    }
  }

  const addEvent = async (date, event) => {
    const updatedEvents = {
      ...events,
      [date]: [...(events[date] || []), event],
    }
    setEvents(updatedEvents)
    await AsyncStorage.setItem(username, JSON.stringify(updatedEvents))
  }

  const removeEvent = async (date, index) => {
    const updatedEvents = { ...events }
    updatedEvents[date].splice(index, 1)
    if (updatedEvents[date].length === 0) {
      delete updatedEvents[date]
    }
    setEvents(updatedEvents)
    await AsyncStorage.setItem(username, JSON.stringify(updatedEvents))
  }

  const handleLogout = async () => {
    setIsAuthenticated(false)
    setUsername('')
    setPassword('')
    setEvents({})
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{isRegistering ? 'Cadastro' : 'Login'}</Text>
        {isRegistering && (
          <TextInput
            placeholder="Nome"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        )}
        <TextInput
          placeholder="Usuário"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          placeholder="Senha"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.button}
          onPress={isRegistering ? handleRegister : handleLogin}>
          <Text style={styles.buttonText}>
            {isRegistering ? 'Cadastrar' : 'Entrar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={styles.switchText}>
            {isRegistering
              ? 'Já tem uma conta? Entrar'
              : 'Ainda não tem uma conta? Cadastrar'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Agenda"
          children={() => (
            <CalendarScreen
              events={events}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              addEvent={addEvent}
              removeEvent={removeEvent}
            />
          )}
        />
        <Tab.Screen
          name="Meus Agendamentos"
          children={() => (
            <ScheduledEventsScreen
              events={events}
              handleLogout={handleLogout}
            />
          )}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6b52ae',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: '#6b52ae',
    borderRadius: 5,
    paddingVertical: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  eventContainer: { marginTop: 20 },
  eventDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  eventText: { fontSize: 16, color: '#333' },
  removeButton: { paddingHorizontal: 10 },
  removeButtonText: { color: 'red', fontSize: 14 },
  infoText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    flexWrap: 'wrap',
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 10,
    flexShrink: 1,
    maxWidth: '80%',
  },
  label: { fontSize: 16, marginBottom: 10, color: '#333' },
  logoutButton: {
    alignSelf: 'center',
    width: '90%',
    padding: 15,
    backgroundColor: '#6b52ae',
    borderRadius: 5,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
})
