import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  Keyboard,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack } from "expo-router";
import api from "../../src/services/api";

export default function SeguimientoScreen() {
  const [documento, setDocumento] = useState("");
  const [fecha, setFecha] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // ---------------- VALIDACIONES ----------------
  const validateDocumento = () => {
    return /^\d{5,}$/.test(documento); // solo números, mínimo 5 dígitos
  };

  const validateFecha = () => fecha instanceof Date;

  const formValid = validateDocumento() && validateFecha();

  // ---------------- CONSULTA ----------------
  const handleConsultar = async () => {
    if (!formValid) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      const response = await api.post("/postulaciones/seguimiento-publico", {
        numeroDocumento: documento,
        fechaExpedicion: fecha.toISOString().split("T")[0],
      });

      if (response.data.postulaciones.length > 0) {
        setData(response.data);
      } else {
        Alert.alert("Sin resultados", "No se encontraron postulaciones activas.");
        setData(null);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        error.response?.status === 404
          ? "Sin resultados"
          : "Error",
        error.response?.status === 404
          ? "No encontramos registros para esos datos."
          : "Ocurrió un error, intenta nuevamente."
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // -------- Render de cada tarjeta --------
  const getStatusColor = (estado) => {
    switch (estado) {
      case "EN_REVISION": return "#f59e0b";
      case "ENTREVISTA": return "#3b82f6";
      case "CONTRATADO": return "#10b981";
      case "RECHAZADO": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const renderPostulacion = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.vacante.titulo}</Text>
          <Text style={styles.area}>{item.vacante.area}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
          <Text style={styles.statusText}>{item.estado}</Text>
        </View>
      </View>
      <Text style={styles.detailText}>
        Postulado: {new Date(item.fechaPostulacion).toLocaleDateString()}
      </Text>
    </View>
  );

  // -------- Vista con resultados --------
  if (data) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.headerResultados}>
          <View>
            <Text style={styles.headerTitle}>Hola, {data.usuario.nombre}</Text>
            <Text style={styles.subTitle}>Tus postulaciones recientes</Text>
          </View>
          <TouchableOpacity onPress={() => setData(null)}>
            <Ionicons name="log-out-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={data.postulaciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPostulacion}
          contentContainerStyle={styles.listContent}
        />

        <TouchableOpacity style={styles.secondaryButton} onPress={() => setData(null)}>
          <Text style={styles.secondaryButtonText}>Consultar otro documento</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // -------- Vista inicial con formulario --------
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Seguimiento</Text>
        <Text style={styles.subHeader}>Consulta el estado de tu postulación</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Documento */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Número de Documento</Text>
          <View style={[
            styles.inputWrapper,
            !validateDocumento() && documento.length > 0 && styles.inputError
          ]}>
            <Ionicons name="id-card-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ej. 100200300"
              value={documento}
              onChangeText={(t) => {
                if (/^\d*$/.test(t)) setDocumento(t);
              }}
            />
          </View>
          {!validateDocumento() && documento.length > 0 && (
            <Text style={styles.errorText}>Solo números, mínimo 5 dígitos</Text>
          )}
        </View>

        {/* Fecha */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fecha de Expedición</Text>
          <TouchableOpacity
            style={[styles.inputWrapper, !validateFecha() && fecha !== null && styles.inputError]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={[styles.input, { color: fecha ? "#000" : "#999" }]}>
              {fecha ? fecha.toISOString().split("T")[0] : "Seleccionar fecha"}
            </Text>
          </TouchableOpacity>
          {!validateFecha() && fecha !== null && (
            <Text style={styles.errorText}>Fecha inválida</Text>
          )}
        </View>

        {/* DatePicker */}
        {showDatePicker && (
          <DateTimePicker
            value={fecha || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === "ios"); // ios mantiene abierto
              if (selectedDate) setFecha(selectedDate);
            }}
            maximumDate={new Date()}
          />
        )}

        {/* Botón */}
        <TouchableOpacity
          style={[styles.primaryButton, (!formValid || loading) && styles.buttonDisabled]}
          onPress={handleConsultar}
          disabled={!formValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.primaryButtonText}>Consultar Estado</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ---------------- ESTILOS ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContainer: { paddingBottom: 40 },
  headerContainer: { backgroundColor: "#2563eb", padding: 20, paddingTop: 50 },
  headerResultados: {
    backgroundColor: "#2563eb",
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 26, color: "white", fontWeight: "bold" },
  subHeader: { color: "white", fontSize: 14, marginTop: 4 },
  subTitle: { color: "white", fontSize: 14 },
  formContainer: { padding: 20, gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, color: "#333" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  inputError: { borderColor: "#dc2626" },
  input: { flex: 1, marginLeft: 8 },
  errorText: { marginTop: 2, color: "#dc2626", fontSize: 12 },
  primaryButton: { backgroundColor: "#2563eb", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 4 },
  primaryButtonText: { color: "white", fontWeight: "600" },
  buttonDisabled: { opacity: 0.5 },
  listContent: { padding: 16 },
  card: { backgroundColor: "white", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  title: { fontSize: 18, fontWeight: "bold", color: "#333" },
  area: { fontSize: 12, color: "#2563eb", fontWeight: "600" },
  detailText: { marginTop: 6, color: "#555" },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  statusText: { color: "white", fontWeight: "600" },
  secondaryButton: { backgroundColor: "#e5e7eb", padding: 14, margin: 16, borderRadius: 10, alignItems: "center" },
  secondaryButtonText: { color: "#2563eb", fontWeight: "600" },
});
