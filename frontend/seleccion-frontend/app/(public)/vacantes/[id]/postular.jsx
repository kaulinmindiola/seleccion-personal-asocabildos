import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../../../src/services/api';

export default function PostularForm() {
  const { id, titulo } = useLocalSearchParams();
  const router = useRouter();
  
  const [form, setForm] = useState({
    nombre: '',
    numeroDocumento: '',
    correo: '',
    fechaExpedicion: '', // YYYY-MM-DD
  });
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);

  const seleccionarArchivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword'], // Solo PDF o Word
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setArchivo(result.assets[0]);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  };

  const enviarPostulacion = async () => {
    if (!form.nombre || !form.numeroDocumento || !form.fechaExpedicion || !archivo) {
      Alert.alert("Faltan datos", "Por favor completa todos los campos y adjunta tu CV.");
      return;
    }

    setLoading(true);
    try {
      // Crear FormData para envío de archivo
      const formData = new FormData();
      formData.append('vacanteId', id);
      formData.append('nombre', form.nombre);
      formData.append('numeroDocumento', form.numeroDocumento);
      formData.append('correo', form.correo);
      formData.append('fechaExpedicion', form.fechaExpedicion);
      
      // Adjuntar archivo (React Native requiere uri, name y type)
      formData.append('cv', {
        uri: archivo.uri,
        name: archivo.name,
        type: archivo.mimeType || 'application/pdf',
      });

      // Nota: Axios en React Native a veces requiere header especial para multipart
      await api.post('/postulaciones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert("¡Éxito!", "Tu postulación ha sido enviada correctamente.", [
        { text: "OK", onPress: () => router.replace('/(public)/vacantes') }
      ]);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo enviar la postulación. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ title: 'Enviar Postulación', headerStyle: { backgroundColor: '#2563eb' }, headerTintColor: '#fff' }} 
      />

      <View style={styles.header}>
        <Text style={styles.labelVacante}>Aplicando a:</Text>
        <Text style={styles.tituloVacante}>{titulo}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre Completo *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej. Juan Pérez" 
          value={form.nombre}
          onChangeText={(t) => setForm({...form, nombre: t})}
        />

        <Text style={styles.label}>Número de Documento *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej. 12345678" 
          keyboardType="numeric"
          value={form.numeroDocumento}
          onChangeText={(t) => setForm({...form, numeroDocumento: t})}
        />

        <Text style={styles.label}>Correo Electrónico (Opcional)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="juan@email.com" 
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.correo}
          onChangeText={(t) => setForm({...form, correo: t})}
        />

        <Text style={styles.label}>Fecha Expedición Doc. (AAAA-MM-DD) *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="2020-01-30" 
          value={form.fechaExpedicion}
          onChangeText={(t) => setForm({...form, fechaExpedicion: t})}
        />

        {/* Selector de Archivo */}
        <Text style={styles.label}>Hoja de Vida (PDF) *</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={seleccionarArchivo}>
          <Ionicons name={archivo ? "checkmark-circle" : "cloud-upload"} size={24} color={archivo ? "#10b981" : "#2563eb"} />
          <Text style={[styles.uploadText, archivo && { color: '#10b981' }]}>
            {archivo ? archivo.name : "Seleccionar Archivo"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
          onPress={enviarPostulacion}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>ENVIAR POSTULACIÓN</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#f8fafc', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  labelVacante: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' },
  tituloVacante: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f8fafc' },
  uploadBtn: { 
    borderWidth: 2, borderColor: '#bfdbfe', borderStyle: 'dashed', borderRadius: 10, 
    padding: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', marginTop: 5 
  },
  uploadText: { color: '#2563eb', fontWeight: '600', marginTop: 5 },
  submitBtn: { 
    backgroundColor: '#2563eb', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 30, 
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 
  },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});