import React, { useState } from 'react'
import { View, Text, TextInput, Button, Linking } from 'react-native'
import { Calendar } from 'react-native-calendars'

export default function App() {
  const [selectedDate, setSelectedDate] = useState('')
  const [events, setEvents] = useState({})
  const [newEvent, setNewEvent] = useState('')

  const handleDatePress = (day) => {
    setSelectedDate(day.dateString)
  }

  const addEvent = () => {
    if (newEvent) {
      setEvents({
        ...events,
        [selectedDate]: [...(events[selectedDate] || []), newEvent]
      })
      setNewEvent('')
    }
  }

  const sendMessageOnWhatsApp = () => {
    const message = `Olá, gostaria de agendar um evento para a data ${selectedDate}.`
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`

    Linking.openURL(url).catch(() =>
      alert("Por favor, instale o WhatsApp para usar essa funcionalidade.")
    )
  }

  return (
    <View style={{ padding: 20 }}>
      <Calendar onDayPress={handleDatePress} />

      <Button
        title="mande mensagem no WhatsApp para agendar!"
        onPress={sendMessageOnWhatsApp}
      />

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
    </View>
  )
}
