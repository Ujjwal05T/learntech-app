import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import '../global.css';


export default function App() {
  return (
    <View style={styles.container}>
      <Text>Welcome to LearnTech!</Text>
      <StatusBar style="auto" />
      <Text>LearnTech is a platform for learning and sharing knowledge.</Text>
      <Text>Explore various topics and enhance your skills.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
