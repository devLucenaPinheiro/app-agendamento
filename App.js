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
import { FlatList } from 'react-native'
import {Linking} from 'react-native'
import CryptoJS from 'crypto-js'

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

const serviceDurations = {
  'Corte de cabelo (30 min)': 30,
  'Luzes no cabelo (90 min)': 90,
  'Sobrancelha simples (15 min)': 15,
}

const services = Object.keys(serviceDurations)

function CalendarScreen({
  events,
  selectedDate,
  setSelectedDate,
  addEvent,
  removeEvent,
}) {
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedServices, setSelectedServices] = useState([])
  const [unavailableTimesByDate, setUnavailableTimesByDate] = useState({})

  const isBlockedDay = (day) => {
    const date = new Date(day.dateString)
    const dayOfWeek = date.getUTCDay()
    return dayOfWeek === 0 || dayOfWeek === 1
  }
  const handleDatePress = (day) => {
    if (isBlockedDay(day)) {
      Alert.alert('Indisponível', 'Agendamentos não são permitidos aos domingos e segundas-feiras.')
    } else {
      setSelectedDate(day.dateString)
    }
  }

  const calculateTotalDuration = () => {
    return selectedServices.reduce((total, service) => {
      return total + (serviceDurations[service] || 0)
    }, 0)
  }

const openWhatsApp = () => {
    const message = 'Olá, acabei de agendar meu horario'
    const phoneNumber = '+5521994872058'
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`

    Linking.openURL(url)
      .catch((err) => console.error('Erro ao abrir o WhatsApp: ', err))
  }

  const blockTimesForDuration = (startTime, duration) => {
    const blockedTimes = []
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const totalMinutes = startHour * 60 + startMinute + duration

    for (let time of availableTimes) {
      const [hour, minute] = time.split(':').map(Number)
      const currentMinutes = hour * 60 + minute
      if (
        currentMinutes >= startHour * 60 + startMinute &&
        currentMinutes < totalMinutes
      ) {
        blockedTimes.push(time)
      }
    }
    return blockedTimes
  }

  const handleAddEvent = () => {
    if (selectedTime && selectedServices.length > 0) {
      const duration = calculateTotalDuration()
      const blockedTimes = blockTimesForDuration(selectedTime, duration)

      // Atualiza os horários bloqueados para a data selecionada
      setUnavailableTimesByDate((prev) => {
        const updatedUnavailableTimes = { ...prev }
        updatedUnavailableTimes[selectedDate] = [
          ...(updatedUnavailableTimes[selectedDate] || []),
          ...blockedTimes,
        ]
        return updatedUnavailableTimes
      })

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
          textDayHeaderFontSize: 16,
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
            {availableTimes
              .filter(
                (time) =>
                  !(
                    unavailableTimesByDate[selectedDate] &&
                    unavailableTimesByDate[selectedDate].includes(time)
                  )
              )
              .map((time) => (
                <Picker.Item key={time} label={time} value={time} />
              ))}
          </Picker>

          <Text style={styles.label}>Selecione o(s) serviço(s):</Text>
          {services.map((service) => (
            <View key={service} style={styles.checkboxContainer}>
              <Checkbox
                status={selectedServices.includes(service) ? 'checked' : 'unchecked'}
                onPress={() => toggleServiceSelection(service)}
              />
              <Text style={styles.checkboxLabel}>{service}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.button} onPress={handleAddEvent}>
            <Text style={styles.buttonText}>Agendar</Text>
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
  // Transforma o objeto de eventos em um array de eventos com data e lista de agendamentos
  const eventsArray = Object.entries(events).map(([date, eventList]) => ({
    date,
    eventList,
  }))
    const openWhatsApp = () => {
    const message = 'Olá, acabei de agendar meu horario'
    const phoneNumber = '+552199487-2058'
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`

    Linking.openURL(url)
      .catch((err) => console.error('Erro ao abrir o WhatsApp: ', err))
  }
  return (
    <View style={[styles.container, { justifyContent: 'space-between' }]}>
      <ScrollView>
        <Text style={styles.title}>Horários Agendados</Text>
        {eventsArray.length > 0 ? (
          <FlatList
            data={eventsArray}
            keyExtractor={(item) => item.date}
            renderItem={({ item }) => (
              <View style={styles.eventContainer}>
                <Text style={styles.eventDate}>Eventos em {item.date}:</Text>
                {item.eventList.map((event, index) => (
                  <Text key={index} style={styles.eventText}>
                    • {event}
                  </Text>
                ))}
              </View>
            )}
          />
        ) : (
          <Text style={styles.infoText}>Nenhum evento agendado.</Text>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
       <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
        <Text style={styles.whatsappButtonText}>Fale Conosco no WhatsApp</Text>
      </TouchableOpacity>
    </View>
  )
}

const handleEncryptPassword = () => {
  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString()
  const hash = CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: 1000 }).toString()
  setStoredHash(hash)
  Alert.alert('Senha criptografada com PBKDF2', `Hash: ${hash}`)
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [userGreeting, setUserGreeting] = useState('')
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

      // Carregar nome do usuário do AsyncStorage para exibir no cumprimento
      const storedName = await AsyncStorage.getItem(`${username}_name`)
      setUserGreeting(storedName || '') // Se não houver nome, deixa o cumprimento vazio

      Alert.alert('Sucesso', 'Login realizado com sucesso!')
    } else {
      Alert.alert('Erro', 'Usuário ou senha incorretos.')
    }
  }

    const handleRegister = async () => {
    if (name && username && password) {
      const success = await registerUser(username, password, name)
      if (success) {
        // Armazenar o nome do usuário para usar mais tarde no cumprimento
        await AsyncStorage.setItem(`${username}_name`, name)

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
    setUserGreeting('')
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
      <Tab.Navigator
        screenOptions={{
          headerTitle: () => (
            <Text style={styles.greetingText}>
              {userGreeting ? `Olá, ${userGreeting}!` : 'Bem-vindo!'}
            </Text>
          ),
        }}>
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
  greetingText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginLeft: 15,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    eventContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
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
  eventText: { fontSize: 9, color: '#333' },
  removeButton: { paddingHorizontal: 8},
  removeButtonText: { color: 'red', fontSize: 12},
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
   whatsappButton: {
    alignSelf: 'center',
    width: '90%',
    padding: 15,
    backgroundColor: '#25D366', 
    borderRadius: 5,
    marginTop: 20,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
})
