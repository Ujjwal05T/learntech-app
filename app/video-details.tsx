import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Share,
  Modal,
  BackHandler
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function VideoDetails() {
  // Get parameters from navigation
  const params = useLocalSearchParams();
  const router = useRouter();
  const videoUrl = params.videoUrl as string;
  const title = params.title as string;
  const author = params.author as string;

  // State variables
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 16, height: 9 });
  
  // Refs
  const videoRef = useRef<Video>(null);
  const fullscreenVideoRef = useRef<Video>(null);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Handle back button on Android
  useEffect(() => {
    const backAction = () => {
      if (isFullscreen) {
        exitFullscreen();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [isFullscreen]);

  // Function to check if video is playing
  const isPlaying = () => {
    return status?.isLoaded && status.isPlaying;
  };

  // Handle back navigation
  const handleBack = () => {
    if (videoRef.current) {
      videoRef.current.pauseAsync();
    }
    router.back();
  };

  // Playback controls
  const togglePlayPause = async () => {
    const ref = isFullscreen ? fullscreenVideoRef : videoRef;
    if (!ref.current) return;
    
    if (isPlaying()) {
      await ref.current.pauseAsync();
    } else {
      await ref.current.playAsync();
    }
  };

  // Enter fullscreen mode
  const enterFullscreen = async () => {
    try {
      // Save current playback position
      const currentStatus = await videoRef.current?.getStatusAsync();
      const position = currentStatus?.isLoaded ? currentStatus.positionMillis : 0;
      
      // Lock to landscape orientation
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      
      // Hide status bar
      StatusBar.setHidden(true);
      
      setIsFullscreen(true);
      
      // Resume from the same position in fullscreen
      setTimeout(() => {
        if (fullscreenVideoRef.current) {
          fullscreenVideoRef.current.playFromPositionAsync(position);
        }
      }, 300);
    } catch (err) {
      console.error("Error entering fullscreen:", err);
    }
  };

  // Exit fullscreen mode
  const exitFullscreen = async () => {
    try {
      // Save current playback position
      const currentStatus = await fullscreenVideoRef.current?.getStatusAsync();
      const position = currentStatus?.isLoaded ? currentStatus.positionMillis : 0;
      
      // Reset orientation
      await ScreenOrientation.unlockAsync();
      
      // Show status bar
      StatusBar.setHidden(false);
      
      setIsFullscreen(false);
      
      // Resume from the same position in normal mode
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.playFromPositionAsync(position);
        }
      }, 300);
    } catch (err) {
      console.error("Error exiting fullscreen:", err);
    }
  };

  // Handle video load to get dimensions
  const handleVideoLoad = (status:any) => {
    setIsLoading(false);
    
    // Check if the status has naturalSize information
    if (status.naturalSize) {
      const { width, height } = status.naturalSize;
      setVideoDimensions({ width, height });
    }
  };

  // Calculate video dimensions for fullscreen mode
  const getFullscreenDimensions = () => {
    const { width, height } = videoDimensions;
    const aspectRatio = width / height;
    
    // For landscape videos
    if (aspectRatio >= 1) {
      const videoHeight = screenHeight;
      const videoWidth = videoHeight * aspectRatio;
      return { width: videoWidth, height: videoHeight };
    } 
    // For portrait videos
    else {
      const videoWidth = screenWidth;
      const videoHeight = videoWidth / aspectRatio;
      return { width: videoWidth, height: videoHeight };
    }
  };

  // Get fullscreen styles
  const fullscreenVideoStyle = getFullscreenDimensions();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" />
      
      {/* Regular Video Player */}
      {!isFullscreen && (
        <View style={styles.playerContainer}>
          {isLoading && (
            <View className="absolute inset-0 items-center justify-center z-10 bg-black/20">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          )}
          
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls={false}
            shouldPlay={true}
            style={styles.video}
            onPlaybackStatusUpdate={(status) => setStatus(status)}
            onLoadStart={() => setIsLoading(true)}
            onLoad={handleVideoLoad}
            onError={(error) => {
              console.error('Video error:', error);
              setIsLoading(false);
              setError('Failed to load video');
            }}
          />
          
          {/* Custom Controls Overlay */}
          {!isLoading && (
            <TouchableOpacity 
              activeOpacity={1}
              className="absolute inset-0 items-center justify-center"
              onPress={togglePlayPause}
            >
              {/* Center Play/Pause Button */}
              {!isPlaying() && (
                <View className="bg-black/30 rounded-full p-5">
                  <Ionicons name="play" size={40} color="white" />
                </View>
              )}
              
              {/* Bottom Controls */}
              <View className="absolute bottom-0 left-0 right-0 flex-row justify-between items-center p-3 bg-black/30">
                <TouchableOpacity onPress={togglePlayPause} className="p-1">
                  <Ionicons name={isPlaying() ? "pause" : "play"} size={24} color="white" />
                </TouchableOpacity>
                
                {/* Fullscreen toggle button */}
                <TouchableOpacity onPress={enterFullscreen} className="p-1">
                  <Ionicons name="expand" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          
          {/* Error Message */}
          {error && (
            <View className="absolute inset-0 items-center justify-center bg-black/70">
              <Ionicons name="alert-circle" size={50} color="#ef4444" />
              <Text className="text-white mt-2 text-center px-4">{error}</Text>
              <TouchableOpacity 
                onPress={handleBack}
                className="mt-4 bg-white px-4 py-2 rounded-lg"
              >
                <Text className="text-black font-medium">Go Back</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Back Button */}
          <TouchableOpacity 
            onPress={handleBack}
            className="absolute top-2 left-2 bg-black/40 rounded-full p-2"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Fullscreen Modal */}
      <Modal
        visible={isFullscreen}
        animationType="fade"
        transparent={true}
        onRequestClose={exitFullscreen}
      >
        <View style={styles.fullscreenContainer}>
          <Video
            ref={fullscreenVideoRef}
            source={{ uri: videoUrl }}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls={false}
            shouldPlay={true}
            style={fullscreenVideoStyle}
            onPlaybackStatusUpdate={(status) => setStatus(status)}
          />
          
          {/* Fullscreen Controls */}
          <TouchableOpacity 
            activeOpacity={1}
            style={StyleSheet.absoluteFill}
            onPress={togglePlayPause}
          >
            {/* Center Play/Pause Button */}
            {!isPlaying() && (
              <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/30 rounded-full p-5">
                <Ionicons name="play" size={50} color="white" />
              </View>
            )}
            
            {/* Top Controls */}
            <View className="absolute top-0 left-0 right-0 flex-row justify-between items-center p-4 bg-black/30">
              <TouchableOpacity onPress={exitFullscreen} className="p-1">
                <Ionicons name="arrow-back" size={28} color="white" />
              </TouchableOpacity>
              
              <Text className="text-white font-semibold" numberOfLines={1}>
                {title}
              </Text>
              
              <TouchableOpacity onPress={exitFullscreen} className="p-1">
                <Ionicons name="contract" size={28} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Bottom Controls */}
            <View className="absolute bottom-0 left-0 right-0 flex-row justify-between items-center p-4 bg-black/30">
              <TouchableOpacity onPress={togglePlayPause} className="p-1">
                <Ionicons name={isPlaying() ? "pause" : "play"} size={28} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
      
      {/* Video Info Section */}
      {!isFullscreen && (
        <ScrollView className="flex-1">
          <View className="p-4">
            {/* Title */}
            <Text className="text-xl font-bold text-gray-900">{title}</Text>
            
            {/* Stats */}
            <View className="flex-row items-center mb-2 justify-between mt-2">
              <Text className="text-sm text-gray-500">
               Uploaded on {new Date().toLocaleDateString()}
              </Text>
            </View>
            
            {/* Channel Info */}
            <View className="flex-row items-center mt-4">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
               <Text className="text-blue-600 font-bold">{author[0]?.toUpperCase()}</Text>
              </View>
              
              <View className="ml-3 flex-1">
               <Text className="font-semibold text-gray-900">Author : {author}</Text>
              </View>
            </View>
            
            {/* Description */}
            <View className="mt-4 bg-gray-50 p-3 rounded-lg">
              <Text className="text-gray-700 leading-5">
               {params.description as string || 
                "This is a video description. The creator hasn't added detailed information about this content yet."}
              </Text>
            </View>
            
            {/* Comments Section */}
            <View className="mt-6">
              <Text className="font-bold text-lg text-gray-900 mb-2">Comments</Text>
              <TouchableOpacity className="flex-row items-center">
               <View className="w-8 h-8 rounded-full bg-gray-200 mr-3" />
               <Text className="text-gray-500">Add a comment...</Text>
              </TouchableOpacity>
              
              {/* Dummy Comments */}
              <View className="mt-4 border-t border-gray-100 pt-3">
               {/* Comment 1 */}
               <View className="flex-row mb-4">
                 <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
                  <Text className="text-purple-600 font-bold">J</Text>
                 </View>
                 <View className="ml-3 flex-1">
                  <View className="flex-row items-center">
                    <Text className="font-semibold">Pranav Pawar</Text>
                    <Text className="text-xs text-gray-500 ml-2">3 days ago</Text>
                  </View>
                  <Text className="text-gray-700 mt-1">Great video! This was really helpful for my project. Looking forward to more content like this.</Text>
                 </View>
               </View>
               
               {/* Comment 2 */}
               <View className="flex-row mb-4">
                 <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
                  <Text className="text-green-600 font-bold">T</Text>
                 </View>
                 <View className="ml-3 flex-1">
                  <View className="flex-row items-center">
                    <Text className="font-semibold">Ujjwal Tamrakar</Text>
                    <Text className="text-xs text-gray-500 ml-2">1 week ago</Text>
                  </View>
                  <Text className="text-gray-700 mt-1">I have a question about the part at 2:15. Could you explain that in more detail?</Text>
                 </View>
               </View>
               
               {/* Comment 3 */}
               <View className="flex-row">
                 <View className="w-8 h-8 rounded-full bg-amber-100 items-center justify-center">
                  <Text className="text-amber-600 font-bold">S</Text>
                 </View>
                 <View className="ml-3 flex-1">
                  <View className="flex-row items-center">
                    <Text className="font-semibold">Sakshi Pandey</Text>
                    <Text className="text-xs text-gray-500 ml-2">Just now</Text>
                  </View>
                  <Text className="text-gray-700 mt-1">Thanks for sharing! I've been looking for a tutorial on this topic for ages.</Text>
                 </View>
               </View>
              </View>
            </View>
           </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  }
});