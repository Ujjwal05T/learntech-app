import { Tabs } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

export default function TabLayout() {
  const isDark = false
  
  // Define your custom colors
  const activeColor = '#4285F4'; // Blue color for active tab
  const inactiveColor = isDark ? '#9CA3AF' : '#6B7280'; // Gray for inactive
  const backgroundColor = isDark ? '#1F2937' : '#FFFFFF';
  const borderTopColor = isDark ? '#374151' : '#E5E7EB';

  return (
    <Tabs
      screenOptions={{
        // Tab bar styling
        tabBarStyle: {
          height: 60,
          backgroundColor: backgroundColor,
          borderTopColor: borderTopColor,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        
        // Tab bar label styling
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 5,
        },
        
        // Active & inactive colors
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        
        // No header shadow
        headerStyle: {
          backgroundColor: backgroundColor,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: borderTopColor,
        },
        headerTintColor: isDark ? '#FFFFFF' : '#000000',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Animated.View
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            >
              <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
            </Animated.View>
          ),
          headerTitle: 'LearnTech',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: activeColor,
          },
        }} 
      />

      <Tabs.Screen 
        name="events" 
        options={{
          title: 'Events',
          tabBarLabel: 'Events',
          headerShown: true,
          tabBarIcon: ({ color, size, focused }) => (
            <Animated.View
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            >
              <Ionicons name={focused ? "calendar" : "calendar-outline"} size={size} color={color} />
            </Animated.View>
          ),
        }}
      />
      
      <Tabs.Screen 
        name="roadmaps" 
        options={{
          title: 'Roadmaps',
          tabBarLabel: 'Roadmaps',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Animated.View
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            >
              <Ionicons name={focused ? "book" : "book-outline"} size={size} color={color} />
            </Animated.View>
          ),
        }} 
      />
      
      <Tabs.Screen 
        name="news" 
        options={{
          title: 'News',
          headerShown: false,
          tabBarLabel: 'News',
          tabBarIcon: ({ color, size, focused }) => (
            <Animated.View
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }],
                backgroundColor: focused ? `${activeColor}20` : 'transparent',
                borderRadius: 20,
                padding: 8,
              }}
            >
              <Ionicons name={focused ? "compass" : "compass-outline"} size={size} color={color} />
            </Animated.View>
          ),
        }} 
      />
      
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'My Profile',
          headerShown: false,
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Animated.View
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            >
              <FontAwesome5 name={focused ? "user-alt" : "user"} size={size-2} color={color} />
            </Animated.View>
          ),
          
        }}
      />
    </Tabs>
  );
}