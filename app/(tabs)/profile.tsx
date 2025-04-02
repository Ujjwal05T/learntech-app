import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  StatusBar,
  Platform,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useUserStore } from '../../store/user-store';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Sample data - replace with API data
const initialSkills = ['JavaScript', 'React Native', 'Node.js', 'Python', 'UI/UX'];
const initialProjects = ['Personal Portfolio', 'Task Manager App', 'E-commerce Website'];

const Profile = () => {
  const router = useRouter();
  const { removeToken } = useAuth();
  const { user } = useUserStore();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile data with separate fullName and username
  const [profileData, setProfileData] = useState({
    fullName: 'Your Name',
    username: user?.username || 'username',
    email: user?.email || 'email@example.com',
    phone: '',
    collegeName: 'Not specified',
    course: 'Not specified',
    skills: [...initialSkills],
    projects: [...initialProjects]
  });

  // Fetch user profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from storage
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make API request
      const response = await axios.get(
        `${API_URL}/profile/get-profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = response.data.data.profile;
      
      // Update state with fetched data, keeping username and fullName separate
      setProfileData({
        fullName: data.fullName || 'Your Name',
        username: data?.username || 'username',
        email: data.email || user?.email || 'email@example.com',
        phone: data.phone || '',
        collegeName: data.collegeName || 'Not specified',
        course: data.course || 'Not specified',
        skills: data.skills || [...initialSkills],
        projects: data.projects || [...initialProjects]
      });
      
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchProfileData();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await removeToken();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  // Handle edit profile
  const handleEditProfile = () => {
    router.push('/profile/edit-profile');
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-3 text-gray-500">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !refreshing) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white px-5">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Ionicons name="alert-circle" size={60} color="#ef4444" />
        <Text className="text-xl font-bold text-gray-800 mt-4">Error Loading Profile</Text>
        <Text className="text-center mt-2 text-gray-600">{error}</Text>
        <TouchableOpacity 
          className="mt-6 bg-blue-600 py-3 px-6 rounded-lg"
          onPress={fetchProfileData}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Success state - show profile with revised layout (no gradient)
  return (
    <SafeAreaView className="flex-1 bg-gray-50" >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header with Actions */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-800">Profile</Text>
        <View className="flex-row">
          <TouchableOpacity 
            className="p-2 mr-2"
            onPress={handleEditProfile}
          >
            <Ionicons name="create-outline" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity 
            className="p-2"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
      >
        {/* Profile Overview Card - Simplified without gradient */}
        <View className="bg-white rounded-xl mx-4 mt-4 border border-gray-100 shadow-sm">
          <View className="border-t-4 border-blue-500 rounded-t-xl" />
          
          <View className="items-center px-4 py-6">
            <View className="w-24 h-24 rounded-full bg-blue-100 justify-center items-center border-2 border-blue-200">
              <Text className="text-4xl font-bold text-blue-600">
                {profileData.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            
            <View className="mt-4 items-center">
              <Text className="text-xl font-bold text-gray-800">{profileData.fullName}</Text>
              <Text className="text-blue-600 text-base mt-1">@{profileData.username}</Text>
              
              <TouchableOpacity 
                className="bg-blue-600 py-2 px-6 rounded-full mt-4"
                onPress={handleEditProfile}
              >
                <Text className="text-white font-medium text-sm">Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Contact Information Card */}
        <View className="bg-white rounded-xl mx-4 mt-4 border border-gray-100 shadow-sm">
          <View className="p-4">
            <Text className="text-lg font-bold text-gray-800 mb-3">Contact Information</Text>
            
            <View className="space-y-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                  <Ionicons name="mail-outline" size={20} color="#3b82f6" />
                </View>
                <View className="ml-3">
                  <Text className="text-xs text-gray-500">Email</Text>
                  <Text className="text-gray-800">{profileData.email}</Text>
                </View>
              </View>
              
              {profileData.phone && (
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                    <Ionicons name="call-outline" size={20} color="#3b82f6" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-xs text-gray-500">Phone</Text>
                    <Text className="text-gray-800">{profileData.phone}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {/* Education Card */}
        <View className="bg-white rounded-xl mx-4 mt-4 border border-gray-100 shadow-sm">
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <FontAwesome5 name="graduation-cap" size={18} color="#3b82f6" />
                <Text className="text-lg font-bold text-gray-800 ml-2">Education</Text>
              </View>
              
              {profileData.collegeName === 'Not specified' && (
                <TouchableOpacity 
                  className="p-1"
                  onPress={handleEditProfile}
                >
                  <Ionicons name="add-circle-outline" size={22} color="#3b82f6" />
                </TouchableOpacity>
              )}
            </View>
            
            {profileData.collegeName !== 'Not specified' ? (
              <View className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <Text className="text-blue-600 font-semibold">{profileData.collegeName}</Text>
                {profileData.course !== 'Not specified' && (
                  <Text className="mt-1 text-gray-600">{profileData.course}</Text>
                )}
              </View>
            ) : (
              <View className="items-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                <Text className="text-gray-500">No education details added yet</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Skills Card */}
        <View className="bg-white rounded-xl mx-4 mt-4 border border-gray-100 shadow-sm">
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <FontAwesome5 name="code" size={18} color="#3b82f6" />
                <Text className="text-lg font-bold text-gray-800 ml-2">Skills</Text>
              </View>
              
              <TouchableOpacity 
                className="p-1"
                onPress={handleEditProfile}
              >
                <Ionicons name="add-circle-outline" size={22} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            
            {profileData.skills.length > 0 ? (
              <View className="flex-row flex-wrap">
                {profileData.skills.map((skill, index) => (
                  <View key={index} className="bg-blue-50 px-3 py-1.5 rounded-full mr-2 mb-2 border border-blue-100">
                    <Text className="text-blue-600">{skill}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                <Text className="text-gray-500">No skills added yet</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Projects Card */}
        <View className="bg-white rounded-xl mx-4 mt-4 border border-gray-100 shadow-sm">
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <FontAwesome5 name="folder-open" size={18} color="#3b82f6" />
                <Text className="text-lg font-bold text-gray-800 ml-2">Projects</Text>
              </View>
              
              <TouchableOpacity 
                className="p-1"
                onPress={handleEditProfile}
              >
                <Ionicons name="add-circle-outline" size={22} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            
            {profileData.projects.length > 0 ? (
              <View className="space-y-2">
                {profileData.projects.map((project, index) => (
                  <TouchableOpacity key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className="text-blue-600 font-semibold">{project}</Text>
                        <Text className="text-gray-500 text-xs mt-1">Tap to view details</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#64748b" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="items-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                <Text className="text-gray-500">No projects added yet</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Certificates Card */}
        <View className="bg-white rounded-xl mx-4 mt-4 border border-gray-100 shadow-sm">
          <View className="p-4">
            <View className="flex-row items-center mb-3">
              <FontAwesome5 name="medal" size={18} color="#3b82f6" />
              <Text className="text-lg font-bold text-gray-800 ml-2">Certificates</Text>
            </View>
            
            <View className="bg-gray-50 p-4 rounded-lg items-center border border-gray-100">
              <MaterialIcons name="emoji-events" size={40} color="#d1d5db" />
              <Text className="text-gray-600 text-center mt-2">
                You don't have any certificates yet.
              </Text>
              <TouchableOpacity className="mt-3 bg-blue-600 py-2 px-6 rounded-lg">
                <Text className="text-white font-medium">View Courses</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Resume Section */}
        <View className="bg-white rounded-xl mx-4 mt-4 mb-8 border border-gray-100 shadow-sm">
          <View className="p-4">
            <View className="flex-row items-center mb-3">
              <FontAwesome5 name="file-alt" size={18} color="#3b82f6" />
              <Text className="text-lg font-bold text-gray-800 ml-2">Resume</Text>
            </View>
            
            <TouchableOpacity className="bg-blue-600 rounded-lg p-3.5 flex-row justify-center items-center">
              <Ionicons name="cloud-download-outline" size={20} color="#fff" />
              <Text className="text-white font-bold ml-2">Download Resume</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;