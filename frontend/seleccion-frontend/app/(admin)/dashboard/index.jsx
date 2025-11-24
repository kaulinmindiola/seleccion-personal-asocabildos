import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator 
} from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../src/services/api';

export default function AdminDashboard() {
  const { user } = useAuth(); // ❗ signOut eliminado
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para los datos del backend
  const [kpis, setKpis] = useState(null);
  const [areas, setAreas] = useState([]);
  const [recientes, setRecientes] = useState([]);

  const fetchData = async () => {
    try {
      const [kpiRes, areaRes, postulacionesRes] = await Promise.all([
        api.get('/dashboard/kpis'),
        api.get('/dashboard/por-area'),
        api.get('/dashboard/postulaciones?limit=5')
      ]);

      setKpis(kpiRes.data);
      setAreas(areaRes.data);
      setRecientes(postulacionesRes.data.data);

    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  // Componente KPI
  const KpiCard = ({ title, value, icon, color }) => (
    <View style={styles.kpiCard}>
      <View style={[styles.iconBg, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View>
        <Text style={styles.kpiValue}>{value}</Text>
        <Text style={styles.kpiTitle}>{title}</Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* HEADER SIN BOTÓN LOGOUT */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.nombre || 'Admin'}</Text>
          <Text style={styles.subHeader}>Panel de Control</Text>
        </View>
        {/* ❌ BOTÓN LOGOUT ELIMINADO */}
      </View>

      {/* Sección 1: KPIs Globales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen General</Text>
        <View style={styles.grid}>
          <KpiCard 
            title="Vacantes" 
            value={kpis?.totalVacantes || 0} 
            icon="briefcase-outline"
            color="#2563eb" 
          />
          <KpiCard 
            title="Abiertas" 
            value={kpis?.vacantesAbiertas || 0} 
            icon="lock-open-outline"
            color="#10b981" 
          />
          <KpiCard 
            title="Postulaciones" 
            value={kpis?.totalPostulaciones || 0} 
            icon="documents" 
            color="#f59e0b" 
          />
          <KpiCard 
            title="Usuarios" 
            value={kpis?.totalUsuarios || 0} 
            icon="people-outline" 
            color="#8b5cf6" 
          />
        </View>
      </View>

      {/* Sección 2: Gráfica simple */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Postulaciones por Área</Text>
        <View style={styles.card}>
          {areas.length === 0 ? (
            <Text style={styles.emptyText}>No hay datos aún</Text>
          ) : (
            areas.map((item, index) => (
              <View key={index} style={styles.areaRow}>
                <View style={styles.areaInfo}>
                  <Text style={styles.areaName}>{item.area}</Text>
                  <Text style={styles.areaCount}>{item.postulaciones}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${Math.min((item.postulaciones / (kpis?.totalPostulaciones || 1)) * 100, 100)}%` }
                    ]} 
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Sección 3: Actividad Reciente */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <Text style={styles.sectionTitle}>Actividad Reciente</Text>
        {recientes.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Text style={styles.postUser}>{post.usuario.nombre}</Text>
              <Text style={styles.postDate}>
                {new Date(post.fechaPostulacion).toLocaleDateString()}
              </Text>
            </View>

            <Text style={styles.postVacante}>{post.vacante.titulo}</Text>
            <Text style={styles.postDoc}>DOC: {post.usuario.numeroDocumento}</Text>

            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{post.estado.replace('_', ' ')}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    backgroundColor: 'white', padding: 20, paddingTop: 50, flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  subHeader: { fontSize: 14, color: '#666' },

  section: { padding: 20, paddingBottom: 0 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#444' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiCard: { 
    width: '48%', backgroundColor: 'white', padding: 15, borderRadius: 12, 
    flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 2 
  },
  iconBg: { padding: 10, borderRadius: 10 },
  kpiValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  kpiTitle: { fontSize: 12, color: '#666' },

  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, elevation: 2 },
  emptyText: { textAlign: 'center', color: '#999', fontStyle: 'italic' },

  areaRow: { marginBottom: 12 },
  areaInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  areaName: { fontWeight: '600', color: '#555' },
  areaCount: { fontWeight: 'bold', color: '#2563eb' },
  progressBarBg: { height: 6, backgroundColor: '#f0f0f0', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: '#2563eb', borderRadius: 3 },

  postCard: { 
    backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, 
    borderLeftWidth: 4, borderLeftColor: '#2563eb', elevation: 1 
  },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  postUser: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  postDate: { fontSize: 12, color: '#999' },
  postVacante: { fontSize: 14, color: '#666', marginBottom: 2 },
  postDoc: { fontSize: 12, color: '#999' },
  badgeContainer: { marginTop: 8, flexDirection: 'row' },
  badge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: '#2563eb', fontSize: 10, fontWeight: 'bold' }
});
