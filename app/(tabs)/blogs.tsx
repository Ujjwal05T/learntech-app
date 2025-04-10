import { View, Text, ScrollView, Image, TouchableOpacity, Linking } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

// Blog data with real links
const blogPosts = [
  {
    id: 1,
    title: 'Getting Started with React Native',
    excerpt: 'Learn the basics of React Native and start building your first mobile app.',
    date: 'April 5, 2025',
    readTime: '5 min read',
    category: 'React Native',
    imageUrl: 'https://th.bing.com/th/id/OIP.e9kB0lrzur0Gfv4XKH5_NgHaEW?w=297&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
    url: 'https://reactnative.dev/docs/getting-started'
  },
  {
    id: 2,
    title: 'Mastering TypeScript for React Development',
    excerpt: 'Discover how TypeScript can improve your React applications with static typing.',
    date: 'April 2, 2025',
    readTime: '8 min read',
    category: 'TypeScript',
    imageUrl: 'https://th.bing.com/th/id/OIP.XYpMeQ13WpYzs53OSjQy2AHaDv?w=338&h=177&c=7&r=0&o=5&dpr=1.3&pid=1.7',
    url: 'https://codezup.com/mastering-typescript-with-react/'
  },
  {
    id: 3,
    title: 'CSS-in-JS Solutions for React Native',
    excerpt: 'Compare different styling approaches for React Native apps.',
    date: 'March 28, 2025',
    readTime: '6 min read',
    category: 'Styling',
    imageUrl: 'https://th.bing.com/th/id/OIP.qDssXLz-fIhZLPlkNMLszgHaDs?w=306&h=174&c=7&r=0&o=5&dpr=1.3&pid=1.7',
    url: 'https://www.4waytechnologies.com/blog/styling-in-react-native-a-guide-to-css-in-js-and-design-principles'
  },
  {
    id: 4,
    title: 'Building Accessible React Native Apps',
    excerpt: 'Best practices for creating inclusive mobile experiences for all users.',
    date: 'March 25, 2025',
    readTime: '7 min read',
    category: 'Accessibility',
    imageUrl: 'https://th.bing.com/th/id/OIP.IWeIi3fezu9vSOan_CgkcAHaD4?w=331&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
    url: 'https://reactnative.dev/docs/accessibility'
  },
]

const CategoryBadge = ({ category }:any) => (
  <View className="bg-blue-100 px-2 py-1 rounded-full">
    <Text className="text-xs text-blue-700 font-medium">{category}</Text>
  </View>
)

const BlogCard = ({ post }: any) => {
  const handleReadMore = () => {
    Linking.openURL(post.url)
      .catch(err => console.error('An error occurred opening the link:', err));
  };

  return (
    <TouchableOpacity 
      className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden border border-gray-100"
      activeOpacity={0.9}
      onPress={handleReadMore}
    >
      <Image 
        source={{ uri: post.imageUrl }} 
        className="w-full h-48" 
        resizeMode="cover"
      />
      <View className="p-5">
        <View className="flex-row mb-2">
          <CategoryBadge category={post.category} />
        </View>
        <Text className="text-xl font-bold text-gray-800 mb-1">{post.title}</Text>
        <View className="flex-row items-center mb-3">
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text className="text-sm text-gray-500 ml-1 mr-3">{post.date}</Text>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text className="text-sm text-gray-500 ml-1">{post.readTime}</Text>
        </View>
        <Text className="text-base text-gray-700 mb-3">{post.excerpt}</Text>
        <View className="flex-row items-center">
          <Text className="text-blue-600 font-semibold mr-1">Read more</Text>
          <Ionicons name="arrow-forward" size={16} color="#2563EB" />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const Blogs = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 pt-6 mb-3">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-gray-900">Latest Articles</Text>
          <TouchableOpacity>
            <Text className="text-blue-600 font-semibold">See all</Text>
          </TouchableOpacity>
        </View>
        {blogPosts.map(post => (
          <BlogCard key={post.id} post={post} />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Blogs