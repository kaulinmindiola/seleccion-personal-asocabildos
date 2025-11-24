import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert, Linking, ScrollView 
} from 'react-native'; // ✅ ScrollView agregado aquí
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import api from '../../../src/services/api';

// ⚠️ IMPORTANTE: Ajusta tu IP si es necesario
const BASE_URL = 'http://192.168.101.5:4000/'; 

export default function GlobalPostulaciones() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  
  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchPostulaciones();
    }, [filterEstado])
  );

  useEffect(() => {
    const delay = setTimeout(fetchPostulaciones, 500);
    return () => clearTimeout(delay);
  }, [search]);

  const fetchPostulaciones = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/postulaciones', { 
        params: { 
            limit: 50, 
            search, 
            estado: filterEstado || undefined,
            sortBy: 'fechaPostulacion',
            order: 'desc'
        }
      });
      setPostulaciones(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    try {
      await api.patch(`/postulaciones/${selectedItem.id}/estado`, { estado: nuevoEstado });
      Alert.alert("Actualizado", `El candidato ha pasado a estado: ${nuevoEstado}`);
      setModalVisible(false);
      fetchPostulaciones(); 
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el estado.");
    }
  };

  const abrirDocumento = () => {
    const docs = selectedItem?.documentos;
    if (docs && docs.length > 0) {
        const path = docs[0].urlArchivo.replace(/\\/g, "/");
        const url = `${BASE_URL}${path}`;
        
        Linking.openURL(url).catch(err => {
            Alert.alert("Error", "No se pudo abrir el archivo. Verifica la IP en BASE_URL.");
        });
    } else {
        Alert.alert("Sin Archivo", "Este candidato no tiene hoja de vida adjunta.");
    }
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'EN_REVISION': return '#f59e0b'; 
      case 'ENTREVISTA': return '#3b82f6'; 
      case 'CONTRATADO': return '#10b981'; 
      case 'RECHAZADO': return '#ef4444'; 
      default: return '#9ca3af'; 
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        style={styles.card} 
        onPress={() => { setSelectedItem(item); setModalVisible(true); }}
    >
      <View style={styles.cardRow}>
         <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.usuario.nombre.charAt(0)}</Text>
         </View>
         <View style={{flex: 1}}>
            <Text style={styles.name}>{item.usuario.nombre}</Text>
            <Text style={styles.vacante}>{item.vacante.titulo}</Text>
         </View>
         <View style={[styles.badge, { backgroundColor: getStatusColor(item.estado) + '20' }]}>
             <Text style={[styles.badgeText, { color: getStatusColor(item.estado) }]}>
                 {item.estado === 'EN_REVISION' ? 'NUEVO' : item.estado}
             </Text>
         </View>
      </View>
      <Text style={styles.date}>
          📅 {new Date(item.fechaPostulacion).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput 
                style={styles.input} 
                placeholder="Buscar por nombre, cédula o cargo..." 
                value={search}
                onChangeText={setSearch}
            />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {['', 'EN_REVISION', 'ENTREVISTA', 'CONTRATADO', 'RECHAZADO'].map(st => (
                <TouchableOpacity 
                    key={st} 
                    onPress={() => setFilterEstado(st)}
                    style={[styles.chip, filterEstado === st && styles.chipActive]}
                >
                    <Text style={filterEstado === st ? styles.chipTextActive : styles.chipText}>
                        {st === '' ? 'Todos' : st.replace('_', ' ')}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {loading && postulaciones.length === 0 ? (
        <ActivityIndicator size="large" color="#2563eb" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={postulaciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron resultados.</Text>}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Gestionar Candidato</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                {selectedItem && (
                    <View>
                        <Text style={styles.label}>Candidato:</Text>
                        <Text style={styles.value}>{selectedItem.usuario.nombre}</Text>
                        
                        <Text style={styles.label}>Contacto:</Text>
                        <Text style={styles.value}>{selectedItem.usuario.correo} • {selectedItem.usuario.telefono}</Text>

                        <Text style={styles.label}>Aplicando a:</Text>
                        <Text style={styles.value}>{selectedItem.vacante.titulo}</Text>

                        <TouchableOpacity style={styles.cvButton} onPress={abrirDocumento}>
                            <Ionicons name="document-text-outline" size={24} color="#2563eb" />
                            <Text style={styles.cvText}>Ver Hoja de Vida (PDF)</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />
                        <Text style={styles.sectionTitle}>Cambiar Estado</Text>
                        
                        <View style={styles.actionsGrid}>
                            <TouchableOpacity style={[styles.actionBtn, {borderColor: '#3b82f6'}]} 
                                onPress={() => handleCambiarEstado('ENTREVISTA')}>
                                <Text style={{color:'#3b82f6', fontWeight:'bold'}}>Entrevista</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={[styles.actionBtn, {borderColor: '#10b981'}]} 
                                onPress={() => handleCambiarEstado('CONTRATADO')}>
                                <Text style={{color:'#10b981', fontWeight:'bold'}}>Contratar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={[styles.actionBtn, {borderColor: '#ef4444'}]} 
                                onPress={() => handleCambiarEstado('RECHAZADO')}>
                                <Text style={{color:'#ef4444', fontWeight:'bold'}}>Rechazar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
         </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  toolbar: { backgroundColor: 'white', padding: 15, paddingBottom: 10, elevation: 3, shadowOpacity: 0.1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 10, height: 45 },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#e2e8f0', marginRight: 8 },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#475569', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  list: { padding: 15 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#2563eb', fontWeight: 'bold', fontSize: 18 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  vacante: { fontSize: 13, color: '#64748b' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  date: { fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 12, color: '#64748b', marginTop: 10, fontWeight: 'bold' },
  value: { fontSize: 16, color: '#334155', marginBottom: 5 },
  cvButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#eff6ff', padding: 15, borderRadius: 10, marginTop: 20, borderWidth: 1, borderColor: '#bfdbfe' },
  cvText: { color: '#2563eb', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  actionBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center', backgroundColor: 'white' },
  closeBtn: { marginTop: 20, alignItems: 'center', padding: 10 }
});