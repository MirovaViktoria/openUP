import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';
import ScaleButton from '../components/ScaleButton';

export default function HomeScreen({ navigation, route }) {
  const { profileId, onLogout } = route.params || {};
  const insets = useSafeAreaInsets();
  // Рассчитываем высоту твоей панели управления (из предыдущего шага)
  const TAB_BAR_HEIGHT = 70 + insets.bottom;
  const [workouts, setWorkouts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (profileId) {
        loadWorkouts();
      }
    }, [profileId])
  );

  const loadWorkouts = async () => {
    try {
      const savedData = await AsyncStorage.getItem(`@workout_logs_${profileId}`);
      if (savedData) setWorkouts(JSON.parse(savedData));
      else setWorkouts([]);
    } catch (e) {
      console.error("Failed to load workouts", e);
    }
  };

  const saveWorkouts = async (data) => {
    try {
      await AsyncStorage.setItem(`@workout_logs_${profileId}`, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save workouts", e);
    }
  };

  const deleteWorkout = (id) => {
    const filteredWorkouts = workouts.filter((item) => item.id !== id);
    setWorkouts(filteredWorkouts);
    saveWorkouts(filteredWorkouts);
  };

  const handleLogout = async () => {
    Alert.alert("Уведомление", "Вы вышли из профиля");
    // We removed the local removeItem call because onLogout (from AppNavigator) now handles it
    onLogout();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top + 10 : 20 }]}>
      {/* --- HEADER --- */}
      <View style={styles.topHeader}>
        <Text style={styles.header}>Мой Тренер 💪</Text>
        <View style={styles.headerButtons}>
          <ScaleButton
            onPress={() => navigation.navigate("Settings", { profileId, onLogout })}
            style={styles.iconButton}
          >
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
          </ScaleButton>
          <ScaleButton onPress={handleLogout} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          </ScaleButton>
        </View>
      </View>

      {/* --- LIST --- */}
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
        renderItem={({ item }) => (
          <View
            style={[styles.item, { borderLeftColor: item.category.color, borderLeftWidth: 5 }]}
          >
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <Ionicons
                  name={item.category.icon}
                  size={20}
                  color={item.category.color}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.itemCatLabel}>{item.category.label}</Text>
                <Text style={styles.itemDate}>{item.date}</Text>
              </View>

              <Text style={styles.itemText}>{item.name}</Text>

              {/* Display Units */}
              {item.units && item.units.length > 0 && (
                <View style={styles.itemUnits}>
                  {item.units.map((u, idx) => (
                    <View key={idx} style={styles.itemUnitTag}>
                      <Text style={styles.itemUnitText}>
                        {u.label}: <Text style={{ fontWeight: 'bold' }}>{u.value}</Text>
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            {/* Delete button (optional, keep if user wants to manage list here) */}
            <TouchableOpacity onPress={() => deleteWorkout(item.id)} style={{ padding: 5 }}>
              <Ionicons name="trash-outline" size={22} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: '#8E8E93', fontSize: 16 }}>Нет записей. Нажми "+", чтобы добавить.</Text>
          </View>
        }
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 20,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
  },
  // List Item Styles
  item: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
    marginRight: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemCatLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A3A3C',
    marginRight: 8,
  },
  itemDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  itemText: {
    fontSize: 18,
    color: "#1C1C1E",
    fontWeight: "600",
    marginBottom: 8,
  },
  itemUnits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemUnitTag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  itemUnitText: {
    fontSize: 12,
    color: '#3A3A3C',
  },
});
