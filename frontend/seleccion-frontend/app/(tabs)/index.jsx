import { Redirect } from 'expo-router';

export default function Index() {
  // Redirigir automáticamente a la lista de vacantes pública
  return <Redirect href="/(public)/vacantes" />;
}