import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../../../src/services/api';

export default function PostularForm() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Aseguramos que el ID sea un string válido para el FormData
  const vacanteId = params.id; 
  const titulo = params.titulo ?? "Vacante";

  const [form, setForm] = useState({
    nombre: '',
    numeroDocumento: '',
    correo: '',
    telefono: '',
    fechaExpedicion: '', 
  });

  const [date, setDate] = useState(new Date());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Debug inicial
  useEffect(() => {
    console.log("📝 Formulario cargado para Vacante ID:", vacanteId);
  }, [vacanteId]);

  const seleccionarArchivo = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (res.canceled) return; 

      const file = res.assets ? res.assets[0] : res;

      setArchivo({
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/pdf",
        size: file.size,
      });
      
    } catch (err) {
      console.log("ERROR SELECTOR:", err);
      Alert.alert("Error", "No se pudo seleccionar el archivo.");
    }
  };

  const enviarPostulacion = async () => {
    console.log("👆 Botón presionado. Validando datos...");

    // Validación. Ahora form.fechaExpedicion debe estar lleno por la corrección en los onChange
    if (!form.nombre || !form.numeroDocumento || !form.fechaExpedicion || !archivo) {
      console.log("❌ Faltan datos", form); 
      Alert.alert("Faltan datos", "Por favor completa todos los campos y adjunta tu CV.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // 2. Construcción de datos
      formData.append("vacanteId", String(vacanteId));
      formData.append("nombre", form.nombre);
      formData.append("numeroDocumento", form.numeroDocumento);
      formData.append("correo", form.correo || "");
      formData.append("telefono", form.telefono || "");
      formData.append("fechaExpedicion", form.fechaExpedicion); 
      
      // 3. Adjuntar archivo (Con lógica de Web/Móvil)
      let fileToUpload;
      
      if (Platform.OS === 'web') {
        // CRÍTICO PARA WEB: Convertir URI a Blob y luego a File
        const response = await fetch(archivo.uri);
        const blob = await response.blob();
        fileToUpload = new File([blob], archivo.name, { type: archivo.type });
        
        formData.append("cv", fileToUpload); 

      } else {
        // MÓVIL: Usa la estructura de objeto de React Native
        fileToUpload = {
          uri: archivo.uri,
          name: archivo.name || `cv_${Date.now()}.pdf`,
          type: archivo.type || "application/pdf",
        };
        formData.append("cv", fileToUpload);
      }

      console.log("🚀 Enviando FormData...");

      const response = await api.post("/postulaciones", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // La línea 'transformRequest' se deja comentada o se borra para evitar conflictos en web/móvil
      });

      console.log("✅ Respuesta:", response.status);

      // 4. Resetear Formulario y forzar navegación (UX)
      setForm({
        nombre: '',
        numeroDocumento: '',
        correo: '',
        telefono: '',
        fechaExpedicion: '', 
      });
      setArchivo(null);
      setFechaSeleccionada(false);

      Alert.alert(
        "¡Postulación Exitosa!",
        `Tu postulación a "${titulo}" ha sido registrada.`,
        [{ text: "OK", onPress: () => router.replace("/(public)/vacantes") }]
      );

    } catch (error) {
      console.error("🔴 Error envío:", error);
      const msg = error.response?.data?.msg || "Error de conexión o servidor.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 50}}>
      <Stack.Screen options={{ title: "Postularse", headerShown: true }} />

      <View style={styles.header}>
        <Text style={styles.info}>Vacante:</Text>
        <Text style={styles.titulo}>{titulo}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          value={form.nombre}
          onChangeText={(t) => setForm({ ...form, nombre: t })}
          placeholder="Nombre completo"
        />

        <Text style={styles.label}>Documento de identidad *</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={form.numeroDocumento}
          onChangeText={(t) => setForm({ ...form, numeroDocumento: t })}
          placeholder="Cédula"
        />

        <Text style={styles.label}>Correo electronico</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          value={form.correo}
          onChangeText={(t) => setForm({ ...form, correo: t })}
          placeholder="ejemplo@correo.com"
        />

        <Text style={styles.label}>Teléfono / celular</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={form.telefono}
          onChangeText={(t) => setForm({ ...form, telefono: t })}
          placeholder="XXX-XXX-XXXX"
        />

        <Text style={styles.label}>Fecha de expedición del documento *</Text>

        {/* Selector de Fecha Híbrido */}
        {Platform.OS === "web" ? (
          <View style={styles.inputWebWrapper}>
            <input type="date"
              value={date.toISOString().split("T")[0]}
              onChange={(e) => {
              const newDate = new Date(e.target.value);
              setForm(prev => ({ ...prev, fechaExpedicion: newDate.toISOString().split("T")[0] })); 
              setDate(newDate);
              setFechaSeleccionada(true);
            }}
              style={{ 
                  width: '100%', padding: 10, borderRadius: 8, 
                  border: '1px solid #cbd5e1', fontFamily: 'system-ui' 
              }}
            />
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowPicker(true)}
            >
              <Ionicons name="calendar" size={20} color="#2563eb" />
              <Text style={{ marginLeft: 8, color: fechaSeleccionada ? '#333' : '#999' }}>
                {fechaSeleccionada
                  ? date.toLocaleDateString()
                  : "Seleccionar fecha"}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(e, d) => {
                  setShowPicker(false);
                  if (d) {
                    setDate(d);
                    setFechaSeleccionada(true);
                    setForm(prev => ({ ...prev, fechaExpedicion: d.toISOString().split("T")[0] }));
                  }
                }}
              />
            )}
          </>
        )}

        <Text style={[styles.label, { marginTop: 15 }]}>Hoja de Vida (PDF) *</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={seleccionarArchivo}>
          <Ionicons
            name={archivo ? "checkmark-circle" : "cloud-upload"}
            size={24}
            color={archivo ? "#10b981" : "#2563eb"}
          />
          <Text style={{ marginLeft: 8, color: archivo ? "#10b981" : "#2563eb", fontWeight: '500' }}>
            {archivo ? archivo.name : "Seleccionar archivo PDF"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submit, loading && { opacity: 0.7 }]}
          onPress={enviarPostulacion}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>ENVIAR POSTULACIÓN</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", flex: 1 },
  header: { padding: 20, backgroundColor: "#f1f5f9", borderBottomWidth: 1, borderColor: '#e2e8f0' },
  info: { fontSize: 12, color: "#64748b", textTransform: 'uppercase', fontWeight: 'bold' },
  titulo: { fontSize: 20, fontWeight: "bold", color: "#0f172a", marginTop: 2 },
  form: { padding: 20 },
  label: { marginTop: 15, fontWeight: "600", color: "#334155", marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8,
    padding: 12, backgroundColor: '#f8fafc', fontSize: 16
  },
  inputWebWrapper: { marginTop: 5 },
  dateBtn: {
    borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8,
    padding: 12, marginTop: 5, flexDirection: "row", alignItems: "center",
    backgroundColor: '#f8fafc'
  },
  uploadBtn: {
    borderWidth: 2, borderColor: "#bfdbfe", borderStyle: "dashed",
    padding: 20, alignItems: "center", borderRadius: 10,
    backgroundColor: "#eff6ff", marginTop: 5,
  },
  submit: {
    marginTop: 30, padding: 16, backgroundColor: "#2563eb",
    borderRadius: 10, alignItems: "center", shadowColor: "#2563eb",
    shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 4
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});