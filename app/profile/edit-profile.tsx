import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../store/user-store';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const EditProfile = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    fullName: '',
    username: user?.username || '',
    email: user?.email || '',
    phone: '',
    collegeName: '',
    course: '',
    skills: [] as string[],
    skillInput: '',
    projects: [] as string[],
    projectInput: ''
  });

  //hide header
  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  // Fetch user data
  const fetchUserData = async () => {
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
      
      // Update form with existing data
      setFormData({
        fullName: data.fullName || user?.username || '',
        username: data?.username || user?.username || '',
        email: data?.email || user?.email || '',
        phone: data.phone || '',
        collegeName: data.collegeName || '',
        course: data.course || '',
        skills: data.skills || [],
        skillInput: '',
        projects: data.projects || [],
        projectInput: ''
      });
      
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
      setError('Failed to load your profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Handle form changes
  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a skill
  const addSkill = () => {
    if (!formData.skillInput.trim()) return;
    
    // Don't add duplicate skills
    if (formData.skills.includes(formData.skillInput.trim())) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, prev.skillInput.trim()],
      skillInput: ''
    }));
  };

  // Remove a skill
  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Add a project
  const addProject = () => {
    if (!formData.projectInput.trim()) return;
    
    // Don't add duplicate projects
    if (formData.projects.includes(formData.projectInput.trim())) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, formData.projectInput.trim()],
      projectInput: ''
    }));
  };

  // Remove a project
  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  // Get avatar letter safely
  const getAvatarLetter = () => {
    if (formData.fullName && formData.fullName.trim().length > 0) {
      return formData.fullName.charAt(0).toUpperCase();
    } 
    if (user?.username && user.username.length > 0) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Validate required fields
      if (!formData.fullName.trim()) {
        setError('Full name is required');
        return;
      }
      
      // Get token from storage
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Prepare data for submission
      const profileData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        username: formData.username,
        phone: formData.phone.trim(),
        collegeName: formData.collegeName.trim(),
        course: formData.course.trim(),
        skills: formData.skills,
        projects: formData.projects
      };
      
      // Make API request
      const response = await axios.post(
        `${API_URL}/profile/update-profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.success) {
        setSuccess('Your profile has been updated successfully');
        
        // Navigate back after a short delay
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
      
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('An error occurred while updating your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-3 text-gray-500">Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1">
       
          <View className="flex-row items-center justify-between px-4 pt-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="p-2"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">Edit Profile</Text>
            <View style={{ width: 32 }} /> 
          </View>
          
          <View className="p-4">
            
            {error && (
              <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Text className="text-red-600">{error}</Text>
              </View>
            )}
            
            {success && (
              <View className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Text className="text-green-600">{success}</Text>
              </View>
            )}
            
           
            <View className="items-center mb-6">
              <View className="relative">
                <View className="w-24 h-24 rounded-full bg-blue-100 justify-center items-center border-2 border-blue-200">
                  <Text className="text-4xl font-bold text-blue-600">
                    {getAvatarLetter()}
                  </Text>
                </View>
                <View className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm">
                  <Ionicons name="camera" size={18} color="#3b82f6" />
                </View>
              </View>
            </View>
            
            {/* Form Fields */}
            <View className="space-y-4">
            
              <View>
                <Text className="text-gray-700 mb-1 text-sm font-medium">Full Name</Text>
                <TextInput
                  className="bg-white text-gray-800 rounded-lg px-4 py-3 border border-gray-200"
                  placeholder="Enter your full name"
                  placeholderTextColor="#9ca3af"
                  value={formData.fullName}
                  onChangeText={(text) => handleChange('fullName', text)}
                />
              </View>
              
              {/* Username (non-editable) */}
              <View>
                <Text className="text-gray-700 mb-1 text-sm font-medium">Username</Text>
                <View className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 flex-row items-center">
                  <Text className="text-gray-600 flex-1">
                    @{formData.username}
                  </Text>
                  <Ionicons name="lock-closed" size={16} color="#9ca3af" />
                </View>
                <Text className="text-xs text-gray-500 mt-1">Username cannot be changed</Text>
              </View>
              
              {/* Email (non-editable) */}
              <View>
                <Text className="text-gray-700 mb-1 text-sm font-medium">Email</Text>
                <View className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 flex-row items-center">
                  <Text className="text-gray-600 flex-1">{formData.email || 'your.email@example.com'}</Text>
                  <Ionicons name="lock-closed" size={16} color="#9ca3af" />
                </View>
                <Text className="text-xs text-gray-500 mt-1">Email cannot be changed</Text>
              </View>
              
              {/* Phone Number */}
              <View>
                <Text className="text-gray-700 mb-1 text-sm font-medium">Phone Number</Text>
                <TextInput
                  className="bg-white text-gray-800 rounded-lg px-4 py-3 border border-gray-200"
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => handleChange('phone', text)}
                />
              </View>
              
              {/* College Name */}
              <View>
                <Text className="text-gray-700 mb-1 text-sm font-medium">College/Institute Name</Text>
                <TextInput
                  className="bg-white text-gray-800 rounded-lg px-4 py-3 border border-gray-200"
                  placeholder="Enter your college name"
                  placeholderTextColor="#9ca3af"
                  value={formData.collegeName}
                  onChangeText={(text) => handleChange('collegeName', text)}
                />
              </View>
              
              {/* Course */}
              <View>
                <Text className="text-gray-700 mb-1 text-sm font-medium">Course/Degree</Text>
                <TextInput
                  className="bg-white text-gray-800 rounded-lg px-4 py-3 border border-gray-200"
                  placeholder="Enter your course or degree"
                  placeholderTextColor="#9ca3af"
                  value={formData.course}
                  onChangeText={(text) => handleChange('course', text)}
                />
              </View>
              
              {/* Skills */}
              <View>
                <Text className="text-gray-700 mb-1 text-sm font-medium">Skills</Text>
                <View className="flex-row items-center mb-2">
                  <TextInput
                    className="bg-white text-gray-800 rounded-lg px-4 py-3 border border-gray-200 flex-1 mr-2"
                    placeholder="Add a skill"
                    placeholderTextColor="#9ca3af"
                    value={formData.skillInput}
                    onChangeText={(text) => handleChange('skillInput', text)}
                    onSubmitEditing={addSkill}
                  />
                  <TouchableOpacity 
                    className="bg-blue-600 p-3 rounded-lg" 
                    onPress={addSkill}
                  >
                    <Ionicons name="add" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                
                {/* Skills List */}
                <View className="flex-row flex-wrap">
                  {formData.skills.map((skill, index) => (
                    <View 
                      key={index} 
                      className="bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 m-1 flex-row items-center"
                    >
                      <Text className="text-blue-600 mr-2">{skill}</Text>
                      <TouchableOpacity onPress={() => removeSkill(index)}>
                        <Ionicons name="close-circle" size={16} color="#3b82f6" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
              
              {/* Projects */}
              <View>
                <Text className="text-gray-700 mb-1 text-sm font-medium">Projects</Text>
                <View className="flex-row items-center mb-2">
                  <TextInput
                    className="bg-white text-gray-800 rounded-lg px-4 py-3 border border-gray-200 flex-1 mr-2"
                    placeholder="Add a project"
                    placeholderTextColor="#9ca3af"
                    value={formData.projectInput}
                    onChangeText={(text) => handleChange('projectInput', text)}
                    onSubmitEditing={addProject}
                  />
                  <TouchableOpacity 
                    className="bg-blue-600 p-3 rounded-lg" 
                    onPress={addProject}
                  >
                    <Ionicons name="add" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                
                {/* Projects List */}
                <View className="space-y-2">
                  {formData.projects.map((project, index) => (
                    <View 
                      key={index} 
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex-row items-center justify-between"
                    >
                      <Text className="text-gray-800 flex-1">{project}</Text>
                      <TouchableOpacity 
                        className="bg-red-50 p-1.5 rounded-full border border-red-100" 
                        onPress={() => removeProject(index)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
              
              {/* Resume Upload Button (Placeholder) */}
              <View className="mt-2">
                <Text className="text-gray-700 mb-1 text-sm font-medium">Resume</Text>
                <TouchableOpacity 
                  className="bg-white border border-dashed border-blue-400 rounded-lg p-4 items-center"
                  onPress={() => Alert.alert('Coming Soon', 'Resume upload functionality will be available soon!')}
                >
                  <Ionicons name="cloud-upload-outline" size={28} color="#3b82f6" />
                  <Text className="text-blue-600 mt-2">Upload your resume</Text>
                  <Text className="text-gray-500 text-xs mt-1">PDF, DOCX (Max 5MB)</Text>
                </TouchableOpacity>
              </View>
              
              {/* Save Button */}
              <TouchableOpacity
                className="bg-blue-600 py-3.5 rounded-lg items-center mt-4"
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="text-white font-bold text-lg">Save Changes</Text>
                )}
              </TouchableOpacity>
              
              {/* Cancel Button */}
              <TouchableOpacity
                className="py-3.5 rounded-lg items-center border border-gray-200 bg-white mt-3 mb-6"
                onPress={() => router.back()}
                disabled={submitting}
              >
                <Text className="text-gray-600">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfile;