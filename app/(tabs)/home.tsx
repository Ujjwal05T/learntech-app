import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
  RefreshControl, // Add this import
} from "react-native";
import React, { useState, useEffect } from "react";
import { useUserStore } from "../../store/user-store";
import HomeProgress from "../../components/HomeProgress";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeHero from "../../components/HomeHero";
import {WebView} from "react-native-webview";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const HomeScreen = () => {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state
  const [roadmapsData, setRoadmapsData] = useState([]);
  const { user } = useUserStore();

  // Function to fetch user learning data
  const fetchUserLearningData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const token = await AsyncStorage.getItem("token");

      // Fetch roadmaps data
      const roadmapsResponse = await axios.get(`${API_URL}/progress/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (roadmapsResponse.data.success) {
        setRoadmapsData(roadmapsResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Reset refreshing state
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchUserLearningData();
  };

  // Initial data loading
  useEffect(() => {
    fetchUserLearningData();
  }, []);

  // Determine if we're on a tablet/desktop
  const isLargeScreen = width >= 768;

  // Loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView
        className="flex-1 justify-center items-center bg-white"
        style={{
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-3 text-gray-500">Loading your progress...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" >
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <ScrollView 
        className="flex-1 p-4" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3b82f6"]} // Android
            tintColor="#3b82f6" // iOS
            title="Pull to refresh" // iOS
            titleColor="#3b82f6" // iOS
          />
        }
      >
        {/* Enhanced Header */}
        <View className="bg-white px-4 py-1 flex-row items-center rounded-xl mb-6">
          <Text className="text-xl font-medium text-blue-500 mb-1">
            {new Date().getHours() < 12 
              ? "Good morning" 
              : new Date().getHours() < 18 
                ? "Good afternoon" 
                : "Good evening"}
          </Text>
          <View className="px-2">
            <Text className="text-2xl font-bold text-gray-800">
              {user?.username || "User"}
            </Text>
          {isLargeScreen && (
            <Text className="text-gray-500 ml-2 text-lg">
              | Let's continue your learning journey
            </Text>
          )}
          </View>
        </View>
        
        {/* Show a small refreshing indicator when in refresh state */}
        {refreshing && (
          <View className="items-center mb-2">
            <Text className="text-gray-500 text-sm">Updating your dashboard...</Text>
          </View>
        )}

        <HomeHero />
        <HomeProgress 
          roadmapsData={roadmapsData} 
          isLoading={loading || refreshing}
          isLargeScreen={isLargeScreen}
        />

        {/* Updates Section */}
        <View className="mt-8 mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Recent Updates</Text>
          
          {/* Update Items */}
          <View className="space-y-4 mb-2">
            <View className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-2">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-semibold text-blue-500">New Course Added</Text>
                <Text className="text-xs text-gray-500">2 days ago</Text>
              </View>
              <Text className="text-gray-700">Introduction to AI and Machine Learning course is now available!</Text>
            </View>
            
            <View className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-2">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-semibold text-blue-500">Achievement Unlocked</Text>
                <Text className="text-xs text-gray-500">1 week ago</Text>
              </View>
              <Text className="text-gray-700">You've completed 5 modules in the Web Development track!</Text>
            </View>
            
            <View className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-2">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-semibold text-blue-500">Platform Update</Text>
                <Text className="text-xs text-gray-500">2 weeks ago</Text>
              </View>
              <Text className="text-gray-700">New features added: Progress tracking and personalized recommendations.</Text>
            </View>
            
            {isLargeScreen && (
              <View className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="font-semibold text-blue-500">Community Highlight</Text>
                  <Text className="text-xs text-gray-500">3 weeks ago</Text>
                </View>
                <Text className="text-gray-700">Join our monthly webinar on advanced coding techniques this Friday!</Text>
              </View>
            )}
          </View>
      <WebView
        className="w-full "
        style={{ height: 250, borderRadius: 12, overflow: "hidden" }}
        source={{ uri: 'https://www.youtube.com/embed/a4na2opArGY?si=HCqLFvi1XiqU-v8t' }}
        allowsFullscreenVideo
        javaScriptEnabled
      />
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;