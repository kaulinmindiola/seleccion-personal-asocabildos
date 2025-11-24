import { Stack } from 'expo-router';

export default function VacantesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. Lista principal (vacantes/index.jsx) */}
      <Stack.Screen name="index" options={{ title: 'Lista' }} />
      
      {/* 2. Detalle de la vacante (vacantes/[id]/index.jsx) */}
      <Stack.Screen name="[id]/index" options={{ title: 'Detalle de Vacante' }} />
      
      {/* 3. Formulario de Postular (vacantes/[id]/postular.jsx) */}
      <Stack.Screen name="[id]/postular" options={{ title: 'Formulario de Postulación' }} /> 
      
      {/* ⚠️ ELIMINADO: Ya no usamos la línea <Stack.Screen name="[id]" /> para evitar conflictos. */}
      
    </Stack>
  );
}