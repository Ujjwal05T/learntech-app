import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Stack } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { useUserStore } from '../../store/user-store';

// Define interfaces
interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  organizer?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EventQuestion {
  _id?: string;
  username: string;
  question: string;
  answer?: string;
  isAnswered: boolean;
  upvotes: number;
  upvotedBy: string[];
  createdAt: string;
  updatedAt: string;
}

const EventsScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [questions, setQuestions] = useState<EventQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [askQuestion, setAskQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingUpvote, setProcessingUpvote] = useState<string | null>(null);
  
  // Answer management states
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerSubmitting, setAnswerSubmitting] = useState(false);

  const { user } = useUserStore()

  // Get token
  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token', error);
      return null;
    }
  };
  
  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data && response.data.length > 0) {
        setEvents(response.data);
        setSelectedEvent(response.data[0]); // Select first event by default
      } else {
        setEvents([]); // Set empty array if no events
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Fetch questions for selected event
  const fetchQuestions = async () => {
    if (!selectedEvent) return;
    
    try {
      const token = await getToken();
      
      if (!token) {
        return;
      }
      
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/questions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data) {
        setQuestions(response.data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };
  
  // Load data on mount
  useEffect(() => {
    fetchEvents();
  }, []);
  
  // Fetch questions when selected event changes
  useEffect(() => {
    if (selectedEvent) {
      fetchQuestions();
    }
  }, [selectedEvent]);
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };
  
  // Handle asking a question
  const handleAskQuestion = async () => {
    if (!askQuestion.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }
    
    if (!user) {
      Alert.alert('Error', 'Please log in to ask a question');
      return;
    }
    
    if (!selectedEvent) {
      return;
    }
    
    try {
      setSubmittingQuestion(true);
      const token = await getToken();
      
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/questions`,
        {
          username: user?.username || 'User',
          question: askQuestion,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Refresh questions
      await fetchQuestions();
      setAskQuestion('');
      
    } catch (error) {
      console.error('Error submitting question:', error);
      Alert.alert('Error', 'Failed to submit question. Please try again.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // Handle answering question
  const handleAnswerQuestion = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to answer a question');
      return;
    }
    
    if (user?.role !== 'admin') {
      Alert.alert('Error', 'Only Admin can answer the question');
      return;
    }
    
    if (!answerText.trim() || !answeringQuestionId) {
      Alert.alert('Error', 'Please enter an answer');
      return;
    }
    
    try {
      setAnswerSubmitting(true);
      const token = await getToken();
      
      await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/questions/${answeringQuestionId}/answer`,
        { answer: answerText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Clear answering state and refresh questions
      setAnsweringQuestionId(null);
      setAnswerText('');
      await fetchQuestions();
      Alert.alert('Success', 'Answer submitted successfully');
    } catch (error) {
      console.error('Error submitting answer:', error);
      Alert.alert('Error', 'Failed to submit answer. Please try again.');
    } finally {
      setAnswerSubmitting(false);
    }
  };
  
  // Start editing an answer
  const startAnswering = (questionId: string, currentAnswer?: string) => {
    setAnsweringQuestionId(questionId);
    setAnswerText(currentAnswer || '');
  };
  
  // Cancel answering
  const cancelAnswering = () => {
    setAnsweringQuestionId(null);
    setAnswerText('');
  };
  
  // Handle upvoting a question
  const handleUpvote = async (questionId: string) => {
    if (!user) {
      Alert.alert('Error', 'Please log in to upvote');
      return;
    }
    
    if (processingUpvote) {
      return;
    }
    
    setProcessingUpvote(questionId);
    
    try {
      const token = await getToken();
      
      // Find the question
      const question = questions.find(q => q._id === questionId);
      
      if (!question) {
        Alert.alert('Error', 'Question not found');
        setProcessingUpvote(null);
        return;
      }
      
      const hasUpvoted = question.upvotedBy?.includes(user?.userId || '');
      
      // Update UI optimistically
      setQuestions(prevQuestions =>
        prevQuestions.map(q => {
          if (q._id === questionId) {
            if (hasUpvoted) {
              // Remove upvote
              return {
                ...q,
                upvotes: Math.max(0, q.upvotes - 1),
                upvotedBy: q.upvotedBy.filter(username => username !== user?.username),
              };
            } else {
              // Add upvote
              return {
                ...q,
                upvotes: q.upvotes + 1,
                upvotedBy: [...q.upvotedBy, user?.username || ''],
              };
            }
          }
          return q;
        })
      );
      
      // Make API call
      if (hasUpvoted) {
        await axios.put(
          `${process.env.EXPO_PUBLIC_API_URL}/questions/${questionId}/remove-upvote`,
          { username: user?.username },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        await axios.put(
          `${process.env.EXPO_PUBLIC_API_URL}/questions/${questionId}/upvote`,
          { username: user?.username },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      // Refresh questions
      await fetchQuestions();
      
    } catch (error) {
      console.error('Error handling upvote:', error);
      Alert.alert('Error', 'Failed to process your vote');
      
      // Revert the optimistic update
      fetchQuestions();
    } finally {
      setProcessingUpvote(null);
    }
  };
  
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };
  
  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-blue-600 font-medium">Loading events...</Text>
      </View>
    );
  }
  
  // Empty state
  if (events.length === 0 && !loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <View className="bg-blue-50 p-8 rounded-3xl border border-blue-100 shadow-xl items-center">
          <Ionicons name="calendar-outline" size={70} color="#3b82f6" />
          <Text className="text-2xl font-bold text-gray-800 mt-4 mb-2">No Events Found</Text>
          <Text className="text-gray-600 text-center mb-6">There are no events currently scheduled. Check back later.</Text>
          <TouchableOpacity
            className="bg-blue-600 py-3 px-6 rounded-xl"
            onPress={handleRefresh}
          >
            <Text className="text-white font-semibold">Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen 
        options={{
          headerTitle: "Events",
          headerLargeTitle: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#ffffff'},
          headerTintColor: '#3b82f6',
        }} 
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3b82f6" />
        }
      >
        
        {/* Selected Event Details */}
        {selectedEvent && (
          <View className="mx-4 mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Event Banner/Image */}
            {selectedEvent.imageUrl ? (
              <Image
                source={{ uri: selectedEvent.imageUrl }}
                className="h-[200px] w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-[150px] bg-blue-50 justify-center items-center">
                <Ionicons name="calendar" size={60} color="#3b82f6" />
              </View>
            )}
            
            <View className="p-5">
              {/* Event Header */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-2xl font-bold text-gray-800 flex-1 mr-2">{selectedEvent.title}</Text>
                <View className={`px-3 py-1 rounded-full ${
                  selectedEvent.isActive ? "bg-green-100" : "bg-red-100"
                }`}>
                  <Text className={`text-xs font-semibold ${
                    selectedEvent.isActive ? "text-green-700" : "text-red-700"
                  }`}>
                    {selectedEvent.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              
              {/* Event Description */}
              <Text className="text-base text-gray-700 leading-6 mb-6">
                {selectedEvent.description}
              </Text>
              
              {/* Event Metadata Cards */}
              <View className="space-y-3 mb-4">
                <View className="bg-blue-50 rounded-xl p-4 flex-row items-center">
                  <View className="w-10 h-10 rounded-lg bg-blue-100 justify-center items-center mr-4">
                    <Ionicons name="calendar-outline" size={22} color="#3b82f6" />
                  </View>
                  <View>
                    <Text className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Date & Time</Text>
                    <Text className="text-gray-700">{formatDate(selectedEvent.date)}</Text>
                  </View>
                </View>
                
                {selectedEvent.location && (
                  <View className="bg-purple-50 rounded-xl p-4 flex-row items-center my-2">
                    <View className="w-10 h-10 rounded-lg bg-purple-100 justify-center items-center mr-4">
                      <Ionicons name="location-outline" size={22} color="#8b5cf6" />
                    </View>
                    <View>
                      <Text className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Location</Text>
                      <Text className="text-gray-700">{selectedEvent.location}</Text>
                    </View>
                  </View>
                )}
                
                {selectedEvent.organizer && (
                  <View className="bg-pink-50 rounded-xl p-4 flex-row items-center">
                    <View className="w-10 h-10 rounded-lg bg-pink-100 justify-center items-center mr-4">
                      <Ionicons name="person-outline" size={22} color="#ec4899" />
                    </View>
                    <View>
                      <Text className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-1">Organizer</Text>
                      <Text className="text-gray-700">{selectedEvent.organizer}</Text>
                    </View>
                  </View>
                )}
              </View>
              
              {/* Event footer info */}
              <View className="border-t border-gray-200 pt-4 mb-4">
                <Text className="text-xs text-gray-500 mb-1">
                  Created: {formatDate(selectedEvent.createdAt)}
                </Text>
                <Text className="text-xs text-gray-500">
                  Updated: {formatDate(selectedEvent.updatedAt)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Q&A Section */}
        {selectedEvent && (
          <View className="mx-4 mb-10 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <View className="border-b border-gray-200 p-4">
              <Text className="text-lg font-bold text-gray-800">Questions & Answers</Text>
            </View>

            <View className="p-5">
              {/* Ask a question form */}
              <View className="bg-gray-50 rounded-xl p-4 mb-5">
                <Text className="text-sm font-semibold text-blue-600 mb-2">Ask a Question</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl p-3 text-gray-800 h-[100px]"
                  value={askQuestion}
                  onChangeText={setAskQuestion}
                  placeholder="What would you like to know about this event?"
                  placeholderTextColor="#9ca3af"
                  multiline
                />
                <TouchableOpacity
                  className={`mt-3 ${(!askQuestion.trim() || submittingQuestion) 
                    ? 'bg-blue-400' 
                    : 'bg-blue-600'} rounded-xl py-3 items-center`}
                  disabled={!askQuestion.trim() || submittingQuestion}
                  onPress={handleAskQuestion}
                >
                  {submittingQuestion ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold">
                      {user ? "Submit Question" : "Login to Ask"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Questions List */}
              <Text className="text-gray-800 font-semibold mb-3">All Questions</Text>
              {questions.length > 0 ? (
                questions.map(question => {
                  const hasUpvoted = user && question.upvotedBy?.includes(user?.userId || '');
                  const isAnswering = answeringQuestionId === question._id;
                  
                  return (
                    <View key={question._id} className="bg-gray-50 rounded-xl p-4 mb-3">
                      <View className="flex-row">
                        <View className="w-8 h-8 rounded-full bg-blue-100 justify-center items-center mr-3">
                          <Ionicons name="help-circle" size={20} color="#3b82f6" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-800 mb-1.5">{question.question}</Text>
                          <View className="flex-row items-center">
                            <Text className="text-xs text-gray-500">
                              Asked by {question.username}
                            </Text>
                            <Text className="text-xs text-gray-400 mx-1">•</Text>
                            <Text className="text-xs text-gray-500">
                              {format(new Date(question.createdAt), 'MMM d, yyyy')}
                            </Text>
                          </View>
                        </View>
                        
                        {/* Upvote button */}
                        <TouchableOpacity
                          className={`flex-col items-center rounded-lg py-2 px-3  ${processingUpvote === question._id ? 'opacity-50' : ''}`}
                          onPress={() => question._id && handleUpvote(question._id)}
                          disabled={!user || processingUpvote !== null}
                        >
                          <Ionicons
                            name="arrow-up-outline"
                            size={20}
                            color={hasUpvoted ? "#175A8F" : "#6b7280"}
                          />
                          <Text className={`text-xs font-semibold mt-1 ${
                            hasUpvoted ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {question.upvotes}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Admin answer button */}
                      {user?.role === 'admin' && !question.answer && !isAnswering && (
                        <TouchableOpacity
                          className="ml-11 mt-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex-row items-center"
                          onPress={() => startAnswering(question._id || '')}
                        >
                          <Ionicons name="chatbubble-outline" size={16} color="#3b82f6" />
                          <Text className="ml-2 text-blue-600 font-medium">Answer this question</Text>
                        </TouchableOpacity>
                      )}

                      {/* Admin edit answer button */}
                      {user?.role === 'admin' && question.answer && !isAnswering && (
                        <TouchableOpacity
                          className="ml-11 mt-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 flex-row items-center"
                          onPress={() => startAnswering(question._id || '', question.answer)}
                        >
                          <Ionicons name="pencil-outline" size={16} color="#6b7280" />
                          <Text className="ml-2 text-gray-600 font-medium">Edit answer</Text>
                        </TouchableOpacity>
                      )}

                      {/* Answer input form */}
                      {isAnswering && (
                        <View className="ml-11 mt-3 bg-white border border-blue-200 rounded-lg p-3">
                          <Text className="text-sm font-semibold text-blue-600 mb-2">
                            {question.answer ? 'Edit your answer' : 'Write an answer'}
                          </Text>
                          <TextInput
                            className="border border-gray-200 rounded-lg p-3 text-gray-800 h-[100px] mb-3"
                            value={answerText}
                            onChangeText={setAnswerText}
                            placeholder="Type your answer here..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            autoFocus
                          />
                          <View className="flex-row justify-end">
                            <TouchableOpacity
                              className="bg-gray-200 px-4 py-2 rounded-lg mr-2"
                              onPress={cancelAnswering}
                            >
                              <Text className="text-gray-700 font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              className={`px-4 py-2 rounded-lg ${
                                !answerText.trim() || answerSubmitting
                                  ? 'bg-blue-400' 
                                  : 'bg-blue-600'
                              }`}
                              disabled={!answerText.trim() || answerSubmitting}
                              onPress={handleAnswerQuestion}
                            >
                              {answerSubmitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <Text className="text-white font-medium">
                                  {question.answer ? 'Update Answer' : 'Submit Answer'}
                                </Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                      
                      {/* Display answer if available and not currently editing */}
                      {question.answer && !isAnswering && (
                        <View className="bg-green-50 rounded-lg p-3 mt-3 ml-11">
                          <View className="flex-row items-center mb-1.5">
                            <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                            <Text className="text-xs font-semibold text-green-600 ml-1.5">Answer from organizer</Text>
                          </View>
                          <Text className="text-gray-700">{question.answer}</Text>
                        </View>
                      )}
                    </View>
                  );
                })
              ) : (
                <View className="items-center py-8 bg-gray-50 rounded-xl">
                  <Ionicons name="chatbubbles" size={48} color="#60a5fa" className="opacity-60 mb-4" />
                  <Text className="text-lg font-semibold text-gray-800 mb-2">No questions yet</Text>
                  <Text className="text-gray-600 text-center">Be the first to ask a question about this event!</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EventsScreen;