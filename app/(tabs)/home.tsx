import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useUserStore } from "../../store/user-store";
import HomeProgress from "../../components/HomeProgress";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeHero from "../../components/HomeHero";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const HomeScreen = () => {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [roadmapsData, setRoadmapsData] = useState([]);
  const { user } = useUserStore();

  // Fetch user learning data
  useEffect(() => {
    const fetchUserLearningData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");

        // Fetch roadmaps data
        const roadmapsResponse = await axios.get(`${API_URL}/progress/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (roadmapsResponse.data.success) {
          setRoadmapsData(roadmapsResponse.data.data);
          // console.log(roadmapsData)
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchUserLearningData();
  }, []);

  // Determine if we're on a tablet/desktop
  const isLargeScreen = width >= 768;

  // Loading state
  if (loading) {
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
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Enhanced Header */}
        <View className="bg-white px-4 py-1 flex-row items-center rounded-xl shadow-sm mb-6">
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
        <HomeHero />
        <HomeProgress 
          roadmapsData={roadmapsData} 
          isLoading={loading}
          isLargeScreen={isLargeScreen}
        />
        {/* Updates Section */}
        <View className="mt-2 mb-4 pb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">Recent Updates</Text>
            {/* <Text className="text-blue-500 font-medium">View All</Text> */}
          </View>
          
          <View className="bg-white rounded-xl shadow-sm p-4 mb-3">
            <View className="flex-row justify-between items-start">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="font-medium text-gray-800">New Course Available</Text>
              </View>
              <Text className="text-xs text-gray-500">2h ago</Text>
            </View>
            <Text className="text-gray-600 mt-1">Introduction to Machine Learning has been added to your roadmap.</Text>
          </View>
          
          <View className="bg-white rounded-xl shadow-sm p-4 mb-3">
            <View className="flex-row justify-between items-start">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                <Text className="font-medium text-gray-800">Achievement Unlocked</Text>
              </View>
              <Text className="text-xs text-gray-500">Yesterday</Text>
            </View>
            <Text className="text-gray-600 mt-1">You've completed 5 lessons in a row! Keep up the good work.</Text>
          </View>
          
          <View className="bg-white rounded-xl shadow-sm p-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
                <Text className="font-medium text-gray-800">Weekly Goal Reminder</Text>
              </View>
              <Text className="text-xs text-gray-500">2d ago</Text>
            </View>
            <Text className="text-gray-600 mt-1">You're 70% toward your weekly learning goal. Just a few more lessons!</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;