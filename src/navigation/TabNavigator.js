import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
// Импортируем хук для работы с безопасными зонами
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Твои экраны (оставляем без изменений)
import HomeScreen from '../screens/HomeScreen';
import TrainingGraphScreen from '../screens/TrainingGraphScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AddActionScreen from '../screens/AddActionScreen';
import ScaleButton from '../components/ScaleButton';

const Tab = createBottomTabNavigator();

// Кнопка "+" в центре
const CustomTabBarButton = ({ children, onPress, bottomInset }) => (
    <ScaleButton
        style={{
            // Сдвигаем кнопку вверх относительно динамического низа
            top: -30,
            justifyContent: 'center',
            alignItems: 'center',
            ...styles.shadow
        }}
        onPress={onPress}
    >
        <View style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: '#3b0066',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Ionicons name="add" size={40} color="#fff" />
        </View>
    </ScaleButton>
);

export default function TabNavigator({ route }) {
    const { profileId, onLogout } = route.params || {};

    // Получаем значение системного отступа снизу
    const insets = useSafeAreaInsets();

    const bottomPadding = insets.bottom > 0 ? insets.bottom : 20;

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarShowLabel: true,
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                    backgroundColor: '#ffffff',
                    height: 70 + insets.bottom,
                    // Этот отступ вытолкнет иконки ВЫШЕ кнопок телефона
                    paddingBottom: bottomPadding,
                    paddingTop: 12,
                    borderTopWidth: 0,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    ...styles.shadow
                },
                tabBarActiveTintColor: '#3b0066',
                tabBarInactiveTintColor: '#748c94',
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '700',
                    marginBottom: Platform.OS === 'android' ? 5 : 0,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                initialParams={{ profileId, onLogout }}
                options={{
                    tabBarLabel: 'СЕГОДНЯ',
                    tabBarIcon: ({ focused }) => (
                        <Ionicons name={focused ? "ellipse" : "ellipse-outline"} size={24} color={focused ? "#3b0066" : "#748c94"} />
                    ),
                }}
            />
            <Tab.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{
                    tabBarLabel: 'КАЛЕНДАРЬ',
                    tabBarIcon: ({ focused }) => (
                        <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={focused ? "#3b0066" : "#748c94"} />
                    ),
                }}
            />
            <Tab.Screen
                name="Add"
                component={AddActionScreen}
                initialParams={{ profileId }}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Ionicons name="add" size={40} color="#fff" />
                    ),
                    tabBarButton: (props) => (
                        <CustomTabBarButton {...props} />
                    ),
                    tabBarLabel: () => null,
                }}
            />
            <Tab.Screen
                name="TrainingGraph"
                component={TrainingGraphScreen}
                options={{
                    tabBarLabel: 'ГРАФИК',
                    tabBarIcon: ({ focused }) => (
                        <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={24} color={focused ? "#3b0066" : "#748c94"} />
                    ),
                    headerShown: true,
                    title: 'График тренировок'
                }}
            />
            <Tab.Screen
                name="Profile"
                component={SettingsScreen}
                initialParams={{ profileId, onLogout }}
                options={{
                    tabBarLabel: 'ПРОФИЛЬ',
                    tabBarIcon: ({ focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={24} color={focused ? "#3b0066" : "#748c94"} />
                    ),
                    headerShown: true,
                    title: 'Управление профилем'
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#7F5DF0',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    }
});