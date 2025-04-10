import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useUserStore } from "../../store/user-store";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, formatDistance } from "date-fns";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    averageCompletion: 0,
    completedRoadmaps: 0,
    inProgressRoadmaps: 0,
    totalRoadmaps: 0,
  });

  const [roadmapsData, setRoadmapsData] = useState({
    backend: null,
    frontend: null,
  });

  // Placeholder data for parts not included in your API
  const [userData, setUserData] = useState({
    streak: 5,
    recommendations: [
      {
        id: 1,
        title: "TypeScript Basics",
        category: "Web Development",
        level: "Beginner",
      },
      {
        id: 2,
        title: "React Native Navigation",
        category: "Mobile Development",
        level: "Intermediate",
      },
      {
        id: 3,
        title: "Node.js APIs",
        category: "Backend",
        level: "Intermediate",
      },
    ],
  });

  // Fetch user learning data
  useEffect(() => {
    const fetchUserLearningData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");

        // Fetch stats data
        const statsResponse = await axios.get(`${API_URL}/progress/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statsResponse.data.success) {
          setStatsData(statsResponse.data.data);
        }

        // Fetch roadmaps data
        const roadmapsResponse = await axios.get(`${API_URL}/progress/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (roadmapsResponse.data.success) {
          setRoadmapsData(roadmapsResponse.data.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchUserLearningData();
  }, []);

  // Format relative time from ISO string
  const formatRelativeTime = (isoString: any) => {
    try {
      return formatDistance(new Date(isoString), new Date(), {
        addSuffix: true,
      });
    } catch (e) {
      return "recently";
    }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Create recent activity items from roadmaps data

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
        <Text className="mt-3 text-gray-500">Loading your dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Greeting */}
        <View className="px-5 pt-4 pb-2 bg-white border-b border-gray-100">
          <Text className="text-lg text-gray-600">{getGreeting()},</Text>
          <Text className="text-2xl font-bold text-gray-800">
            {user?.username || "Student"}
          </Text>
        </View>

        {/* Dashboard Layout - Responsive Grid */}
        <View className={`p-4 ${isLargeScreen ? "flex-row flex-wrap" : ""}`}>
          {/* Learning Overview Card */}
          <View
            className={`bg-white rounded-xl shadow-sm overflow-hidden mb-4 ${
              isLargeScreen ? "w-[49%] mr-[2%]" : "w-full"
            }`}>
            <LinearGradient
              colors={["#3b82f6", "#2563eb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-5 py-4">
              <Text className="text-lg font-semibold text-white">
                Your Learning Overview
              </Text>
            </LinearGradient>

            <View className="p-4">
              <View className="flex-row justify-between mb-4">
                <View className="items-center">
                  <Text className="text-3xl font-bold text-blue-600">
                    {statsData.averageCompletion}%
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Overall Progress
                  </Text>
                </View>

                <View className="items-center">
                  <Text className="text-3xl font-bold text-green-600">
                    {statsData.inProgressRoadmaps}
                  </Text>
                  <Text className="text-sm text-gray-600">In Progress</Text>
                </View>

                <View className="items-center">
                  <Text className="text-3xl font-bold text-purple-600">
                    {statsData.completedRoadmaps}
                  </Text>
                  <Text className="text-sm text-gray-600">Completed</Text>
                </View>
              </View>

              <TouchableOpacity
                className="bg-blue-50 flex-row items-center p-3 rounded-lg border border-blue-100"
                onPress={() => router.push("/(tabs)/roadmaps")}>
                <MaterialCommunityIcons
                  name="lightbulb-on"
                  size={20}
                  color="#3b82f6"
                />
                <Text className="text-blue-600 font-medium ml-2">
                  View Roadmaps
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#3b82f6"
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Streak Card */}
          <View
            className={`bg-white rounded-xl shadow-sm overflow-hidden mb-4 ${
              isLargeScreen ? "w-[49%]" : "w-full"
            }`}>
            <LinearGradient
              colors={["#f97316", "#ea580c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-5 py-4">
              <Text className="text-lg font-semibold text-white">
                Your Performance
              </Text>
            </LinearGradient>

            <View className="p-4 items-center">
              <View className="bg-orange-50 w-24 h-24 rounded-full justify-center items-center border-4 border-orange-100 mb-3">
                <Text className="text-4xl font-bold text-orange-500">
                  {userData.streak}
                </Text>
                <Text className="text-sm text-orange-600">days</Text>
              </View>
              <Text className="text-gray-700 text-center">
                You've completed {statsData.completedRoadmaps} of{" "}
                {statsData.totalRoadmaps} roadmaps! Keep it up!
              </Text>
            </View>
          </View>
          {/* Recent Activity Section - Now Roadmaps */}
          <View className="w-full mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                Your Roadmaps
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/roadmaps")}>
                <Text className="text-blue-600">See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}>
              {/* Frontend Roadmap Card */}
              <TouchableOpacity
                className="bg-white rounded-xl shadow-sm mr-3 overflow-hidden"
                style={{ width: isLargeScreen ? 280 : 220 }}
                onPress={() => router.push("/roadmap/frontend")}>
                <LinearGradient
                  colors={["#3b82f6", "#2563eb"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-28 justify-center items-center">
                  <FontAwesome5 name="laptop-code" size={36} color="#ffffff" />
                </LinearGradient>
                <View className="p-3">
                  <Text className="font-medium text-gray-800 mb-1">
                    Frontend Development
                  </Text>
                  <View className="flex-row justify-between items-center">
                    <View className="bg-blue-50 rounded-full px-2 py-0.5">
                      <Text className="text-xs text-blue-600">Web</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Backend Roadmap Card */}
              <TouchableOpacity
                className="bg-white rounded-xl shadow-sm mr-3 overflow-hidden"
                style={{ width: isLargeScreen ? 280 : 220 }}
                onPress={() => router.push("/roadmap/backend")}>
                <LinearGradient
                  colors={["#4f46e5", "#4338ca"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-28 justify-center items-center">
                  <FontAwesome5 name="server" size={36} color="#ffffff" />
                </LinearGradient>
                <View className="p-3">
                  <Text className="font-medium text-gray-800 mb-1">
                    Backend Development
                  </Text>
                  <View className="flex-row justify-between items-center">
                    <View className="bg-indigo-50 rounded-full px-2 py-0.5">
                      <Text className="text-xs text-indigo-600">Server</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* DevOps Roadmap Card */}
              <TouchableOpacity
                className="bg-white rounded-xl shadow-sm mr-3 overflow-hidden"
                style={{ width: isLargeScreen ? 280 : 220 }}
                onPress={() => router.push("/roadmap/devops")}>
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-28 justify-center items-center">
                  <FontAwesome5 name="docker" size={36} color="#ffffff" />
                </LinearGradient>
                <View className="p-3">
                  <Text className="font-medium text-gray-800 mb-1">DevOps</Text>
                  <View className="flex-row justify-between items-center">
                    <View className="bg-green-50 rounded-full px-2 py-0.5">
                      <Text className="text-xs text-green-600">Operations</Text>
                    </View>
                    <Text className="text-xs text-gray-500">Not started</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Mobile Development Roadmap */}
              <TouchableOpacity
                className="bg-white rounded-xl shadow-sm mr-3 overflow-hidden"
                style={{ width: isLargeScreen ? 280 : 220 }}
                onPress={() => router.push("/roadmap/mobile")}>
                <LinearGradient
                  colors={["#f97316", "#ea580c"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-28 justify-center items-center">
                  <FontAwesome5 name="mobile-alt" size={36} color="#ffffff" />
                </LinearGradient>
                <View className="p-3">
                  <Text className="font-medium text-gray-800 mb-1">
                    Mobile Development
                  </Text>
                  <View className="flex-row justify-between items-center">
                    <View className="bg-orange-50 rounded-full px-2 py-0.5">
                      <Text className="text-xs text-orange-600">Apps</Text>
                    </View>
                    <Text className="text-xs text-gray-500">Not started</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
       
          {/* Recommended For You */}
          <View className="w-full mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                Recommended For You
              </Text>
              <TouchableOpacity>
                <Text className="text-blue-600">See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}>
              {userData.recommendations.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm mr-3 overflow-hidden"
                  style={{ width: isLargeScreen ? 280 : 220 }}
                  onPress={() => router.push(`/course/${item.id}`)}>
                  <View className="h-28 bg-gray-200">
                    {/* Replace with actual image component */}
                    <View className="w-full h-full bg-blue-100 justify-center items-center">
                      <FontAwesome5
                        name="laptop-code"
                        size={36}
                        color="#3b82f6"
                      />
                    </View>
                  </View>
                  <View className="p-3">
                    <Text className="font-medium text-gray-800 mb-1">
                      {item.title}
                    </Text>
                    <View className="flex-row justify-between">
                      <View className="bg-blue-50 rounded-full px-2 py-0.5">
                        <Text className="text-xs text-blue-600">
                          {item.category}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-500">
                        {item.level}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Learning Tips */}
          <View className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-blue-100 mb-6">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons
                name="lightbulb-on"
                size={24}
                color="#4f46e5"
              />
              <Text className="text-lg font-semibold text-indigo-700 ml-2">
                Learning Tip
              </Text>
            </View>
            <Text className="text-indigo-900">
              {statsData.averageCompletion > 90
                ? "Great job on your roadmaps! Consider exploring new technology paths to expand your skills."
                : "Consistent daily practice leads to better retention. Try dedicating 25 minutes each day to your learning."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
