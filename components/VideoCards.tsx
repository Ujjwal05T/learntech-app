import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface VideoCardProps {
  videoSrc: string;
  title: string;
  description: string;
  authorName: string;
  uploadedTime: string;
}

const VideoCards = ({ 
  videoSrc, 
  title, 
  authorName, 
  uploadedTime,
  description
}: VideoCardProps) => {
  const router = useRouter();

  // Get YouTube thumbnail if available
  const getThumbnail = () => {
    if (videoSrc && (videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be'))) {
      const videoId = videoSrc.includes('youtu.be/') 
        ? videoSrc.split('youtu.be/')[1].split('?')[0]
        : videoSrc.includes('v=') 
          ? videoSrc.split('v=')[1].split('&')[0] 
          : '';
          
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }
    return 'https://cdn.pixabay.com/photo/2018/04/29/20/45/laptop-3361063_1280.jpg'; // Fallback image
  };

  // Handle video click
  const handleVideoPress = () => {
    router.push({
      pathname: "/video-details",
      params: { 
        videoUrl: videoSrc,
        title: title,
        author: authorName,
        description: description
      }
    });
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={handleVideoPress}
      className="mb-4 bg-white rounded-lg shadow-sm overflow-hidden"
    >
      {/* Thumbnail */}
      <View className="relative">
        <Image
          source={{ uri: getThumbnail() }}
          style={{ width: '100%', height: 200 }}
          resizeMode="cover"
        />
        <View className="absolute inset-0 items-center justify-center">
          <View className="w-12 h-12 rounded-full bg-blue-500/80 items-center justify-center">
            <Ionicons name="play" size={38} color="#CDDAD5" />
          </View>
        </View>
      </View>
      
      {/* Content */}
      <View className="p-4">
        {/* Title */}
        <Text className="font-bold text-base text-gray-800" >
          {title}
        </Text>
        
        {/* Author Info */}
        <View className="flex-row items-center mt-2">
          <View className="w-6 h-6 p-1 rounded-full bg-blue-100 items-center justify-center mr-2">
            <Ionicons name="person" size={12} color="blue" />
          </View>
          <Text className="text-sm text-gray-600">
            Author {authorName}
          </Text>
        </View>
        
        {/* Description */}
        <Text className="text-sm text-gray-500 mt-2" numberOfLines={2}>
          {description}
        </Text>
        
        {/* Upload Time */}
        <Text className="text-xs text-gray-400 mt-2">
          Uploaded On {new Date(uploadedTime).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default VideoCards;