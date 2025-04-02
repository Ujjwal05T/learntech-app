import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StatusBar, 
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const VerifyEmail = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  
  // OTP Input State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Resend Email State
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown for resend button
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Handle OTP input
  const handleOtpChange = (value: string, index: number) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;

    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace key for OTP input
  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    // Check if OTP is complete
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setVerificationMessage({
        type: 'error',
        text: 'Please enter the complete 6-digit verification code'
      });
      return;
    }

    setIsVerifying(true);
    setVerificationMessage(null);

    try {
      const response = await axios.post(`${API_URL}/auth/verify`, {
        email,
        otp: otpString
      });

      if (response.data.success) {
        setVerificationMessage({
          type: 'success',
          text: 'Email verified successfully!'
        });
        
        // Redirect to login after short delay
        setTimeout(() => {
          router.replace('/login');
        }, 1500);
      } else {
        setVerificationMessage({
          type: 'error',
          text: response.data.message || 'Invalid verification code. Please try again.'
        });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setVerificationMessage({
          type: 'error',
          text: err.response?.data?.message || 'Failed to verify email. Please try again.'
        });
      } else {
        setVerificationMessage({
          type: 'error',
          text: 'Something went wrong. Please try again later.'
        });
        console.error('Verification error:', err);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!email || isResending || !canResend) return;
    
    setIsResending(true);
    setResendMessage(null);
    
    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification`, { email });
      
      if (response.data.success) {
        setResendMessage({ 
          type: 'success', 
          text: 'Verification code sent! Please check your inbox.' 
        });
        setCanResend(false);
        setCountdown(60);
        
        // Clear current OTP when resending
        setOtp(['', '', '', '', '', '']);
      } else {
        setResendMessage({ 
          type: 'error', 
          text: response.data.message || 'Failed to resend verification code.' 
        });
      }
    } catch (err) {
      setResendMessage({ 
        type: 'error', 
        text: 'Something went wrong. Please try again later.' 
      });
      console.error('Resend verification error:', err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 px-5 justify-center items-center py-10">
              <View className="w-16 h-16 bg-blue-100 rounded-full justify-center items-center mb-6">
                <Ionicons name="shield-checkmark-outline" size={32} color="#3b82f6" />
              </View>
              
              <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
                Verify Your Email
              </Text>
              
              <Text className="text-gray-600 text-center mb-8 max-w-xs">
                We've sent a verification code to{' '}
                <Text className="font-semibold">{email || 'your email'}</Text>. 
                Please enter the 6-digit code below.
              </Text>
              
              {/* Verification Messages */}
              {verificationMessage && (
                <View 
                  className={`mb-6 p-3 rounded-lg w-full ${
                    verificationMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <Text 
                    className={
                      verificationMessage.type === 'success' ? 'text-green-600 text-sm' : 'text-red-600 text-sm'
                    }
                  >
                    {verificationMessage.text}
                  </Text>
                </View>
              )}
              
              {/* OTP Input */}
              <View className="w-full mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter Verification Code
                </Text>
                <View className="flex-row justify-between w-full">
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => inputRefs.current[index] = ref}
                      className="h-12 w-12 border border-gray-300 rounded-lg text-center text-lg font-bold text-gray-800"
                      maxLength={1}
                      keyboardType="number-pad"
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                    />
                  ))}
                </View>
              </View>
              
              {/* Verify Button */}
              <TouchableOpacity 
                className="w-full py-3.5 rounded-lg flex-row justify-center items-center mb-6 bg-blue-600"
                onPress={handleVerifyOtp}
                activeOpacity={0.7}
                disabled={isVerifying || otp.join('').length !== 6}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-semibold text-center text-base">
                    Verify Code
                  </Text>
                )}
              </TouchableOpacity>
              
              {/* Resend Message */}
              {resendMessage && (
                <View 
                  className={`mb-6 p-3 rounded-lg w-full ${
                    resendMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <Text 
                    className={
                      resendMessage.type === 'success' ? 'text-green-600 text-sm' : 'text-red-600 text-sm'
                    }
                  >
                    {resendMessage.text}
                  </Text>
                </View>
              )}
              
              {/* Resend Button */}
              <View className="mb-4 mt-2 w-full">
                <Text className="text-gray-500 text-center text-sm mb-2">
                  Didn't receive the code?
                </Text>
                <TouchableOpacity 
                  className={`w-full py-2.5 rounded-lg flex-row justify-center items-center ${
                    canResend ? 'bg-gray-100 border border-gray-200' : 'bg-gray-50 border border-gray-100'
                  }`}
                  onPress={handleResendVerification}
                  activeOpacity={0.7}
                  disabled={isResending || !canResend}
                >
                  {isResending ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <Text 
                      className={`text-center text-sm font-medium ${
                        canResend ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      {canResend 
                        ? 'Resend Verification Code' 
                        : `Resend in ${countdown}s`
                      }
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Back to Login Link */}
              <TouchableOpacity 
                className="mt-4 flex-row items-center"
                onPress={() => router.push('/login')}
              >
                <Feather name="arrow-left" size={16} color="#3b82f6" style={{ marginRight: 4 }} />
                <Text className="text-blue-600 font-medium">Back to Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyEmail;