import AsyncStorage from '@react-native-async-storage/async-storage'

export const registerUser = async (username, password) => {
  try {
    const userData = JSON.stringify({ username, password })
    await AsyncStorage.setItem(`user-${username}`, userData)
    return true
  } catch (error) {
    console.log('Erro ao registrar usuário:', error)
    return false
  }
}

export const loginUser = async (username, password) => {
  try {
    const userData = await AsyncStorage.getItem(`user-${username}`)
    if (!userData) return false

    const user = JSON.parse(userData)
    return user.password === password
  } catch (error) {
    console.log('Erro ao fazer login:', error)
    return false
  }
}
