import { Stack } from 'expo-router';

export default function PostulacionesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Postulaciones' }} />
    </Stack>
  );
}