import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext'; // Asegúrate que la ruta sea correcta

export default function RootLayout() {
  return (
    // 1. Inyectamos el proveedor de autenticación globalmente
    <AuthProvider>
      {/* 2. Configuramos el Stack de navegación principal */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* Definimos nuestros grupos de rutas */}
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </AuthProvider>
  );
}