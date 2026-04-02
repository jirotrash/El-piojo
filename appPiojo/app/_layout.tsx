import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { lightColors, darkColors } from '../src/theme/colors';

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;

  return (
    <SafeAreaProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} backgroundColor="transparent" translucent />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen 
          name="register" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="mis-compras" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="mis-donaciones" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="mis-ventas" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="favoritos" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="notificaciones" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="configuracion" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen
          name="checkout-modal"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="producto/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
