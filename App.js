import React, { useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Calendar } from 'react-native-calendars'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { registerUser, loginUser } from './database'

const Tab = createBottomTabNavigator()

function CalendarScreen({ events, selectedDate, setSelectedDate, newEvent, setNewEvent, addEvent, removeEvent }) {
  const handleDatePress = (day) => {
    setSelectedDate(day.dateString)
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
          <TextInput
            placeholder="Adicionar evento"
            value={newEvent}
            onChangeText={setNewEvent}
            style={styles.input}
          />
          <TouchableOpacity style={styles.button} onPress={addEvent}>
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
  const [newEvent, setNewEvent] = useState('')

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

  const addEvent = () => {
    if (newEvent) {
      setEvents({
        ...events,
        [selectedDate]: [...(events[selectedDate] || []), newEvent],
      })
      setNewEvent('')
    }
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
              newEvent={newEvent}
              setNewEvent={setNewEvent}
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
