import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import VacanteForm from '../../../components/admin/VacanteForm'; // Ajusta ruta si es necesario
import api from '../../../src/services/api';

export default function CrearVacante() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (formData) => {
    setLoading(true);
    try {
      // Preparar payload según tu backend
      const payload = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        requisitos: formData.requisitos,
        area: formData.area,
        estado: formData.estado,
        // Convertir fecha a ISO si existe, o null
        fechaCierre: formData.fechaCierre ? new Date(formData.fechaCierre).toISOString() : null,
        // 'existe' y 'creadoPorId' los maneja el backend o defaults
      };

      const response = await api.post('/vacantes', payload);

      if (response.status === 201) {
        Alert.alert("¡Éxito!", "Vacante creada correctamente.", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error("Error creando vacante:", error);
      const msg = error.response?.data?.msg || "No se pudo crear la vacante.";
      // Manejo específico del 403 por si RRHH intenta crear y no tiene permiso
      if (error.response?.status === 403) {
        Alert.alert("Permiso Denegado", "Tu rol no tiene permisos para crear vacantes.");
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Nueva Vacante' }} />
      <VacanteForm onSubmit={handleCreate} loading={loading} isEditing={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
});