import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    // Reset states
    setError(null);
    
    // Validate email
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Make API request to your backend
      const response = await axios.post(
        `${API_URL}/auth/forgot-password`,
        { email }
      );
      
      if (response.data.success) {
        setSuccess(true);
        // Store email in AsyncStorage for reset screen
        await AsyncStorage.setItem('resetEmail', email);
        // Navigate to reset password page after 2 seconds
        setTimeout(() => {
          router.push('/reset-password');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to process your request');
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'An error occurred');
      } else {
        setError('Unable to connect to the server. Please try again later.');
      }
      console.error('Forgot password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5 pt-6">
          {/* Back button */}
          <TouchableOpacity 
            className="flex-row items-center mb-6" 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#3b82f6" />
            <Text className="text-blue-500 ml-1 text-base">Back</Text>
          </TouchableOpacity>
          
          <View className="pb-10">
            <Text className="text-2xl font-bold text-gray-800 mb-4">Reset Your Password</Text>
            
            {!success ? (
              <>
                <Text className="text-gray-600 mb-6">
                  Enter your email address and we'll send you a one time password to reset your password.
                </Text>
                
                <View className="space-y-4">
                  <View>
                    <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-800"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  
                  {error && (
                    <View className="bg-red-50 border border-red-100 rounded-lg p-3">
                      <Text className="text-red-500">{error}</Text>
                    </View>
                  )}
                  
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isLoading}
                    className={`w-full bg-blue-600 py-3 rounded-lg items-center mt-4 ${
                      isLoading ? 'opacity-70' : ''
                    }`}
                  >
                    {isLoading ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="#ffffff" />
                        <Text className="text-white font-medium ml-2">Processing...</Text>
                      </View>
                    ) : (
                      <Text className="text-white font-medium mt-2">Send OTP</Text>
                    )}
                  </TouchableOpacity>
                </View>
                
                <View className="mt-6 items-center">
                  <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text className="text-blue-600">Remember your password? Log in</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View className="items-center py-8">
                <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
                  <Ionicons name="checkmark" size={40} color="#10b981" />
                </View>
                <Text className="text-xl font-semibold text-gray-800 mb-2">Check Your Email</Text>
                <Text className="text-gray-600 text-center">
                  We've sent one time password to
                </Text>
                <Text className="text-blue-600 font-medium mb-4">{email}</Text>
                <Text className="text-gray-500 text-sm">
                  Redirecting you to the reset...
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}