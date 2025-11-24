import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';


export default function CustomDrawer(props) {
  const { user, signOut } = useAuth();


  return (
    <View style={{ flex: 1 }}>
      {/* Cabecera del Menú (Perfil) */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.userName}>{user?.nombre || 'Usuario'}</Text>
        <Text style={styles.userRole}>{user?.rol || 'Invitado'}</Text>
      </View>

      {/* Lista de Navegación Automática */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Footer (Cerrar Sesión) */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    paddingTop: 50, // Ajuste para StatusBar
    alignItems: 'center',
  },
  avatarContainer: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10
  },
  userName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  userRole: { color: '#dbeafe', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoutText: { fontSize: 16, color: '#ef4444', fontWeight: '600' }
});