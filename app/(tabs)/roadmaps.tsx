import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import roadmapsData from '../../data/index.json';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RoadmapsScreen() {
  const { width } = useWindowDimensions();
  
  // Calculate number of columns based on screen width
  const getNumColumns = () => {
    if (width >= 1024) return 4;  // Large screens
    if (width >= 768) return 3;   // Medium screens
    if (width >= 600) return 2;   // Small tablets
    return 1;                     // Phones
  };

  const getDifficultyColor = (difficulty:string) => {
    switch(difficulty.toLowerCase()) {
      case 'beginner': return {bg: 'bg-green-100', text: 'text-green-600'};
      case 'intermediate': return {bg: 'bg-yellow-100', text: 'text-yellow-600'};
      case 'advanced': return {bg: 'bg-red-100', text: 'text-red-600'};
      default: return {bg: 'bg-blue-100', text: 'text-blue-600'};
    }
  };

  // Helper function to format prerequisites
  const formatPrerequisites = (prerequisites: string) => {
    if (!prerequisites) return [];
    return prerequisites.split(',').map(item => item.trim());
  };

  const renderRoadmapCard = ({ item }: any) => {
    const difficultyStyle = getDifficultyColor(item.difficulty);
    const prerequisites = formatPrerequisites(item.preRequisites);
    
    return (
      <TouchableOpacity
        className="flex-1 m-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        activeOpacity={0.7}
        onPress={() => router.push(`/roadmap/${item.slug}`)}
      >
        {/* Card Header Gradient */}
        <LinearGradient
          colors={['#3b82f680', '#8b5cf680']} 
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          className="h-1.5"
        />
        
        <View className="p-4 flex-1">
          <View className="flex-row justify-between mb-3">
            <View className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
              <Ionicons name="time-outline" size={12} color="#2563eb" style={{marginRight: 4}} />
              <Text className="text-blue-600 text-xs font-medium">{item.time}</Text>
            </View>
            <View className={`${difficultyStyle.bg} px-3 py-1 rounded-full flex-row items-center`}>
              <Ionicons name="speedometer-outline" size={12} color={difficultyStyle.text === 'text-blue-600' ? '#2563eb' : difficultyStyle.text === 'text-green-600' ? '#16a34a' : difficultyStyle.text === 'text-yellow-600' ? '#ca8a04' : '#dc2626'} style={{marginRight: 4}} />
              <Text className={`${difficultyStyle.text} text-xs font-medium`}>{item.difficulty}</Text>
            </View>
          </View>
          
          <Text className="text-xl font-semibold text-gray-800 mb-2">{item.title}</Text>
          <Text className="text-gray-600 text-sm leading-5 flex-1">{item.description}</Text>
          
          {/* Enhanced Prerequisites Section */}
          <View className="mt-4 pt-4 border-t border-gray-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="list-outline" size={16} color="#374151" style={{marginRight: 6}} />
              <Text className="text-gray-700 font-medium">Prerequisites:</Text>
            </View>
            
            {prerequisites.length > 0 ? (
              <View className="flex-row flex-wrap">
                {prerequisites.map((prereq, index) => (
                  <View key={index} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 mr-2 mb-2 flex-row items-center">
                    <Ionicons name="checkmark-circle-outline" size={12} color="#4b5563" style={{marginRight: 4}} />
                    <Text className="text-gray-600 text-xs">{prereq}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500 text-sm italic">No prerequisites needed</Text>
            )}
          </View>
          
          {/* Card Footer */}
          <View className="mt-4 flex-row justify-end">
            <View className="bg-gray-100 px-3 py-1.5 rounded-full flex-row items-center">
              <Ionicons name="arrow-forward" size={14} color="#4b5563" />
              <Text className="text-gray-600 text-xs font-medium ml-1">Get Started</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeaderComponent = () => (
    <>
      {/* Header Section */}
      <View className="w-full p-3 border-b border-gray-100">
        <Text className="text-3xl font-bold text-blue-600">Tech Roadmaps</Text>
        <Text className="text-base text-gray-600 mt-1">
          Your path to tech mastery
        </Text>
      </View>
      
      {/* Introduction */}
      <View className="px-5 py-4 mb-4">
        <View className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <Text className="text-gray-700 text-sm leading-5">
            Follow these curated roadmaps to systematically learn new technologies and skills.
            Each roadmap provides a structured path from basics to advanced concepts.
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" >
      <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
      
      {/* Roadmaps List */}
      <FlatList
        data={roadmapsData.roadmaps}
        renderItem={renderRoadmapCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={getNumColumns()}
        key={getNumColumns()}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={() => (
          <View className="items-center py-6 mt-4">
            <Text className="text-gray-400 text-xs">Updated regularly with the latest tech trends</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}