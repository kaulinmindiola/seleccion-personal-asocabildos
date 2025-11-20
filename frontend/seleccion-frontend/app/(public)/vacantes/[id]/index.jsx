import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../../src/services/api';

export default function DetalleVacante() {
  const { id } = useLocalSearchParams(); // Capturamos el ID de la URL
  const router = useRouter();
  const [vacante, setVacante] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetalle();
  }, [id]);

  const fetchDetalle = async () => {
    try {
      const { data } = await api.get(`/vacantes/${id}`);
      setVacante(data);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar la información de la vacante");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!vacante) return null;

  return (
    <View style={styles.container}>
      {/* Header de Navegación interno */}
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Detalle de Vacante',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff'
        }} 
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>{vacante.titulo}</Text>
        
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{vacante.area}</Text>
          </View>
          <Text style={styles.fecha}>
            Publicado: {new Date(vacante.fechaPublicacion).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.texto}>{vacante.descripcion}</Text>
        </View>

        {vacante.requisitos && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requisitos</Text>
            <Text style={styles.texto}>{vacante.requisitos}</Text>
          </View>
        )}
      </ScrollView>

      {/* Botón Flotante para Postular */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.btnPostular}
          onPress={() => router.push({
            pathname: `/(public)/vacantes/${id}/postular`,
            params: { titulo: vacante.titulo }
          })}
        >
          <Text style={styles.btnText}>POSTULARME AHORA</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 100 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  badge: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  badgeText: { color: '#2563eb', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 },
  fecha: { color: '#6b7280', fontSize: 12 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  texto: { fontSize: 16, lineHeight: 24, color: '#4b5563' },
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee' 
  },
  btnPostular: { 
    backgroundColor: '#2563eb', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
    padding: 16, borderRadius: 10, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});