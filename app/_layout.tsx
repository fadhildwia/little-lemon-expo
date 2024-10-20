import { NavigationContainer } from '@react-navigation/native';
import * as DefaultSplash from "expo-splash-screen";
import 'react-native-reanimated';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert, SafeAreaView } from 'react-native';
import HomeScreen from './HomeScreen';
import { AuthContext } from '@/contexts/AuthContext';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { IUserType } from '@/types/userType';
import { useFonts } from 'expo-font';
import SplashScreen from "./SplashScreen";
import OnboardingScreen from './Onboarding';

DefaultSplash.preventAutoHideAsync();
const Stack = createNativeStackNavigator();

const initialState = {
  isLoading: true,
  isOnboardingCompleted: false,
};

export default function RootLayout() {
const [state, dispatch] = useReducer((prevState: any, action: { type: string; isOnboardingCompleted: any; }) => {
    if (action.type === "onboard") {
      return {
        ...prevState,
        isLoading: false,
        isOnboardingCompleted: action.isOnboardingCompleted,
      };
    }
  }, [initialState]);

  const [user, setUser] = useState<IUserType>();

  const checkOnboardingStatus = useCallback(async () => {
    let user = null;

    try {
      const value = await AsyncStorage.getItem("user");

      if (value !== null) {
        const data: IUserType = JSON.parse(value);

        user = value;
        setUser(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (user) {
        dispatch({ type: "onboard", isOnboardingCompleted: true });
      } else {
        dispatch({ type: "onboard", isOnboardingCompleted: false });
      }
    }
  }, []);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const authContextValue = useMemo(
    () => ({
      user: user,
      onboard: async (name: string, email: string) => {
        const data = {
          fullName: name,
          firstName: name,
          email: email,
        };

        try {
          const value = JSON.stringify(data);

          await AsyncStorage.setItem("user", value);
          checkOnboardingStatus();
        } catch (error) {
          console.error(error);
        } finally {
          dispatch({ type: "onboard", isOnboardingCompleted: true });
        }
      },
      update: async (data: IUserType) => {
        try {
          const value = JSON.stringify(data);

          await AsyncStorage.setItem("user", value);
          checkOnboardingStatus();
        } catch (error) {
          console.error(error);
        } finally {
          Alert.alert("Success", "Successfully saved changes!");
        }
      },
      logout: async () => {
        try {
          await AsyncStorage.clear();
        } catch (error) {
          console.error(error);
        } finally {
          setUser(undefined);
          dispatch({ type: "onboard", isOnboardingCompleted: false });
        }
      },
    }),
    [user]
  );

  const [loaded, error] = useFonts({
    "Karla-Regular": require("../assets/fonts/Karla-Regular.ttf"),
    "Karla-Medium": require("../assets/fonts/Karla-Medium.ttf"),
    "Karla-Bold": require("../assets/fonts/Karla-Bold.ttf"),
    "Karla-ExtraBold": require("../assets/fonts/Karla-ExtraBold.ttf"),
    "MarkaziText-Regular": require("../assets/fonts/MarkaziText-Regular.ttf"),
    "MarkaziText-Medium": require("../assets/fonts/MarkaziText-Medium.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      DefaultSplash.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (state.isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AuthContext.Provider value={authContextValue}>
        <NavigationContainer independent={true}>
          <Stack.Navigator initialRouteName="Home">
            {state.isOnboardingCompleted ? (
              <>
                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{ headerShown: false }}
                />
              </>
            ) : (
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{ headerShown: false }}
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </SafeAreaView>
  );
}
