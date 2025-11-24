import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, FlatList, Alert, Keyboard, ScrollView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../src/services/api'; 

export default function SeguimientoScreen() {
  // Estados del Formulario
  const [documento, setDocumento] = useState('');
  
  // Manejo de Fecha
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(false);

  // Estados de Carga y Resultados
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') {
        setShowPicker(false); // Cerrar picker en Android tras selección
    }
    
    if (selectedDate) {
        setDate(selectedDate);
        setFechaSeleccionada(true);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'EN_REVISION': return '#f59e0b'; 
      case 'ENTREVISTA': return '#3b82f6';
      case 'CONTRATADO': return '#10b981';
      case 'RECHAZADO': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleConsultar = async () => {
    if (!documento.trim()) {
      Alert.alert("Error", "Por favor ingresa tu número de documento");
      return;
    }
    if (!fechaSeleccionada) {
      Alert.alert("Error", "Por favor selecciona la fecha de expedición");
      return;
    }

    const fechaFormat = date.toISOString().split('T')[0];

    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await api.post('/postulaciones/seguimiento-publico', {
        numeroDocumento: documento,
        fechaExpedicion: fechaFormat
      });

      if (response.data && response.data.postulaciones && response.data.postulaciones.length > 0) {
        setData(response.data);
      } else {
        Alert.alert("Aviso", "No se encontraron postulaciones activas para estos datos.");
        setData(null);
      }

    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        Alert.alert("Sin resultados", "Datos incorrectos o no existen postulaciones.");
      } else {
        Alert.alert("Error", "Hubo un problema al consultar.");
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaConsulta = () => {
    setData(null);
    setDocumento('');
    setFechaSeleccionada(false);
    setDate(new Date());
  };

  const renderPostulacion = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.vacanteTitle}>{item.vacante.titulo}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
          <Text style={styles.statusText}>{item.estado.replace('_', ' ')}</Text>
        </View>
      </View>
      <Text style={styles.areaText}>{item.vacante.area}</Text>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.detailText}>
          Postulado el: {new Date(item.fechaPostulacion).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  // VISTA: Resultados
  if (data) {
    return (
      <View style={styles.container}>
        <View style={styles.headerResultados}>
          <View>
            <Text style={styles.welcomeText}>Hola, {data.usuario.nombre}</Text>
            <Text style={styles.subTitle}>Tus postulaciones recientes:</Text>
          </View>
          <TouchableOpacity onPress={handleNuevaConsulta} style={styles.exitButton}>
            <Ionicons name="log-out-outline" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={data.postulaciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPostulacion}
          contentContainerStyle={styles.listContent}
        />
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleNuevaConsulta}>
          <Text style={styles.secondaryButtonText}>Consultar otro documento</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // VISTA: Formulario Inicial
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.formContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="search-circle" size={80} color="#2563eb" />
        </View>
        
        <Text style={styles.title}>Seguimiento de Procesos</Text>
        <Text style={styles.instruction}>
          Ingresa tus datos de identificación para ver el estado de tus postulaciones.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Número de Documento</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 100200300"
            keyboardType="numeric"
            value={documento}
            onChangeText={setDocumento}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fecha de Expedición</Text>
          
          {/* Selector de fecha para WEB (Input Nativo HTML) */}
          {Platform.OS === 'web' ? (
             <View style={styles.inputWebWrapper}>
                <input 
                    type="date" 
                    style={{
                        width: '100%', 
                        padding: 12, 
                        borderRadius: 8, 
                        border: '1px solid #ddd',
                        fontSize: 16,
                        fontFamily: 'System'
                    }}
                    value={date.toISOString().split('T')[0]}
                    onChange={(e) => {
                        if(e.target.value) {
                            setDate(new Date(e.target.value));
                            setFechaSeleccionada(true);
                        }
                    }}
                />
             </View>
          ) : (
            /* Selector de fecha para MÓVIL (Android/iOS) */
            <>
                <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
                  <Text style={!fechaSeleccionada ? styles.placeholderText : styles.dateText}>
                    {fechaSeleccionada ? date.toLocaleDateString() : 'Seleccionar Fecha'}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#666" />
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={date}
                      mode="date"
                      display="default"
                      onChange={onChangeDate}
                      maximumDate={new Date()} 
                    />
                )}
            </>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.buttonDisabled]} 
          onPress={handleConsultar}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Consultar Estado</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  formContainer: { alignItems: 'stretch' },
  iconContainer: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
  instruction: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5 },
  
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fafafa' },
  
  // Estilos específicos para Web
  inputWebWrapper: { width: '100%' },

  // Estilos del botón de fecha (Android)
  dateButton: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fafafa' 
  },
  placeholderText: { color: '#999', fontSize: 16 },
  dateText: { color: '#333', fontSize: 16 },

  primaryButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  // Resultados
  headerResultados: { padding: 20, paddingTop: 50, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' },
  welcomeText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  subTitle: { fontSize: 14, color: '#666' },
  exitButton: { padding: 5 },
  listContent: { padding: 16 },
  secondaryButton: { padding: 15, alignItems: 'center' },
  secondaryButtonText: { color: '#2563eb', fontWeight: '600' },

  // Card
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  vacanteTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  areaText: { fontSize: 14, color: '#2563eb', fontWeight: '600', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  detailText: { marginLeft: 6, color: '#555', fontSize: 13 }
});