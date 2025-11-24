import { Stack } from 'expo-router';

export default function DashboardInternalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}> 
      {/* headerShown: false es CRÍTICO aquí. 
         Dejamos que el Drawer (Padre) se encargue de mostrar el título y la hamburguesa.
      */}
      <Stack.Screen name="index" />
    </Stack>
  );
}