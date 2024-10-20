import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native';
import HomeScreen from './HomeScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const Stack = createNativeStackNavigator();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer independent={true}>
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
