import { Stack } from 'expo-router';

export default function VacantesAdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* La lista principal */}
      <Stack.Screen name="index" /> 
      
      {/* Formularios (No aparecen en el drawer, se accede desde index) */}
      <Stack.Screen name="crear" options={{ presentation: 'modal', title: 'Nueva Vacante' }} />
      <Stack.Screen name="editar/[id]" options={{ title: 'Editar Vacante' }} />
    </Stack>
  );
}