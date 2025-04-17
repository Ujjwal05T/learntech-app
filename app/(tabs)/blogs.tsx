import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, FlatList, RefreshControl, useWindowDimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import VideoCards from '../../components/VideoCards';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

// Define interface for blog items
interface BlogItem {
  author: string;
  createdAt: string;
  description: string;
  mediaType: 'text' | 'video';
  mediaUrl: string;
  title: string;
  _id?: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL; 

const Blogs = () => {
  const router = useRouter();
  const [blogItems, setBlogItems] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // Fetch blog data from API
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      // console.log(`${API_URL}/api/blogs/blogs`)
      const response = await axios.get(`${API_URL}/api/blogs/blogs`);    
      if (response.data.success) {
        setBlogItems(response.data.data);
      } else {
        setError('Failed to load blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Unable to load blogs. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false); // Make sure to reset refreshing state
    }
  };

  // Handle refresh action (button)
  const handleRefresh = () => {
    fetchBlogs();
  };

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    setError(null); // Clear any existing errors
    fetchBlogs();
  };
  
  // Handle upload button press
  const handleUploadPress = () => {
    router.push('/upload-blog');
  };

  // Render blog item based on type
  const renderBlogItem = ({ item }: { item: BlogItem }) => {
    if (item.mediaType === 'video') {
      return (
        <VideoCards
          videoSrc={item.mediaUrl}
          title={item.title}
          description={item.description}
          authorName={item.author}
          uploadedTime={item.createdAt}
        />
      );
    } 
    
    // Return null for non-video items
    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header with upload button */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
        <Text className="text-2xl font-bold text-gray-900">Latest Blogs</Text>
        
        <View className="flex-row items-center">
          
          <TouchableOpacity 
            onPress={handleUploadPress}
            className="bg-blue-500 rounded-full py-1.5 px-3 flex-row items-center"
          >
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-white font-medium ml-1 text-sm">Upload</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Loading State */}
      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Loading blogs...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-4">
          <View className="bg-red-50 p-6 rounded-xl border border-red-100 items-center max-w-md">
            <Ionicons name="alert-circle" size={40} color="#ef4444" />
            <Text className="text-red-500 font-medium text-lg mt-2">Unable to load blogs</Text>
            <Text className="text-gray-600 text-center mt-2">{error}</Text>
            <TouchableOpacity 
              onPress={handleRefresh}
              className="mt-4 bg-red-100 py-2 px-4 rounded-lg"
            >
              <Text className="text-red-600 font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <FlatList
            data={blogItems}
            renderItem={renderBlogItem}
            keyExtractor={item => item._id || Math.random().toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#3b82f6"]} // Android
                tintColor="#3b82f6" // iOS
                title="Pull to refresh..." // iOS
                titleColor="#3b82f6" // iOS
              />
            }
            ListEmptyComponent={
              <View className="py-8 items-center">
                <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 mt-4 text-center">No blogs available at the moment.</Text>
                <Text className="text-gray-400 mt-2 text-center">Check back later for updates.</Text>
                <Text className="text-blue-500 mt-4 text-center">Pull down to refresh</Text>
              </View>
            }
          />
          
          {/* Alternative: Floating Action Button */}
          {/* <TouchableOpacity 
            onPress={handleUploadPress}
            className="absolute bottom-6 right-6 bg-blue-500 rounded-full w-14 h-14 items-center justify-center shadow-lg"
            style={{ elevation: 5 }}
          >
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity> */}
        </>
      )}
    </SafeAreaView>
  );
};

export default Blogs;