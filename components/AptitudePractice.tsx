import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AptitudePracticeProps {
  title?: string;
  description?: string;
  buttonText?: string;
  practiceUrl?: string;
  className?: string;
}

const AptitudePractice = ({
  title = "Ready for some challenges?",
  description = "Improve your technical aptitude with practice tests",
  buttonText = "Start Aptitude Practice",
  practiceUrl = "https://learntech-seven.vercel.app/test",
  className = "",
}: AptitudePracticeProps) => {
  
  const handlePracticeAptitude = () => {
    Linking.openURL(practiceUrl);
  };

  return (
    <View className={`bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm ${className}`}>
      <View className="flex-row items-center mb-3">
        <View className="w-12 h-12 rounded-full bg-blue-100 justify-center items-center mr-4">
          <Ionicons name="bulb-outline" size={24} color="#3b82f6" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{title}</Text>
          <Text className="text-gray-600">{description}</Text>
        </View>
      </View>
      
      
      <TouchableOpacity 
        className="bg-blue-600 py-3 rounded-xl flex-row justify-center items-center"
        onPress={handlePracticeAptitude}
      >
        <Ionicons name="code-outline" size={20} color="white" style={{ marginRight: 8 }} />
        <Text className="text-white font-medium text-base">{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AptitudePractice;