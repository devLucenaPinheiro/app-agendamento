import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

const registerUser = async (username, password) => {
  try {
    const userData = JSON.stringify({ username, password });
    await AsyncStorage.setItem(`user-${username}`, userData);
    console.log('Usuário registrado com sucesso!');
    return true;
  } catch (error) {
    console.log('Erro ao registrar usuário:', error);
    return false;
  }
};

const loginUser = async (username, password) => {
  try {
    const userData = await AsyncStorage.getItem(`user-${username}`);
    if (!userData) {
      console.log('Usuário não encontrado');
      return false;
    }

    const user = JSON.parse(userData);
    console.log('Usuário encontrado:', user);
    return user.password === password;
  } catch (error) {
    console.log('Erro ao fazer login:', error);
    return false;
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState({});
  const [newEvent, setNewEvent] = useState('');

  const handleLogin = async () => {
    const success = await loginUser(username, password);
    if (success) {
      setIsAuthenticated(true);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
    } else {
      Alert.alert('Erro', 'Usuário ou senha incorretos.');
    }
  };

  const handleRegister = async () => {
    const success = await registerUser(username, password);
    if (success) {
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
    } else {
      Alert.alert('Erro', 'Erro ao cadastrar usuário.');
    }
  };

  const handleDatePress = day => {
    setSelectedDate(day.dateString);
  };

  const addEvent = () => {
    if (newEvent) {
      setEvents({
        ...events,
        [selectedDate]: [...(events[selectedDate] || []), newEvent],
      });
      setNewEvent('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Login
        </Text>
        <TextInput
          placeholder="Usuário"
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
        <Button title="Cadastrar" onPress={handleRegister} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Calendar onDayPress={handleDatePress} />
      {selectedDate ? (
        <View style={{ marginTop: 20 }}>
          <Text>Eventos em {selectedDate}:</Text>
          {events[selectedDate]?.map((event, index) => (
            <Text key={index}>• {event}</Text>
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

      {/* Botão de Logout no canto inferior esquerdo */}
      <View style={styles.logoutButtonContainer}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoutButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
});
