import React, { useEffect, useState } from "react";
import { 
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert 
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../../src/services/api";

export default function VacanteDetalle() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [vacante, setVacante] = useState(null);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const res = await api.get(`/vacantes/${id}`);
        setVacante(res.data);
      } catch (err) {
        Alert.alert("Error", "No se pudo cargar la vacante");
      }
    };
    loadDetail();
  }, [id]);

  if (!vacante) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Detalle de Vacante",
          headerStyle: { backgroundColor: "#2563eb" },
          headerTintColor: "white",
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

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btnPostular}
          onPress={() => {
            router.push(
              `/(public)/vacantes/${id}/postular?titulo=${encodeURIComponent(vacante.titulo)}`
            );
          }}
        >
          <Text style={styles.btnText}>POSTULARME AHORA</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { padding: 20, paddingBottom: 100 },
  titulo: { fontSize: 26, fontWeight: "bold", color: "#1f2937", marginBottom: 10 },
  badgeContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  badge: { backgroundColor: "#dbeafe", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  badgeText: { color: "#2563eb", fontWeight: "bold" },
  fecha: { color: "#666" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  texto: { fontSize: 16, lineHeight: 24 },
  footer: { padding: 20, position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "white" },
  btnPostular: { backgroundColor: "#2563eb", padding: 16, borderRadius: 10, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  btnText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
