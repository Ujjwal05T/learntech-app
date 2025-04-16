import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface HomeProgressProps {
  roadmapsData: any; // Change to any to handle different formats
  isLoading: boolean;
  isLargeScreen: boolean;
}

const HomeProgress = ({ roadmapsData, isLoading, isLargeScreen }: HomeProgressProps) => {
  const router = useRouter();

  // Process roadmapsData into a consistent array format
  const processedRoadmaps = React.useMemo(() => {
    // If it's already an array, return it
    if (Array.isArray(roadmapsData)) {
      return roadmapsData;
    }
    
    // If it's an object with keys representing roadmaps
    if (roadmapsData && typeof roadmapsData === 'object') {
      return Object.entries(roadmapsData).map(([key, value]) => ({
        id: key,
        type: key,
        name: (value as any).title || `${key.charAt(0).toUpperCase() + key.slice(1)} Development`,
        progress: (value as any).percentage || 0,
        lastUpdated: (value as any).lastUpdated || new Date().toISOString()
      }));
    }
    
    // Default to empty array
    return [];
  }, [roadmapsData]);

  // Find top roadmap (with highest percentage)
  const topRoadmap = processedRoadmaps.length > 0 
    ? processedRoadmaps.reduce((prev, current) => 
        ((prev.progress || 0) > (current.progress || 0)) ? prev : current
      ) 
    : null;

  // Loading state
  if (isLoading) {
    return (
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          Your Progress
        </Text>
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-500 mt-2">Loading progress...</Text>
        </View>
      </View>
    );
  }

  // Skip rendering if no roadmaps
  if (processedRoadmaps.length === 0) {
    return (
      <View className="w-full mb-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          Your Progress
        </Text>
        <View className="bg-white rounded-lg shadow-sm p-4 items-center">
          <Text className="text-gray-500">No roadmaps available yet.</Text>
          <TouchableOpacity 
            className="mt-3 bg-blue-50 px-4 py-2 rounded-lg"
            onPress={() => router.push('/(tabs)/roadmaps')}
          >
            <Text className="text-blue-600">Explore roadmaps</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="w-full mb-4">
      <View className="flex-row items-center mb-3">
        <FontAwesome5 name="chart-line" size={16} color="#3b82f6" />
        <Text className="text-lg font-semibold text-gray-800 ml-2">
          Your Progress
        </Text>
      </View>

      {/* Roadmaps Progress */}
      <View className="mb-6">
        {processedRoadmaps.map((roadmap, index) => {
          return (
            <TouchableOpacity
              key={roadmap.id || index}
              className="bg-white rounded-lg shadow-sm mb-3 p-4 border border-gray-100"
              onPress={() => router.push(`/roadmap/${roadmap.type || 'default'}`)}
            >
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <View className="bg-blue-50 rounded-full w-8 h-8 items-center justify-center mr-2">
                    <FontAwesome5 name="code" size={14} color="#3b82f6" />
                  </View>
                  <Text className="font-medium text-gray-800">
                    {roadmap.name || `${(roadmap.type || '').charAt(0).toUpperCase() + (roadmap.type || '').slice(1)} Development`}
                  </Text>
                </View>
                <Text className="font-semibold text-blue-600">
                  {Math.round(roadmap.progress || 0)}%
                </Text>
              </View>
              
              {/* Progress Bar */}
              <View className="h-2 bg-gray-200 rounded-full w-full overflow-hidden">
                <LinearGradient
                  colors={["#3b82f6", "#2563eb"]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  className="h-2 rounded-full"
                  style={{width: `${roadmap.progress || 0}%`}}
                />
              </View>
              
              {roadmap.lastUpdated && (
                <Text className="text-xs text-gray-500 mt-2">
                  Last updated: {new Date(roadmap.lastUpdated).toLocaleDateString()}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Top Roadmap Section */}
      {topRoadmap && (topRoadmap.progress || 0) > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <FontAwesome5 name="trophy" size={16} color="#f59e0b" />
            <Text className="text-lg font-semibold text-gray-800 ml-2">
              Top Roadmap
            </Text>
          </View>
          
          <TouchableOpacity
            className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-100"
            onPress={() => router.push(`/roadmap/${topRoadmap.type}`)}
          >
            <View className="items-center mb-3">
              <Text className="text-lg font-semibold text-amber-700">{topRoadmap.name}</Text>
              <Text className="text-amber-600 font-medium">
                {Math.round(topRoadmap.progress || 0)}% Complete
              </Text>
            </View>
            
            {/* Progress Bar */}
            <View className="h-2 bg-amber-100 rounded-full w-full overflow-hidden">
              <LinearGradient
                colors={["#f59e0b", "#d97706"]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                className="h-2 rounded-full"
                style={{width: `${topRoadmap.progress || 0}%`}}
              />
            </View>
            
            <Text className="text-center text-amber-600 mt-3">
              Keep going! You're making great progress.
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default HomeProgress;