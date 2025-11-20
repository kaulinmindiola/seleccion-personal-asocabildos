import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext'; 
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  
  const [doc, setDoc] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!doc || !pass) {
      Alert.alert('Campos incompletos', 'Por favor ingresa tu número de documento y contraseña');
      return;
    }

    setLoading(true);
    try {
      // Llama a tu endpoint /api/auth/login
      // AuthContext se encarga de guardar el token y redirigir
      await signIn(doc, pass);
      
    } catch (error) {
      console.error("Error Login:", error);
      // Manejo de errores basado en tu backend
      const msg = error.response?.data?.msg || 'Credenciales incorrectas o error de servidor';
      Alert.alert('Acceso Denegado', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="close" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="business" size={40} color="#2563eb" />
          </View>
          <Text style={styles.title}>Portal Administrativo</Text>
          <Text style={styles.subtitle}>Ingresa con tus credenciales de RRHH o Admin</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Documento</Text>
            <TextInput 
              style={styles.input}
              placeholder="Ej. 12345"
              keyboardType="numeric"
              value={doc}
              onChangeText={setDoc}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passWrapper}>
              <TextInput 
                style={styles.inputPass}
                placeholder="••••••"
                secureTextEntry={!showPass}
                value={pass}
                onChangeText={setPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.loginBtn, loading && styles.disabledBtn]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginText}>Ingresar al Sistema</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 5 },
  content: { flex: 1, justifyContent: 'center', padding: 30 },
  
  header: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#eff6ff', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 15 
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 5 },

  form: { width: '100%' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { 
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', 
    borderRadius: 8, padding: 14, fontSize: 16 
  },
  passWrapper: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', 
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 
  },
  inputPass: { flex: 1, padding: 14, fontSize: 16 },
  eyeBtn: { padding: 14 },

  loginBtn: { 
    backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 8, 
    alignItems: 'center', marginTop: 10, elevation: 2 
  },
  disabledBtn: { opacity: 0.7 },
  loginText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});