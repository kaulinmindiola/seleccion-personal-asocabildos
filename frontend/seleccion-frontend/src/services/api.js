import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importante

// TU IP REAL (Verifica que sea la correcta de tu PC)
const IP = '192.168.101.5'; 

const getBaseUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:4000/api';
  return `http://${IP}:4000/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ ACTIVAMOS EL INTERCEPTOR (Esto faltaba)
api.interceptors.request.use(async (config) => {
  try {
    // Buscamos el token que guardaste en el Login
    const token = await AsyncStorage.getItem('auth_token');
    
    if (token) {
      // Se lo pegamos a la petición
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error leyendo token en interceptor", error);
  }
  return config;
});

export default api;