import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import api from '../services/api';
import { Alert } from 'react-native';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userJson = await AsyncStorage.getItem('user_session');
      
      if (token && userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (e) {
      console.log('Error restaurando sesión', e);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (numeroDocumento, password) => {
    try {
      console.log("🔵 Iniciando login seguro...");
      
      const response = await api.post('/auth/login', { numeroDocumento, password });
      
      // Asumimos que tu backend devuelve { token: "...", user: {...} }
      // (Revisa tu auth.controller.js si tienes dudas, pero suele ser así)
      const { token, user: usuarioBackend } = response.data;

      if (!token) throw new Error("El servidor no envió el token");

      if (usuarioBackend.rol === 'ADMIN' || usuarioBackend.rol === 'RRHH') {
        
        // GUARDAMOS AMBOS: TOKEN Y USUARIO
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('user_session', JSON.stringify(usuarioBackend));
        
        setUser(usuarioBackend);
        router.replace('/dashboard');
        
      } else {
        Alert.alert("Acceso Denegado", "Rol no autorizado.");
        await signOut();
      }

    } catch (error) {
      console.error("🔴 Error Login:", error);
      const msg = error.response?.data?.msg || "Error de autenticación";
      Alert.alert("Error", msg);
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_session');
    setUser(null);
    router.replace('/(public)/vacantes');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};