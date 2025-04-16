import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ResetPasswordScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  // Get email from AsyncStorage on component mount
  useEffect(() => {
    const getStoredEmail = async () => {
      try {
        const email = await AsyncStorage.getItem('resetEmail');
        if (email) {
          setFormData(prev => ({ ...prev, email }));
        }
      } catch (error) {
        console.error('Error fetching email from AsyncStorage:', error);
      }
    };

    getStoredEmail();
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Check password strength when password changes
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password: string) => {
    if (password.length < 8) {
      setPasswordStrength('weak');
      return;
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = 
      [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars]
        .filter(Boolean).length;
    
    if (strength < 3) {
      setPasswordStrength('weak');
    } else if (strength === 3) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  };

  const validateForm = () => {
    // Reset error
    setError(null);
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Validate OTP - assuming it's 6 digits
    if (!/^\d{6}$/.test(formData.otp)) {
      setError('Please enter a valid 6-digit OTP');
      return false;
    }
    
    // Validate password
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Make API request to reset password
      const response = await axios.post(
        `${API_URL}/auth/reset-password`,
        {
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.password
        }
      );
      
      if (response.data.success) {
        setSuccess(true);
        // Clear the stored email
        await AsyncStorage.removeItem('resetEmail');
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'An error occurred');
      } else {
        setError('Unable to connect to the server. Please try again later.');
      }
      console.error('Reset password error:', error);
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
                  Enter the OTP sent to your email along with your new password.
                </Text>
                
                <View className="space-y-4">
                  {/* Email Field */}
                  <View>
                    <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
                    <TextInput
                      value={formData.email}
                      onChangeText={(value) => handleChange('email', value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-800"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!formData.email} // Make readonly if pre-filled
                    />
                  </View>
                  
                  {/* OTP Field */}
                  <View>
                    <Text className="text-gray-700 font-medium mb-2">One-Time Password (OTP)</Text>
                    <TextInput
                      value={formData.otp}
                      onChangeText={(value) => handleChange('otp', value)}
                      placeholder="6-digit code"
                      className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-800"
                      keyboardType="numeric"
                      maxLength={6}
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                      Enter the 6-digit code sent to your email
                    </Text>
                  </View>
                  
                  {/* Password Field */}
                  <View>
                    <Text className="text-gray-700 font-medium mb-2">New Password</Text>
                    <TextInput
                      value={formData.password}
                      onChangeText={(value) => handleChange('password', value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-800"
                      secureTextEntry
                    />
                    {passwordStrength && (
                      <View className="mt-2">
                        <View className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <View 
                            className={`h-full ${
                              passwordStrength === 'weak' ? 'bg-red-500 w-1/3' : 
                              passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' : 
                              'bg-green-500 w-full'
                            }`}
                          />
                        </View>
                        <Text className={`text-xs mt-1 ${
                          passwordStrength === 'weak' ? 'text-red-500' : 
                          passwordStrength === 'medium' ? 'text-yellow-500' : 
                          'text-green-500'
                        }`}>
                          {passwordStrength === 'weak' ? 'Weak password' : 
                           passwordStrength === 'medium' ? 'Medium strength' : 
                           'Strong password'}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Confirm Password Field */}
                  <View>
                    <Text className="text-gray-700 font-medium mb-2">Confirm Password</Text>
                    <TextInput
                      value={formData.confirmPassword}
                      onChangeText={(value) => handleChange('confirmPassword', value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-800"
                      secureTextEntry
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
                    className={`w-full bg-blue-600 py-3 rounded-lg items-center mt-3 ${
                      isLoading ? 'opacity-70' : ''
                    }`}
                  >
                    {isLoading ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="#ffffff" />
                        <Text className="text-white font-medium ml-2">Processing...</Text>
                      </View>
                    ) : (
                      <Text className="text-white font-medium">Reset Password</Text>
                    )}
                  </TouchableOpacity>
                </View>
                
                <View className="mt-6 items-center">
                  <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                    <Text className="text-blue-600">Didn't receive the code? Request again</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View className="items-center py-8">
                <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
                  <Ionicons name="checkmark" size={40} color="#10b981" />
                </View>
                <Text className="text-xl font-semibold text-gray-800 mb-2">Password Reset Successful</Text>
                <Text className="text-gray-600 text-center mb-4">
                  Your password has been reset successfully.
                </Text>
                <Text className="text-gray-500 text-sm">
                  Redirecting you to the login...
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}