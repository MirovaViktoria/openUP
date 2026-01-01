import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CreateProfileScreen from "../screens/CreateProfileScreen";
import ProfileSelectScreen from "../screens/ProfileSelectScreen";
import HomeScreen from "../screens/HomeScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {

  const [activeProfileId, setActiveProfileId] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 1. Check for legacy migration
      const legacyProfile = await AsyncStorage.getItem("user_profile");
      const profiles = await AsyncStorage.getItem("profiles");

      if (legacyProfile && !profiles) {
        // Migrate legacy user
        const parsedLegacy = JSON.parse(legacyProfile);
        const newProfile = {
          id: Date.now().toString(),
          name: parsedLegacy.name,
          createdAt: parsedLegacy.createdAt
        };

        // Migrate Data
        const legacyData = await AsyncStorage.getItem("@workout_logs");
        if (legacyData) {
          await AsyncStorage.setItem(`@workout_logs_${newProfile.id}`, legacyData);
          await AsyncStorage.removeItem("@workout_logs");
        }

        await AsyncStorage.setItem("profiles", JSON.stringify([newProfile]));
        await AsyncStorage.setItem("active_profile_id", newProfile.id);
        setActiveProfileId(newProfile.id);

        // Clean up legacy
        await AsyncStorage.removeItem("user_profile");
      } else {
        // Normal check
        const activeId = await AsyncStorage.getItem("active_profile_id");
        setActiveProfileId(activeId);
      }
    } catch (e) {
      console.error("Auth check failed", e);
    } finally {
      setIsLoading(false);
    }
  };



  if (isLoading) return null; // Или экран загрузки

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!activeProfileId ? (
          <>
            <Stack.Screen name="ProfileSelect">
              {(props) => (
                <ProfileSelectScreen {...props} onSelectProfile={checkAuth} />
              )}
            </Stack.Screen>
            <Stack.Screen name="CreateProfile">
              {(props) => (
                <CreateProfileScreen {...props} onCheck={checkAuth} />
              )}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="MainApp">
            {(props) => (
              <HomeScreen
                {...props}
                onLogout={checkAuth}
                profileId={activeProfileId}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
