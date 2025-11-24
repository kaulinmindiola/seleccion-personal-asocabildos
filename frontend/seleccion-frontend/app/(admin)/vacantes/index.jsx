import React, { useState, useCallback } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/context/AuthContext';
import api from '../../../src/services/api';

export default function VacantesAdminList() {
  const router = useRouter();
  const { user } = useAuth(); // Obtenemos el usuario para validar rol
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchVacantes();
    }, [])
  );

  const fetchVacantes = async () => {
    try {
      // Reutilizamos el endpoint GET /vacantes. 
      // Si tuvieras un endpoint especial admin, úsalo aquí.
      const response = await api.get('/vacantes?limit=100');
      setVacantes(response.data.data || []);
    } catch (error) {
      console.error("Error listando vacantes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = (id) => {
    Alert.alert(
      "Eliminar Vacante",
      "¿Estás seguro? Si tiene postulaciones se archivará, si no, se borrará permanentemente.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/vacantes/${id}`);
              Alert.alert("Eliminado", "La vacante ha sido procesada.");
              fetchVacantes(); // Recargar la lista
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "No se pudo eliminar la vacante.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.subtitle}>{item.area}</Text>
        <View style={styles.row}>
             <View style={[styles.badge, item.estado === 'ABIERTA' ? styles.bgGreen : styles.bgGray]}>
                <Text style={styles.badgeText}>{item.estado}</Text>
             </View>
             <Text style={styles.date}>Pub: {new Date(item.fechaPublicacion).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {/* 1. NUEVO BOTÓN: REVISAR (Para Admin y RRHH) */}
        <TouchableOpacity 
          style={[styles.actionBtn, styles.viewBtn]}
          onPress={() => router.push(`/(admin)/vacantes/gestion/${item.id}`)}
        >
          <Ionicons name="eye" size={18} color="#0ea5e9" /> 
        </TouchableOpacity>

        {/* Botón EDITAR: Visible para todos (Admin/RRHH) */}
        <TouchableOpacity 
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => router.push(`/(admin)/vacantes/editar/${item.id}`)}
        >
          <Ionicons name="pencil" size={18} color="#2563eb" />
        </TouchableOpacity>

        {/* Botón ELIMINAR: SOLO ADMIN */}
        {user?.rol === 'ADMIN' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleEliminar(item.id)}
          >
            <Ionicons name="trash" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Vacantes</Text>
        
        <TouchableOpacity 
          style={styles.createBtn} 
          onPress={() => router.push('/(admin)/vacantes/crear')}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.createBtnText}>Nueva</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={vacantes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay vacantes registradas.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee',
    elevation: 2
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  createBtn: { 
    flexDirection: 'row', backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 16, 
    borderRadius: 8, alignItems: 'center', gap: 5, elevation: 2
  },
  createBtnText: { color: 'white', fontWeight: 'bold' },
  
  list: { padding: 15 },
  card: { 
    backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1
  },
  cardContent: { flex: 1, marginRight: 10 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  date: { fontSize: 11, color: '#9ca3af' },
  
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  bgGreen: { backgroundColor: '#dcfce7' },
  bgGray: { backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#374151' },

  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 10, borderRadius: 8 },
  viewBtn: { backgroundColor: '#e0f2fe' },
  editBtn: { backgroundColor: '#eff6ff' },
  deleteBtn: { backgroundColor: '#fef2f2' },
  
  
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});