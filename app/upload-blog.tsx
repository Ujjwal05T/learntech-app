import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
// Replace ImagePicker with DocumentPicker
import * as DocumentPicker from 'expo-document-picker';
import { useUserStore } from '../store/user-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL from environment
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function UploadVideo() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserStore();
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form state - simpler now
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Selected video state
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videoName, setVideoName] = useState('');
  const [videoSize, setVideoSize] = useState(0);

  // Pick video file using DocumentPicker
  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*', // Only allow video files
        copyToCacheDirectory: true // Make sure the file is accessible
      });
      
      // Check if a file was selected
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const videoAsset:any = result.assets[0];
        
        // Check file size (limit to 10MB to avoid 413 errors)
        const maxSize = 100 * 1024 * 1024; // 10MB
        if (videoAsset.size > maxSize) {
          Alert.alert(
            'File Too Large', 
            'Video must be smaller than 10MB to upload successfully.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        setSelectedVideo(videoAsset);
        setVideoName(videoAsset.name);
        setVideoSize(videoAsset.size);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to select video');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedVideo) {
      Alert.alert('Missing Video', 'Please select a video to upload');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a description');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const token = await AsyncStorage.getItem('token');
      
      // Create form data
      const uploadData = new FormData();
      uploadData.append('title', title);
      uploadData.append('description', description);
      uploadData.append('mediaType', 'video');
      uploadData.append('author', user?.username || 'Anonymous');
      
      // Append file
      uploadData.append('mediaUrl', {
         uri: selectedVideo.uri,
         name: videoName || 'video.mp4',
         type: selectedVideo.mimeType || 'video/mp4'
       } as any);

       console.log('Uploading file:', {
         uri: selectedVideo.uri,
         name: videoName,
         size: videoSize,
         type: selectedVideo.mimeType
       });
      // Upload to server with improved error handling
      const response = await axios.post(
        `${API_URL}/api/blogs/upload`,
        uploadData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100)
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      if (response.data) {
        Alert.alert(
          'Success', 
          'Video uploaded successfully!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Improved error handling for 413 errors
      if (axios.isAxiosError(error) && error.response?.status === 413) {
        Alert.alert(
          'File Too Large', 
          'The server rejected this video because it is too large. Please try a shorter or lower resolution video (under 10MB).',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Upload Failed', 'Could not upload video. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-4">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="p-2 mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">Upload Video</Text>
          </View>
          
          {/* Video Picker with size warning */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-700 font-medium">Select Video</Text>
              <Text className="text-xs text-gray-500">Max size: 10MB</Text>
            </View>
            <TouchableOpacity 
              onPress={pickVideo}
              className="bg-gray-100 p-5 rounded-lg border-2 border-dashed border-gray-300 items-center justify-center"
            >
              <Ionicons name="videocam-outline" size={40} color="#3b82f6" />
              <Text className="text-blue-600 font-medium mt-3">
                {selectedVideo ? 'Change Video' : 'Select Video File'}
              </Text>
            </TouchableOpacity>
            
            {selectedVideo && (
              <View className="mt-3 bg-blue-50 p-3 rounded-lg">
                <Text className="text-gray-800 font-medium">{videoName}</Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-600 text-sm">
                    Size: {(videoSize / (1024 * 1024)).toFixed(2)} MB
                  </Text>
                  
                  {videoSize > 8 * 1024 * 1024 && (
                    <View className="ml-2 bg-yellow-100 px-2 py-1 rounded-full">
                      <Text className="text-yellow-700 text-xs font-medium">
                        Almost too large
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
          
          {/* Rest of the form remains unchanged */}
          {/* Title Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Video Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter a title for your video"
              className="bg-gray-100 p-3 rounded-lg text-gray-800"
            />
          </View>
          
          {/* Description Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Video Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your video content"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-gray-100 p-3 rounded-lg text-gray-800 min-h-[100px]"
            />
          </View>
          
          {/* Author Display - Simplified */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Author</Text>
            <View className="bg-gray-100 p-3 rounded-lg">
              <Text className="text-gray-800">{user?.username || 'Loading username...'}</Text>
            </View>
          </View>
          
          {/* Upload Button */}
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={isLoading || !selectedVideo}
            className={`py-4 px-6 rounded-lg mb-10 ${isLoading || !selectedVideo ? 'bg-gray-300' : 'bg-blue-500'}`}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="ml-2 text-white font-bold">
                  Uploading... {uploadProgress}%
                </Text>
              </View>
            ) : (
              <Text className="text-center text-white font-bold">
                Upload Video
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}