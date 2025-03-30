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

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Implement login logic here
    console.log('Login with:', email, password);
    // Navigate to home on successful login
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
              <Text className="text-2xl font-bold text-gray-800">Welcome back</Text>
              <Text className="text-base text-gray-600 mt-1">
                Sign in to continue your learning journey
              </Text>
            </View>

            {/* Login Form */}
            <View className="flex-1 px-5 pt-6">
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
                    placeholder="Enter your password"
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
              </View>

              {/* Forgot Password */}
              <TouchableOpacity className="mb-6 self-end">
                <Text className="text-blue-600 text-sm">Forgot password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity 
                className="bg-blue-600 py-3.5 rounded-lg flex-row justify-center items-center mb-5"
                onPress={handleLogin}
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold text-center text-base">Sign In</Text>
              </TouchableOpacity>

              {/* Register Link */}
              <View className="flex-row justify-center mb-6">
                <Text className="text-gray-600">Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text className="text-blue-600 font-medium">Sign up </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/home')}>
                  <Text className="text-blue-600 font-medium">Home</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;