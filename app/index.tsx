import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StatusBar, Platform } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const Home = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="w-full p-6 border-b border-gray-100">
          <Text className="text-3xl font-bold text-blue-600">LearnTech</Text>
          <Text className="text-base text-gray-600 mt-1">
            Your gateway to tech mastery
          </Text>
        </View>

        <View className="flex-1 px-5 py-6">
          {/* App Description */}
          <View className="mb-8">
            <Text className="text-xl font-semibold text-gray-800 mb-3">Welcome!</Text>
            <Text className="text-gray-700 mb-2 text-sm leading-5">
              LearnTech helps you master the latest technologies through interactive learning, expert mentoring, and a supportive community.
            </Text>
            <Text className="text-gray-700 text-sm leading-5">
              Whether you're a beginner or a pro, we have resources tailored to your skill level.
            </Text>
          </View>

          {/* Features List */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Our Platform Features:</Text>
            
            <View className="flex-row flex-wrap justify-between">
              {[
                { title: "Interactive Tutorials", icon: "📚" },
                { title: "Live Mentoring", icon: "👨‍💻" },
                { title: "Project Learning", icon: "🚀" },
                { title: "Community Support", icon: "🌐" }
              ].map((item, index) => (
                <View key={index} className="w-[48%] border border-gray-100 rounded-lg p-3 mb-3">
                  <Text className="text-2xl mb-1">{item.icon}</Text>
                  <Text className="text-gray-800 font-medium text-sm">{item.title}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between border border-gray-100 rounded-lg p-4 mb-8">
            {[
              { count: "50K+", label: "Students" },
              { count: "200+", label: "Courses" },
              { count: "95%", label: "Success Rate" }
            ].map((item, index) => (
              <View key={index} className="items-center">
                <Text className="text-lg font-bold text-blue-600">{item.count}</Text>
                <Text className="text-gray-600 text-xs">{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <View className="space-y-3 mb-8">
            <TouchableOpacity 
              className="bg-blue-600 py-3 rounded-lg flex-row justify-center items-center"
              onPress={() => router.push('/login')}
              activeOpacity={0.7}
            >
              <Text className="text-white font-semibold text-center text-base">Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-white border border-blue-600 py-3 rounded-lg flex-row justify-center items-center mt-3"
              onPress={() => router.push('/register')}
              activeOpacity={0.7}
            >
              <Text className="text-blue-600 font-semibold text-center text-base">Register</Text>
            </TouchableOpacity>
          </View>
          
          {/* Footer */}
          <View className="items-center mt-16">
            <Text className="text-gray-400 text-xs">© 2025 LearnTech. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Home