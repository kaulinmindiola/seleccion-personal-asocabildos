import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'session_token';

export const tokenStorage = {
  setItem: async (value) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, value);
        }
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, value);
      }
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  },

  getItem: async () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(TOKEN_KEY);
        }
        return null;
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
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
        }
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error eliminando token:', error);
    }
  },
};