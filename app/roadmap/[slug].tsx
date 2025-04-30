import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import roadmapData from '../../data/data.json';
import slugData from '../../data/index.json';
import axios from 'axios';
import Modal from 'react-native-modal';

const { width } = Dimensions.get('window');

// Interface for tracking item completion
interface CompletedItems {
  [level: string]: {
    [tech: string]: {
      [topic: string]: {
        [item: string]: boolean;
      };
    };
  };
}

// API URL - Replace with your actual API URL
const API_URL = process.env.EXPO_PUBLIC_API_URL; // Replace with your actual API URL

export default function RoadmapDetailScreen() {
  // Get the slug from the URL
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const navigation = useNavigation();
  
  // State initialization
  const [isLoaded, setIsLoaded] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [completedItems, setCompletedItems] = useState<CompletedItems>({});
  const [isSaving, setIsSaving] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [expandedTech, setExpandedTech] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<{ [key: string]: boolean }>({});
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<{ level: string, tech: string, topic: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Animation refs
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Check if user is authenticated
  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsAuthenticated(!!token);
    return !!token;
  };

  // Get token for API calls
  const getToken = async () => {
    return await AsyncStorage.getItem('token');
  };

   // Hide header when loading
   useEffect(() => {
    if (!isLoaded) {
      // Hide header during loading
      navigation.setOptions({
        headerShown: false
      });
    } else if (response) {
      // Show header with title when loaded
      navigation.setOptions({
        headerShown: true,
        title: `${response.title} Roadmap`,
        headerTitleStyle: {
          color: '#3b82f6',
          fontWeight: 'bold',
        },
      });
    }
  }, [isLoaded, response, navigation]);
  // Load data and state on mount
  useEffect(() => {
    async function loadData() {
      if (slug) {
        try {
          // Check auth status
          await checkAuth();
          
          // Load roadmap structure from local data
          const currentRoadmap = roadmapData[slug as keyof typeof roadmapData];
          const currentResponse = slugData.roadmaps.find(
            (title) => title.slug === slug
          );

          setRoadmap(currentRoadmap);
          setResponse(currentResponse);

          // Only fetch progress if user is authenticated
          if (await checkAuth()) {
            try {
              const token = await getToken();
              // console.log(`${API_URL}/progress/${slug}`)
              const response = await axios.get(
                `${API_URL}/progress/${slug}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.data.success) {
                setCompletedItems(response.data.data.completedItems);
                
                // Animate progress bar
                const progressPercentage = calculateOverallProgress(response.data.data.completedItems);
                Animated.timing(progressAnim, {
                  toValue: progressPercentage / 100,
                  duration: 800,
                  useNativeDriver: false
                }).start();
              }
            } catch (error) {
              console.error("Error fetching progress from API:", error);
              setSyncError("Failed to load your progress from the server");
              setTimeout(() => setSyncError(null), 5000);
            }
          }
        } catch (error) {
          console.error("Error loading roadmap data:", error);
        } finally {
          setIsLoaded(true);
        }
      }
    }

    loadData();
  }, [slug]);

  // Save progress when it changes (only for authenticated users)
  useEffect(() => {
    if (isLoaded && isAuthenticated && Object.keys(completedItems).length > 0) {
      // Debounce API saving
      const saveToAPI = async () => {
        try {
          setIsSaving(true);
          setSyncError(null);
          
          const token = await getToken();
          await axios.post(
            `${API_URL}/progress/${slug}`,
            { completedItems },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          // console.log("Progress saved to API");
          
          // Animate progress bar
          const progressPercentage = calculateOverallProgress();
          Animated.timing(progressAnim, {
            toValue: progressPercentage / 100,
            duration: 500,
            useNativeDriver: false
          }).start();
          
        } catch (error) {
          console.error("Error saving progress to API:", error);
          setSyncError("Failed to save your progress to the server");
          setTimeout(() => setSyncError(null), 5000);
        } finally {
          setIsSaving(false);
        }
      };

      const timeoutId = setTimeout(() => {
        saveToAPI();
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [completedItems, isLoaded, isAuthenticated]);

  // Toggle item completion
  const toggleItemCompletion = (
    level: string,
    tech: string,
    topic: string,
    item: string
  ) => {
    // Show login prompt if not authenticated
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      setTimeout(() => setShowAuthPrompt(false), 3000);
      return;
    }

    setCompletedItems((prev) => {
      const updated = { ...prev };

      // Initialize nested objects if they don't exist
      if (!updated[level]) updated[level] = {};
      if (!updated[level][tech]) updated[level][tech] = {};
      if (!updated[level][tech][topic]) updated[level][tech][topic] = {};

      // Toggle the completion status
      updated[level][tech][topic][item] = !updated[level][tech][topic][item];

      return updated;
    });
  };

  // Check if an item is completed
  const isItemCompleted = (
    level: string,
    tech: string,
    topic: string,
    item: string
  ): boolean => {
    return !!completedItems[level]?.[tech]?.[topic]?.[item];
  };

  // Check if a topic is fully completed (all items completed)
  const isTopicCompleted = (
    level: string,
    tech: string,
    topic: string
  ): boolean => {
    if (!roadmap) return false;

    const items = roadmap[level][tech][topic];
    if (!items || items.length === 0) return false;

    // Check if all items in the topic are completed
    return items.every((item: string) => isItemCompleted(level, tech, topic, item));
  };

  // Mark all items in a topic as completed or not completed
  const toggleAllItemsInTopic = (
    level: string,
    tech: string,
    topic: string,
    completed: boolean
  ) => {
    // Show login prompt if not authenticated
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      setTimeout(() => setShowAuthPrompt(false), 3000);
      return;
    }

    if (!roadmap) return;

    setCompletedItems((prev) => {
      const updated = { ...prev };

      // Initialize nested objects if they don't exist
      if (!updated[level]) updated[level] = {};
      if (!updated[level][tech]) updated[level][tech] = {};
      if (!updated[level][tech][topic]) updated[level][tech][topic] = {};

      // Set all items to the given completion status
      roadmap[level][tech][topic].forEach((item: string) => {
        updated[level][tech][topic][item] = completed;
      });

      return updated;
    });
  };

  // Calculate progress percentage for the entire roadmap
  const calculateOverallProgress = (items = completedItems): number => {
    if (!roadmap || !isAuthenticated) return 0;

    let totalItems = 0;
    let completedCount = 0;

    // Count total items and completed items
    Object.keys(roadmap).forEach((level) => {
      Object.keys(roadmap[level]).forEach((tech) => {
        Object.keys(roadmap[level][tech]).forEach((topic) => {
          const topicItems = roadmap[level][tech][topic];
          totalItems += topicItems.length;

          topicItems.forEach((item: string) => {
            if (items[level]?.[tech]?.[topic]?.[item]) {
              completedCount++;
            }
          });
        });
      });
    });

    return totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  };

  // Force sync with server
  const syncWithServer = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      setTimeout(() => setShowAuthPrompt(false), 3000);
      return;
    }

    try {
      setIsSaving(true);
      setSyncError(null);
      setSyncSuccess(null);
      
      const token = await getToken();
      await axios.post(
        `${API_URL}/progress/${slug}`,
        { completedItems },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Show success message
      setSyncSuccess("Your progress has been saved to the server");
      setTimeout(() => setSyncSuccess(null), 3000);
    } catch (error) {
      console.error("Error syncing progress:", error);
      setSyncError("Failed to sync your progress with the server");
      setTimeout(() => setSyncError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Open topic modal
  const openTopicModal = (level: string, tech: string, topic: string) => {
    setCurrentTopic({ level, tech, topic });
    setShowTopicModal(true);
  };

  // Handle login button press
  const handleLoginPress = () => {
    router.push('/login');
  };

  // Render topic modal content
  const renderTopicModalContent = () => {
    if (!currentTopic || !roadmap) return null;
    
    const { level, tech, topic } = currentTopic;
    const items = roadmap[level][tech][topic];
    const isAllCompleted = isTopicCompleted(level, tech, topic);
    
    return (
      <View className="bg-white rounded-xl p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">{topic}</Text>
          <TouchableOpacity onPress={() => setShowTopicModal(false)}>
            <Ionicons name="close" size={24} color="#777" />
          </TouchableOpacity>
        </View>

        {isAuthenticated && (
          <TouchableOpacity
            className={`mb-4 py-2 rounded-lg flex-row justify-center items-center ${
              isAllCompleted ? "bg-green-600" : "bg-blue-600"
            }`}
            onPress={() => toggleAllItemsInTopic(level, tech, topic, !isAllCompleted)}
          >
            <Feather 
              name={isAllCompleted ? "x-circle" : "check-circle"} 
              size={16} 
              color="#fff" 
              style={{marginRight: 8}} 
            />
            <Text className="text-white font-medium">
              {isAllCompleted ? "Mark All Incomplete" : "Mark All Complete"}
            </Text>
          </TouchableOpacity>
        )}

        <ScrollView className="max-h-80">
          <View className="flex-row flex-wrap">
            {items.map((item: string) => {
              const isCompleted = isItemCompleted(level, tech, topic, item);
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => toggleItemCompletion(level, tech, topic, item)}
                  className={`m-1 px-3 py-2 rounded-full flex-row items-center ${
                    isAuthenticated && isCompleted
                      ? "bg-green-100 border border-green-300"
                      : "bg-blue-100 border border-blue-300"
                  }`}
                  disabled={!isAuthenticated}
                >
                  {isAuthenticated && isCompleted && (
                    <Feather name="check-circle" size={14} color="#22c55e" style={{marginRight: 6}} />
                  )}
                  <Text 
                    className={`${
                      isAuthenticated && isCompleted 
                        ? "text-green-800" 
                        : "text-blue-800"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {!isAuthenticated && (
          <TouchableOpacity
            className="mt-4 bg-blue-600 py-3 rounded-lg flex-row justify-center items-center"
            onPress={() => {
              setShowTopicModal(false);
              setTimeout(() => router.push('/login'), 300);
            }}
          >
            <Ionicons name="log-in-outline" size={18} color="#fff" style={{marginRight: 8}} />
            <Text className="text-white font-medium">Log In to Track Progress</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Show loading state
  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Loading roadmap...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (!roadmap || !response) {
    return (
      <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <View className="flex-1 justify-center items-center p-5">
          <MaterialIcons name="error-outline" size={60} color="#ef4444" />
          <Text className="text-xl font-bold text-gray-800 mt-4">Roadmap Not Found</Text>
          <Text className="text-gray-600 text-center mt-2">We couldn't find the roadmap you're looking for.</Text>
          <TouchableOpacity 
            className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
            onPress={() => router.push('/roadmaps')}
          >
            <Text className="text-white font-semibold">Go Back to Roadmaps</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" >
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
      <Stack.Screen 
        options={{
          title: `${response.title} Roadmap`,
          headerTitleStyle: {
            color: '#3b82f6',
            fontWeight: 'bold',
          },
        }} 
      />
      
      <ScrollView className="flex-1">
        <View className="px-4 py-4">
          {/* Authentication Prompt */}
          {showAuthPrompt && (
            <View className="mb-4 p-3 rounded-lg bg-yellow-100 border border-yellow-300 flex-row items-center">
              <Ionicons name="log-in-outline" size={18} color="#eab308" style={{ marginRight: 8 }} />
              <Text className="text-yellow-800">Please login to track your progress</Text>
            </View>
          )}

          {/* Authentication Status & Sync Button */}
          <View className="mb-4 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-2 ${isAuthenticated ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <Text className="text-sm text-gray-500">
                {isAuthenticated 
                  ? "Your progress is being saved" 
                  : "Login to track your progress"}
              </Text>
            </View>
            
            {isAuthenticated && (
              <TouchableOpacity
                onPress={syncWithServer}
                disabled={isSaving}
                className="px-3 py-1.5 border border-blue-300 bg-blue-50 rounded-lg"
              >
                <Text className="text-xs text-blue-600 font-medium">
                  {isSaving ? "Syncing..." : "Sync Progress"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Error and Success Messages */}
          {syncError && (
            <View className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 flex-row items-center">
              <Feather name="alert-triangle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
              <Text className="text-red-800">{syncError}</Text>
            </View>
          )}
          
          {syncSuccess && (
            <View className="mb-4 p-3 rounded-lg bg-green-100 border border-green-300 flex-row items-center">
              <Feather name="check-circle" size={18} color="#22c55e" style={{ marginRight: 8 }} />
              <Text className="text-green-800">{syncSuccess}</Text>
            </View>
          )}

          {/* Overall Progress Bar - Only show if authenticated */}
          {isAuthenticated && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-700 text-sm">Overall Progress</Text>
                <Text className="text-gray-900 text-sm font-bold">
                  {calculateOverallProgress()}%
                </Text>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <Animated.View
                  className="bg-blue-600 h-2.5"
                  style={{ 
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }}
                />
              </View>
            </View>
          )}
          
          {/* Login prompt when not authenticated */}
          {!isAuthenticated && (
            <View className="mb-6 p-4 rounded-lg border border-blue-200 bg-blue-50">
              <Text className="text-lg font-semibold text-blue-800 mb-2">Track Your Progress</Text>
              <Text className="text-gray-600 mb-4">
                Log in to track your learning journey and save your progress.
              </Text>
              <TouchableOpacity
                className="bg-blue-600 py-3 rounded-lg flex-row justify-center items-center"
                onPress={handleLoginPress}
              >
                <Ionicons name="log-in-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text className="text-white font-semibold">Log In to Track Progress</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Levels */}
        <View className="mb-8">
          {Object.keys(roadmap).map((level, levelIndex) => (
            <View key={level} className="mb-6">
              <View className="items-center">
                <View className="border-2 border-gray-200 rounded-lg w-[90%] overflow-hidden">
                  {/* Level header with gradient */}
                  <LinearGradient
                    colors={['#3b82f6', '#8b5cf6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="px-4 py-3"
                  >
                    <Text className="font-bold text-xl text-white">{level}</Text>
                  </LinearGradient>
                  
                  <View className="p-4">
                    {/* Technologies */}
                    <View className="space-y-3">
                      {Object.keys(roadmap[level]).map((tech) => (
                        <View key={tech} className="border border-gray-200 rounded-lg overflow-hidden">
                          <TouchableOpacity
                            className="bg-blue-50 px-4 py-3 flex-row justify-between items-center"
                            onPress={() => setExpandedTech(expandedTech === tech ? null : tech)}
                          >
                            <Text className="text-blue-800 font-medium">{tech}</Text>
                            <Ionicons 
                              name={expandedTech === tech ? "chevron-up" : "chevron-down"} 
                              size={20} 
                              color="#3b82f6" 
                            />
                          </TouchableOpacity>
                          
                          {/* Topics for this technology */}
                          {expandedTech === tech && (
                            <View className="p-3 bg-gray-50">
                              {Object.keys(roadmap[level][tech]).map((topic) => {
                                const isAllItemsCompleted = isTopicCompleted(level, tech, topic);
                                
                                return (
                                  <TouchableOpacity 
                                    key={topic}
                                    className={`mb-2 p-3 rounded-lg flex-row justify-between items-center ${
                                      isAuthenticated && isAllItemsCompleted 
                                        ? "bg-green-100 border border-green-200" 
                                        : "bg-white border border-gray-200"
                                    }`}
                                    onPress={() => openTopicModal(level, tech, topic)}
                                  >
                                    <View className="flex-row items-center flex-1">
                                      {isAuthenticated && isAllItemsCompleted && (
                                        <Feather name="check-circle" size={16} color="#16a34a" style={{marginRight: 8}} />
                                      )}
                                      <Text className="font-medium text-gray-800" numberOfLines={1}>
                                        {topic}
                                      </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                      <Text className="text-xs text-gray-500 mr-2">
                                        {roadmap[level][tech][topic].length} items
                                      </Text>
                                      <Ionicons name="chevron-forward" size={16} color="#777" />
                                    </View>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Down arrow if not the last level */}
              {levelIndex < Object.keys(roadmap).length - 1 && (
                <View className="items-center my-4">
                  <Ionicons name="arrow-down" size={24} color="#9ca3af" />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Footer button */}
        <View className="px-4 pb-8">
          <TouchableOpacity
            className="bg-blue-600 py-3 rounded-lg items-center"
            onPress={() => router.push('/roadmaps')}
          >
            <Text className="text-white font-semibold">Explore Other Tech Stacks</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Topic Items Modal */}
      <Modal
        isVisible={showTopicModal}
        onBackdropPress={() => setShowTopicModal(false)}
        onBackButtonPress={() => setShowTopicModal(false)}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={{ margin: 20, justifyContent: 'flex-end' }}
      >
        {renderTopicModalContent()}
      </Modal>
    </SafeAreaView>
  );
}