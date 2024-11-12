import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native'
import { Calendar } from 'react-native-calendars'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { registerUser, loginUser } from './database'

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

  const handleDatePress = (day) => {
    setSelectedDate(day.dateString)
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
    if (isRegistering) {
      return (
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
            Cadastro
          </Text>
          <TextInput
            placeholder="Nome"
            value={name}
            onChangeText={setName}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <TextInput
            placeholder="Nome de Usuário"
            value={username}
            onChangeText={setUsername}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <TextInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ borderBottomWidth: 1, marginBottom: 20 }}
          />
          <Button title="Cadastrar" onPress={handleRegister} />
          <TouchableOpacity onPress={() => setIsRegistering(false)}>
            <Text style={{ color: 'blue', marginTop: 10 }}>Já tem uma conta? Login</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Login
        </Text>
        <TextInput
          placeholder="Nome de Usuário"
          value={username}
          onChangeText={setUsername}
          style={{ borderBottomWidth: 1, marginBottom: 10 }}
        />
        <TextInput
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ borderBottomWidth: 1, marginBottom: 20 }}
        />
        <Button title="Entrar" onPress={handleLogin} />
        <TouchableOpacity onPress={() => setIsRegistering(true)}>
          <Text style={{ color: 'blue', marginTop: 10 }}>Não tem uma conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Calendar onDayPress={handleDatePress} />
      {selectedDate ? (
        <View style={{ marginTop: 20 }}>
          <Text>Eventos em {selectedDate}:</Text>
          {events[selectedDate]?.map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text>• {event}</Text>
              <TouchableOpacity onPress={() => removeEvent(index)} style={styles.removeButton}>
                <Text style={{ color: 'red' }}>Desmarcar</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TextInput
            placeholder="Adicionar evento"
            value={newEvent}
            onChangeText={setNewEvent}
            style={{ borderBottomWidth: 1, marginVertical: 10 }}
          />
          <Button title="Salvar Evento" onPress={addEvent} />
        </View>
      ) : (
        <Text>Selecione uma data para agendar um evento.</Text>
      )}

      <View style={styles.logoutButtonContainer}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  logoutButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  removeButton: {
    paddingHorizontal: 10,
  },
})
