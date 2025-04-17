import { Stack } from 'expo-router';
import '../global.css';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { SplashScreen } from 'expo-router';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // You can add any resource loading here (fonts, etc.)
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay to ensure everything is ready
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{
        headerShown: false,
      }} />
      <Stack.Screen name="login" options={{
        headerShown: false,
      }} />
      <Stack.Screen name="register" options={{
        headerShown: false,
      }} />
      <Stack.Screen name="verify" options={{
        headerShown: false,
      }} />
      <Stack.Screen name="forgot-password" options={{
        headerShown: false,
      }} />
      <Stack.Screen name="reset-password" options={{
        headerShown: false,
      }} />
      <Stack.Screen name="video-details" options={{
        headerShown: false,
      }} /> 
      <Stack.Screen name="upload-blog" options={{
        headerShown: false,
      }} />     
    </Stack>
  );
}