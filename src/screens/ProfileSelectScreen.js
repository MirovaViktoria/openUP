import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileSelectScreen({ navigation, onSelectProfile }) {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [inputPassword, setInputPassword] = useState("");

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

  const handleSelect = async (profile) => {
    if (profile.password && profile.password.trim() !== "") {
      setSelectedProfile(profile);
      setInputPassword("");
      setModalVisible(true);
    } else {
      await activateProfile(profile.id);
    }
  };

  const verifyPassword = async () => {
    if (inputPassword === selectedProfile.password) {
      setModalVisible(false);
      await activateProfile(selectedProfile.id);
    } else {
      Alert.alert("Ошибка", "Неверный пароль");
    }
  };

  const activateProfile = async (profileId) => {
    await AsyncStorage.setItem("active_profile_id", profileId);
    onSelectProfile(); // Refresh app state
  };

  const handleCreateNew = () => {
    navigation.navigate("CreateProfile");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.profileCard}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.avatarContainer}>
        <Ionicons name="person" size={30} color="#FFF" />
      </View>
      <Text style={styles.profileName}>{item.name}</Text>
      {item.password ? (
        <Ionicons name="lock-closed" size={20} color="#999" style={{ marginRight: 10 }} />
      ) : (
        <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
      )}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Введите пароль</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Пароль"
              value={inputPassword}
              onChangeText={setInputPassword}
              secureTextEntry
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textStyle}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonOpen]}
                onPress={verifyPassword}
              >
                <Text style={styles.textStyle}>Войти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Modal styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
  modalInput: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    fontSize: 18,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    minWidth: 100,
    alignItems: "center",
  },
  buttonOpen: {
    backgroundColor: "#007AFF",
  },
  buttonClose: {
    backgroundColor: "#FF3B30",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
