import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawer from '../../components/CustomDrawer'; // Verifica esta ruta

export default function AdminLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
          headerShown: true, // Muestra el botón de hamburguesa del Drawer
          headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#333',
          drawerActiveBackgroundColor: '#eff6ff',
          drawerActiveTintColor: '#2563eb',
          // Forzamos comportamiento frontal para asegurar que se vea en todas las pantallas
          drawerType: 'front', 
          drawerStyle: { width: 280 },
          overlayColor: 'rgba(0,0,0,0.5)',
        }}
      >
        {/* Opción 1: DASHBOARD 
          Apunta a la CARPETA 'dashboard'. Expo cargará automáticamente 'dashboard/_layout.jsx'
        */}
        <Drawer.Screen
          name="dashboard"
          options={{
            drawerLabel: 'Dashboard',
            headerTitle: 'Panel de Control',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Opción 2: VACANTES */}
        <Drawer.Screen
          name="vacantes"
          options={{
            drawerLabel: 'Gestionar Vacantes',
            headerTitle: 'Gestión de Vacantes',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="briefcase-outline" size={size} color={color} />
            ),
          }}
        />
        
        {/* Agrega aquí 'postulaciones', 'usuarios', etc. si ya tienes las carpetas */}
      </Drawer>
    </GestureHandlerRootView>
  );
}