import { Stack } from 'expo-router';

export default function VacantesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* La lista principal */}
      <Stack.Screen name="index" options={{ title: 'Lista' }} />
      
      {/* El detalle de la vacante (carpeta [id]) */}
      <Stack.Screen name="[id]" options={{ title: 'Detalle' }} />
    </Stack>
  );
}