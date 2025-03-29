import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Register = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    // Implement registration logic here
    console.log('Register with:', name, email, password);
    // Navigate to home on successful registration
    router.push('/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView className="flex-1">
            {/* Header */}
            <View className="w-full px-5 pt-6 pb-4">
              <Text className="text-2xl font-bold text-gray-800">Create Account</Text>
              <Text className="text-base text-gray-600 mt-1">
                Join LearnTech and start your learning journey
              </Text>
            </View>

            {/* Registration Form */}
            <View className="flex-1 px-5 pt-4">
              {/* Full Name Input */}
              <View className="mb-5">
                <Text className="text-sm font-medium text-gray-700 mb-2">Full Name</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Email Input */}
              <View className="mb-5">
                <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Password Input */}
              <View className="mb-5">
                <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
                <View className="relative flex-row items-center border border-gray-300 rounded-lg">
                  <TextInput
                    className="flex-1 px-4 py-3 text-gray-800"
                    placeholder="Create a password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)} 
                    className="pr-4"
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#4B5563" 
                    />
                  </TouchableOpacity>
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters
                </Text>
              </View>

              {/* Confirm Password Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">Confirm Password</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                  placeholder="Confirm your password"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {/* Register Button */}
              <TouchableOpacity 
                className="bg-blue-600 py-3.5 rounded-lg flex-row justify-center items-center mb-5"
                onPress={handleRegister}
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold text-center text-base">Create Account</Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View className="flex-row justify-center mb-6">
                <Text className="text-gray-600">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text className="text-blue-600 font-medium">Sign in</Text>
                </TouchableOpacity>
              </View>

              {/* Terms and Conditions */}
              <Text className="text-xs text-gray-500 text-center mb-6">
                By creating an account, you agree to our{' '}
                <Text className="text-blue-600">Terms of Service</Text> and{' '}
                <Text className="text-blue-600">Privacy Policy</Text>
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;