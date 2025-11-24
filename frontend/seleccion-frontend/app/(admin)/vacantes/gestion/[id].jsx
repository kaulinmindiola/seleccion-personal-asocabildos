import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import api from "../../../../src/services/api";

export default function GestionVacante() {
  const { id } = useLocalSearchParams();
  const [vacante, setVacante] = useState(null);
  const [postulantes, setPostulantes] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const res = await api.get(`/vacantes/${id}`);
      setVacante(res.data.vacante);
      setPostulantes(res.data.postulantes || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gestión de Vacante {id}</Text>

      {vacante && (
        <View style={styles.box}>
          <Text style={styles.boxTitle}>{vacante.titulo}</Text>
          <Text>{vacante.area}</Text>
          <Text>{vacante.descripcion}</Text>
        </View>
      )}

      <Text style={styles.subtitle}>Postulantes</Text>

      {postulantes.map((p) => (
        <View key={p.id} style={styles.postulanteCard}>
          <Text style={styles.postulanteName}>{p.usuario.nombre}</Text>
          <Text>Estado: {p.estado}</Text>
          {/* Aquí luego agregamos botón VER */}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  subtitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  box: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
  },
  boxTitle: { fontSize: 18, fontWeight: "bold" },
  postulanteCard: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  postulanteName: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
