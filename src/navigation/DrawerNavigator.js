import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import TrainingGraphScreen from '../screens/TrainingGraphScreen';
import ProfileSelectScreen from '../screens/ProfileSelectScreen'; // Or a dedicated ProfileManageScreen if exists
// If you want a specific "Profile Management" screen inside the drawer that is different from user selection, 
// you might need to create it. For now, I'll assume we might want to navigate back to ProfileSelect or have a settings page.
// The prompt said "Profile Management", let's use SettingsScreen for now or repurpose.
// The user asked for "Profile Management" which implies editing current profile. 
// Existing SettingsScreen might be a good place or a new ProfileScreen.
// Let's use SettingsScreen as "Profile" in the drawer for now, as it usually contains profile management.

import SettingsScreen from '../screens/SettingsScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator({ route, navigation }) {
    // We can get params passed from AppNavigator if needed, e.g. profileId
    const { profileId, onLogout } = route.params || {};

    return (
        <Drawer.Navigator initialRouteName="Home">
            <Drawer.Screen
                name="Home"
                component={HomeScreen}
                initialParams={{ profileId, onLogout }} // Pass params down
                options={{ title: 'Главная' }}
            />
            <Drawer.Screen
                name="TrainingGraph"
                component={TrainingGraphScreen}
                options={{ title: 'График тренировок' }}
            />
            <Drawer.Screen
                name="Profile"
                component={SettingsScreen}
                initialParams={{ profileId, onLogout }} // Assuming Settings handles profile edits
                options={{ title: 'Управление профилем' }}
            />
            {/* Functionality to logout can be a custom drawer item or inside Settings */}
        </Drawer.Navigator>
    );
}
