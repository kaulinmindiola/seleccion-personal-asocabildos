import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ✅ CORRECCIÓN: El componente InputField debe estar AFUERA para no perder el foco
const InputField = ({ label, value, onChangeText, error, placeholder, multiline = false, keyboardType = 'default' }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label} <Text style={styles.req}>*</Text></Text>
    <TextInput
      style={[
        styles.input, 
        multiline && styles.textArea,
        error && styles.inputError
      ]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      textAlignVertical={multiline ? 'top' : 'center'}
      keyboardType={keyboardType}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

export default function VacanteForm({ initialValues, onSubmit, loading, isEditing }) {
  const router = useRouter();
  
  const [form, setForm] = useState({
    titulo: '',
    area: '',
    descripcion: '',
    requisitos: '',
    estado: 'ABIERTA',
    fechaCierre: '',
    ...initialValues 
  });

  const [errors, setErrors] = useState({});

  // Función helper para actualizar el formulario limpiamente
  const handleChange = (field, text) => {
    setForm(prev => ({ ...prev, [field]: text }));
    // Si había error en este campo, lo limpiamos al escribir
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    let newErrors = {};
    
    if (!form.titulo || form.titulo.trim().length < 3) 
      newErrors.titulo = "El título es obligatorio (min 3 caracteres).";
    
    if (!form.area || form.area.trim().length < 2) 
      newErrors.area = "Indica el área de la vacante.";
    
    if (!form.descripcion || form.descripcion.trim().length < 10) 
      newErrors.descripcion = "La descripción debe ser detallada.";
      
    if (form.fechaCierre) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(form.fechaCierre)) {
        newErrors.fechaCierre = "Formato inválido. Usa AAAA-MM-DD (Ej: 2025-12-31).";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(form);
    } else {
      Alert.alert("Atención", "Por favor corrige los campos marcados en rojo.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }} keyboardShouldPersistTaps="handled">
      
      <InputField 
        label="Título del Cargo" 
        placeholder="Ej. Scrum Master" 
        value={form.titulo}
        onChangeText={(text) => handleChange('titulo', text)}
        error={errors.titulo}
      />
      
      <InputField 
        label="Área" 
        placeholder="Ej. TI, Finanzas, RRHH" 
        value={form.area}
        onChangeText={(text) => handleChange('area', text)}
        error={errors.area}
      />

      {/* Selector de Estado */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Estado Actual</Text>
        <View style={styles.statusContainer}>
          {['ABIERTA', 'CERRADA', 'PAUSADA'].map((estado) => (
            <TouchableOpacity 
              key={estado}
              style={[styles.chip, form.estado === estado && styles.chipActive]}
              onPress={() => setForm({ ...form, estado })}
            >
              <Text style={[styles.chipText, form.estado === estado && styles.chipTextActive]}>
                {estado}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <InputField 
        label="Fecha de Cierre (Opcional)" 
        placeholder="AAAA-MM-DD" 
        keyboardType="numeric"
        value={form.fechaCierre}
        onChangeText={(text) => handleChange('fechaCierre', text)}
        error={errors.fechaCierre}
      />

      <InputField 
        label="Descripción" 
        placeholder="Detalles del puesto..." 
        multiline 
        value={form.descripcion}
        onChangeText={(text) => handleChange('descripcion', text)}
        error={errors.descripcion}
      />

      <InputField 
        label="Requisitos" 
        placeholder="Conocimientos técnicos, habilidades blandas..." 
        multiline 
        value={form.requisitos}
        onChangeText={(text) => handleChange('requisitos', text)}
        error={errors.requisitos}
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.btn, styles.btnCancel]} 
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.btnTextCancel}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.btnSubmit, loading && styles.btnDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name={isEditing ? "save-outline" : "add-circle-outline"} size={20} color="white" />
              <Text style={styles.btnTextSubmit}>
                {isEditing ? "Actualizar" : "Crear Vacante"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 5 },
  req: { color: '#ef4444' },
  input: { 
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, 
    backgroundColor: '#f9fafb', fontSize: 16 
  },
  textArea: { height: 100 },
  inputError: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  
  statusContainer: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { 
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, 
    backgroundColor: '#e5e7eb', borderWidth: 1, borderColor: '#d1d5db' 
  },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  chipTextActive: { color: 'white' },

  footer: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  btnCancel: { backgroundColor: '#f3f4f6' },
  btnSubmit: { backgroundColor: '#2563eb' },
  btnDisabled: { opacity: 0.7 },
  btnTextCancel: { color: '#374151', fontWeight: '600' },
  btnTextSubmit: { color: 'white', fontWeight: 'bold' }
});