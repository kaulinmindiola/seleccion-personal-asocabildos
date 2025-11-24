import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import VacanteForm from '../../../../components/admin/VacanteForm';
import api from '../../../../src/services/api';

export default function EditarVacante() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // 1. Cargar datos al abrir
  useEffect(() => {
    const fetchVacante = async () => {
      try {
        const { data } = await api.get(`/vacantes/${id}`);
        // Preparar datos para el formulario (Fecha string YYYY-MM-DD)
        const formattedData = {
          ...data,
          fechaCierre: data.fechaCierre ? data.fechaCierre.split('T')[0] : '',
        };
        setInitialData(formattedData);
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar la información de la vacante.");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchVacante();
  }, [id]);

  // 2. Enviar actualización (PUT)
  const handleUpdate = async (formData) => {
    setSubmitting(true);
    try {
      const payload = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        requisitos: formData.requisitos,
        area: formData.area,
        estado: formData.estado,
        fechaCierre: formData.fechaCierre ? new Date(formData.fechaCierre).toISOString() : null,
      };

      await api.put(`/vacantes/${id}`, payload);

      Alert.alert("Actualizado", "Cambios guardados correctamente.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.msg || "No se pudo actualizar.";
      if (error.response?.status === 403) {
        Alert.alert("Permiso Denegado", "Solo Administradores pueden editar vacantes.");
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: '#666' }}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Editar Vacante' }} />
      <VacanteForm 
        initialValues={initialData} 
        onSubmit={handleUpdate} 
        loading={submitting} 
        isEditing={true} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});