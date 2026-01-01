import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileSelectScreen({ navigation, onSelectProfile }) {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const storedProfiles = await AsyncStorage.getItem("profiles");
      if (storedProfiles) {
        setProfiles(JSON.parse(storedProfiles));
      }
    } catch (error) {
      console.error("Failed to load profiles", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (profileId) => {
    await AsyncStorage.setItem("active_profile_id", profileId);
    onSelectProfile(); // Refresh app state
  };

  const handleCreateNew = () => {
    navigation.navigate("CreateProfile");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.profileCard}
      onPress={() => handleSelect(item.id)}
    >
      <View style={styles.avatarContainer}>
        <Ionicons name="person" size={30} color="#FFF" />
      </View>
      <Text style={styles.profileName}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Выберите профиль</Text>

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Нет профилей. Создайте первый!</Text>
        }
      />

      <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
        <Ionicons name="add-circle-outline" size={24} color="#FFF" />
        <Text style={styles.createButtonText}>Создать профиль</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1C1C1E",
  },
  list: {
    paddingBottom: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  profileName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  emptyText: {
    textAlign: "center",
    color: "#8E8E93",
    marginTop: 20,
    fontSize: 16,
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: "#34C759", // Green for "Add"
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  createButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 10,
  },
});
