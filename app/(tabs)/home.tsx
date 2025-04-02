import { Pressable, Text, View } from 'react-native'
import React from 'react'
import {  useRouter } from 'expo-router'

const home = () => {
   const router = useRouter();
  return (
    <View className='flex-1 items-center'>
      <Text>Welcome to the home screen!</Text>
      <Text>Explore various topics and enhance your skills.</Text>
      <Text>Full Section will be Available Soon...</Text>
    </View>
  )
}

export default home