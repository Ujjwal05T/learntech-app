import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, AppState, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LearningItem {
  level: string;
  tech: string;
  topic: string;
  item: string;
  roadmapSlug: string;
  roadmapTitle: string;
}

interface RecommendationData {
  activeRoadmaps: number;
  lastCompleted: LearningItem | null;
  recommendations: LearningItem[];
  message: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const HomeHero = () => {
  const router = useRouter();
  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  // Cache expiration time (5 minutes)
  const CACHE_EXPIRY = 5 * 60 * 1000;

   // Fetch recommendations function
   const fetchRecommendations = async (token: string, forceRefresh = false) => {
    try {
      // If we have data and it's not a forced refresh, check cache age
      if (!forceRefresh && recommendationData && lastFetchTime) {
        const cacheAge = Date.now() - lastFetchTime;
        // If cache is fresh (less than 5 minutes old), don't refresh
        if (cacheAge < CACHE_EXPIRY) {
          // console.log('Using cached recommendations, age:', Math.round(cacheAge / 1000), 'seconds');
          return;
        }
      }

      // Only show loading if it's the initial load
      if (!recommendationData) {
        setIsLoading(true);
      }

      // console.log('Fetching fresh recommendations...');
      const response = await axios.get(
        `${API_URL}/progress/recommendations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // console.log('Got new recommendations data');
        setRecommendationData(response.data.data);
        setLastFetchTime(Date.now());
        setError(null);
      } else {
        setError('Could not load recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load learning recommendations');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

   // Initial data load
   useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
      
      if (token) {
        fetchRecommendations(token);
      } else {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshOnFocus = async () => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // Force refresh when coming back to this screen
          fetchRecommendations(token, true);
        }
      };

      refreshOnFocus();
    }, [])
  );

   // Pull-to-refresh handler
   const handleRefresh = async () => {
    setIsRefreshing(true);
    const token = await AsyncStorage.getItem('token');
    if (token) {
      fetchRecommendations(token, true);
    } else {
      setIsRefreshing(false);
    }
  };

  // Add a listener for events that should trigger a refresh
  useEffect(() => {
    // Listen for app state changes (coming back from background)
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          fetchRecommendations(token, true);
        }
      }
    });

    // Important: Clean up the subscription
    return () => {
      subscription.remove();
    };
  }, []);

  // If user is not authenticated or there's no data and we're not loading
  if ((!isAuthenticated || !recommendationData) && !isLoading) {
    return (
      <View className="mb-6">
        <View className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Ionicons name="bulb-outline" size={22} color="#3b82f6" />
            <Text className="text-xl font-bold text-gray-800 ml-2">Start Learning</Text>
          </View>
          <Text className="text-gray-600">
            Explore our roadmaps and start your learning journey today!
          </Text>
          <TouchableOpacity
            className="mt-4 bg-blue-50 rounded-lg py-2 px-4 self-start"
            onPress={() => router.push('/(tabs)/roadmaps')}
          >
            <Text className="text-blue-600 font-medium">Explore Roadmaps</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="mb-6">
        <View className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <View className="flex-row justify-center items-center py-4">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="ml-3 text-gray-600">Loading your recommendations...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="mb-6">
        <View className="bg-red-50 rounded-xl p-6 border border-red-100">
          <View className="flex-row items-center mb-2">
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text className="text-red-500 font-medium ml-2">Error</Text>
          </View>
          <Text className="text-gray-700">{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={['#3B82F6']}
          tintColor="#3B82F6"
        />
      }
      showsVerticalScrollIndicator={false}
      className="flex-1"
    >
    <View className="mb-6 space-y-4">
      {/* Last Completed Section */}
      {recommendationData?.lastCompleted ? (
        <View className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-3">
          <View className="flex-row items-center mb-4">
            <Ionicons name="checkmark-circle" size={22} color="#3B82F6" />
            <Text className="text-xl font-bold text-gray-800 ml-2">Last Completed</Text>
          </View>
          
          <TouchableOpacity 
            className="bg-gray-50 rounded-lg p-4 border border-gray-100 active:bg-gray-100"
            onPress={() => router.push(`/roadmap/${recommendationData.lastCompleted?.roadmapSlug}`)}
          >
            <View>
              <Text className="text-lg text-gray-800 font-medium">{recommendationData.lastCompleted?.item}</Text>
              <Text className="text-sm text-gray-600 mt-1">
                {recommendationData.lastCompleted?.tech} • {recommendationData.lastCompleted?.topic}
              </Text>
              <Text className="text-xs text-blue-600 mt-1">
                {recommendationData.lastCompleted?.roadmapTitle}
              </Text>
            </View>
            <View className="mt-3">
              <View className="self-start bg-green-100 rounded-full px-3 py-1">
                <Text className="text-sm text-green-600 font-medium">Completed</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Recommended Next Section */}
      {recommendationData?.recommendations?.length && recommendationData?.recommendations?.length > 0 ? (
        <View className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <FontAwesome5 name="lightbulb" size={18} color="#8B5CF6" />
            <Text className="text-xl font-bold text-gray-800 ml-2">Recommended Next</Text>
          </View>
          
          <View className="mb-4 px-2">
            <Text className="text-gray-600 italic">{recommendationData?.message}</Text>
          </View>
          
          <View className="space-y-3">
            {recommendationData?.recommendations.map((recommendation, index) => (
              <TouchableOpacity 
                key={index}
                className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-3 active:bg-gray-100"
                onPress={() => router.push(`/roadmap/${recommendation.roadmapSlug}`)}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-gray-800 font-medium">{recommendation.item}</Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      {recommendation.tech} • {recommendation.topic}
                    </Text>
                    <Text className="text-xs text-purple-600 mt-1">
                      {recommendation.roadmapTitle}
                    </Text>
                  </View>
                  <View className="bg-blue-50 rounded-lg py-1 px-3">
                    <Text className="text-sm text-blue-600">Start Now</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          {recommendationData?.activeRoadmaps > 0 && (
            <View className="mt-4 items-center">
              <Text className="text-sm text-gray-500">
                You have {recommendationData?.activeRoadmaps} active roadmap
                {recommendationData?.activeRoadmaps !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
    </ScrollView>
  );
};

export default HomeHero;