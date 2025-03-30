import { Pressable, Text, View } from 'react-native'
import React from 'react'
import {  useRouter } from 'expo-router'

const home = () => {
   const router = useRouter();
  return (
    <View className='flex-1 '>
      <Text>Welcome to the home screen!</Text>
      <Text>Explore various topics and enhance your skills.</Text>
      <Pressable className='bg-blue-500 p-3 w-1/3 rounded-lg mt-4' onPress={() => router.push('/')}>
         <Text>Main Page</Text>
      </Pressable>
    </View>
  )
}

export default home