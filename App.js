import React, { useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, ScrollView} from 'react-native'
import { Calendar } from 'react-native-calendars'
import { Picker } from '@react-native-picker/picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { registerUser, loginUser } from './database'

const Tab = createBottomTabNavigator()

const availableTimes = [
  '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45',
  '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00'
]

const services = ['Corte de cabelo', 'Luzes no cabelo', 'Sobrancelha simples']

function CalendarScreen({ events, selectedDate, setSelectedDate, newEvent, setNewEvent, addEvent, removeEvent }) {
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedService, setSelectedService] = useState('')

  const handleDatePress = (day) => {
    setSelectedDate(day.dateString)
  }

 const handleAddEvent = () => {
  if (selectedTime && selectedService) {
    addEvent(selectedDate, `${selectedService} às ${selectedTime}`)
    setSelectedTime('')
    setSelectedService('')
  } else {
    Alert.alert('Erro', 'Selecione um horário e um serviço.')
  }
}

  return (
    <View style={styles.container}>
      <Calendar onDayPress={handleDatePress} theme={calendarTheme} />
      {selectedDate ? (
        <View style={styles.eventContainer}>
          <Text style={styles.eventDate}>Eventos em {selectedDate}:</Text>
          {events[selectedDate]?.map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventText}>• {event}</Text>
              <TouchableOpacity onPress={() => removeEvent(index)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Desmarcar</Text>
              </TouchableOpacity>
            </View>
          ))}
          <Text style={styles.label}>Selecione o horário:</Text>
          <Picker
            selectedValue={selectedTime}
            onValueChange={(itemValue) => setSelectedTime(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Escolha o horário" value="" />
            {availableTimes.map((time) => (
              <Picker.Item key={time} label={time} value={time} />
            ))}
          </Picker>
          <Text style={styles.label}>Selecione o serviço:</Text>
          <Picker
            selectedValue={selectedService}
            onValueChange={(itemValue) => setSelectedService(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Escolha o serviço" value="" />
            {services.map((service) => (
              <Picker.Item key={service} label={service} value={service} />
            ))}
          </Picker>

          <TouchableOpacity style={styles.button} onPress={handleAddEvent}>
            <Text style={styles.buttonText}>Salvar Evento</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.infoText}>Selecione uma data para agendar um evento.</Text>
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
                <Text key={index} style={styles.eventText}>• {event}</Text>
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

   const addEvent = (date, event) => {
    setEvents({
      ...events,
      [date]: [...(events[date] || []), event],
    })
  }

  const removeEvent = (index) => {
    const updatedEvents = events[selectedDate].filter((_, i) => i !== index)
    setEvents({
      ...events,
      [selectedDate]: updatedEvents,
    })
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{isRegistering ? 'Cadastro' : 'Login'}</Text>
        {isRegistering && (
          <TextInput
            placeholder="Nome"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        )}
        <TextInput
          placeholder="Nome de Usuário"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={isRegistering ? handleRegister : handleLogin}>
          <Text style={styles.buttonText}>{isRegistering ? 'Cadastrar' : 'Entrar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={styles.linkText}>{isRegistering ? 'Já tem uma conta? Login' : 'Não tem uma conta? Cadastre-se'}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Calendário">
  {() => (
    <CalendarScreen
      events={events}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}

      addEvent={addEvent}
      removeEvent={removeEvent}
      handleLogout={handleLogout}
    />
  )}
</Tab.Screen>

        <Tab.Screen name="Horários Agendados">
          {() => <ScheduledEventsScreen events={events} handleLogout={handleLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  )
}

const calendarTheme = {
  selectedDayBackgroundColor: '#6b52ae',
  todayTextColor: '#6b52ae',
  arrowColor: '#6b52ae',
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#6b52ae',
    textAlign: 'center',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  eventContainer: {
    marginTop: 20,
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
  eventText: {
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    paddingHorizontal: 10,
  },
  removeButtonText: {
    color: 'red',
    fontSize: 14,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
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
