import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateProfileScreen({ onCheck }) {
  // Получаем onCheck из пропсов
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSave = async () => {
    if (name.trim().length > 0) {
      try {
        const newProfile = {
          id: Date.now().toString(),
          name: name,
          password: password, // Store password
          createdAt: new Date(),
        };

        // 1. Get existing profiles
        const existingProfilesJson = await AsyncStorage.getItem("profiles");
        const profiles = existingProfilesJson
          ? JSON.parse(existingProfilesJson)
          : [];

        // 2. Add new profile
        const updatedProfiles = [...profiles, newProfile];
        await AsyncStorage.setItem(
          "profiles",
          JSON.stringify(updatedProfiles)
        );

        // 3. Set as active
        await AsyncStorage.setItem("active_profile_id", newProfile.id);

        // 4. Notify navigator
        onCheck();
      } catch (error) {
        console.error("Error creating profile:", error);
      }
    } else {
      alert("Введите имя");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добро пожаловать!</Text>
      <TextInput
        style={styles.input}
        placeholder="Как вас зовут?"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль (необязательно)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Создать профиль" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 10, fontSize: 18 },
});
