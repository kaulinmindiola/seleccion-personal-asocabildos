import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../src/services/api";

// ------------------ DEBOUNCE ------------------
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return debounced;
};

export default function VacantesList() {
  const router = useRouter();
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);

  const [showFilters, setShowFilters] = useState(false);
  const [orderBy, setOrderBy] = useState("creadoEn");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Animación del modal
  const slideAnim = new Animated.Value(0);

  const openModal = () => {
    setShowFilters(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowFilters(false));
  };

  // ------------------ FETCH ------------------
  const fetchVacantes = useCallback(
    async (pageNum = 1, refresh = false) => {
      setLoading(true);

      try {
        const response = await api.get("/vacantes", {
          params: {
            page: pageNum,
            limit: 10,
            estado: "ABIERTA",
            search: debouncedSearch || undefined,
            sortBy: orderBy,
            order: "desc",
          },
        });

        const { data, meta } = response.data;

        setVacantes((prev) => (refresh ? data : [...prev, ...data]));
        setHasMore(pageNum < meta.totalPages);
        setPage(pageNum);
      } catch (error) {
        console.error("ERROR FETCH VACANTES:", error);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, orderBy]
  );

  // Update on search or filter change
  useEffect(() => {
    fetchVacantes(1, true);
  }, [debouncedSearch, orderBy]);

  // ------------------ RENDER CARD ------------------
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.titulo}</Text>
          <Text style={styles.area}>{item.area || "General"}</Text>
        </View>
        <Text style={styles.date}>
          {new Date(item.fechaPublicacion).toLocaleDateString()}
        </Text>
      </View>

      <Text numberOfLines={2} style={styles.description}>
        {item.descripcion}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() =>
            router.push(`/ (public) /vacantes/${item.id}`)
          }
        >
          <Text style={styles.outlineButtonText}>Ver Detalle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push(`/ (public) /vacantes/${item.id}/postular`)
          }
        >
          <Text style={styles.primaryButtonText}>Postularme</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ------------------ JSX ------------------
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Oportunidades</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Buscar cargo, área..."
              value={search}
              onChangeText={(t) => setSearch(t.replace(/[^\w\s]/gi, ""))}
            />

            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.filterButton} onPress={openModal}>
            <Ionicons name="options" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTA */}
      <FlatList
        data={vacantes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onEndReached={() => hasMore && fetchVacantes(page + 1)}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => fetchVacantes(1, true)} />
        }
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No se encontraron vacantes.</Text>
          ) : null
        }
      />

      {/* ------------------ MODAL ------------------ */}
      <Modal transparent visible={showFilters} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.modalTitle}>Ordenar y Filtrar</Text>

            <Text style={styles.label}>Ordenar por:</Text>
            <View style={styles.chipsContainer}>
              {["creadoEn", "fechaPublicacion", "titulo"].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, orderBy === opt && styles.chipActive]}
                  onPress={() => setOrderBy(opt)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      orderBy === opt && styles.chipTextActive,
                    ]}
                  >
                    {opt === "creadoEn" ? "Más recientes" : opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={closeModal}>
              <Text style={styles.primaryButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// ------------------ ESTILOS ------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },

  headerContainer: {
    backgroundColor: "#2563eb",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },

  headerTitle: { color: "white", fontSize: 26, fontWeight: "bold", marginBottom: 10 },

  searchRow: { flexDirection: "row", gap: 10, alignItems: "center" },

  searchBar: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  input: { flex: 1, marginLeft: 8, fontSize: 15 },

  filterButton: {
    backgroundColor: "#1e40af",
    padding: 10,
    borderRadius: 10,
  },

  listContent: { padding: 16 },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  title: { fontSize: 18, fontWeight: "bold", color: "#333" },

  area: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
    textTransform: "uppercase",
  },

  date: { fontSize: 12, color: "#999" },

  description: { color: "#555", marginVertical: 10 },

  actions: { flexDirection: "row", gap: 10, marginTop: 12 },

  outlineButton: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#2563eb",
    alignItems: "center",
  },

  outlineButtonText: { color: "#2563eb", fontWeight: "600" },

  primaryButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },

  primaryButtonText: { color: "white", fontWeight: "600" },

  emptyText: { textAlign: "center", marginTop: 40, color: "#999" },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },

  label: { fontSize: 16, marginBottom: 10 },

  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
  },

  chipActive: { backgroundColor: "#2563eb" },

  chipText: { color: "#444", fontWeight: "500" },

  chipTextActive: { color: "white" },
});
