import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Clave constante para evitar errores de dedo
const TOKEN_KEY = 'session_token';

export const tokenStorage = {
  setItem: async (value) => {
    try {
      if (Platform.OS === 'web') {
        // En web usamos localStorage
        localStorage.setItem(TOKEN_KEY, value);
      } else {
        // En móvil usamos almacenamiento seguro encriptado
        await SecureStore.setItemAsync(TOKEN_KEY, value);
      }
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  },

  getItem: async () => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY);
      } else {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  },

  removeItem: async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error eliminando token:', error);
    }
  },
};