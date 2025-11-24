import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import React from 'react';

export default function PublicLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="vacantes"
        options={{
          title: 'Vacantes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="seguimiento"
        options={{
          title: 'Seguimiento',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="login_nav"
        options={{
          title: 'Ingresar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
          tabBarButton: ({ children }) => (
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => router.push('/(auth)/login')} // 🔹 Cast a any para que TypeScript no lance error
            >
              {children}
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
