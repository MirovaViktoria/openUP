import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

const CATEGORIES = [
  { id: "power", label: "Силовая", icon: "barbell", color: "#FF9500" },
  { id: "cardio", label: "Кардио", icon: "heart", color: "#FF2D55" },
  { id: "stretch", label: "Йога", icon: "body", color: "#5856D6" },
];

export default function HomeScreen({ navigation, profileId, onLogout }) {
  const [text, setText] = useState("");
  const [workouts, setWorkouts] = useState([]);
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]); // По умолчанию Силовая
  const [date, setDate] = useState(new Date()); // Текущая дата
  const [showPicker, setShowPicker] = useState(false); // Показать/скрыть календарь

  useEffect(() => {
    loadWorkouts();
  }, [profileId]);

  const loadWorkouts = async () => {
    const savedData = await AsyncStorage.getItem(`@workout_logs_${profileId}`);
    if (savedData) setWorkouts(JSON.parse(savedData));
    else setWorkouts([]); // Clear if no data
  };

  const saveWorkouts = async (data) => {
    await AsyncStorage.setItem(`@workout_logs_${profileId}`, JSON.stringify(data));
  };

  const onChangeDate = (event, selectedDate) => {
    setShowPicker(false); // Скрываем календарь после выбора
    if (selectedDate) setDate(selectedDate);
  };

  const addWorkout = () => {
    if (text.trim().length > 0) {
      const newEntry = {
        id: Date.now().toString(),
        name: text,
        date: date.toLocaleDateString("ru-RU"),
        category: selectedCat, // Сохраняем категорию целиком
      };
      const newWorkouts = [newEntry, ...workouts];
      setWorkouts(newWorkouts);
      saveWorkouts(newWorkouts);
      setText("");
      Keyboard.dismiss();
    }
  };

  const deleteWorkout = (id) => {
    const filteredWorkouts = workouts.filter((item) => item.id !== id);
    setWorkouts(filteredWorkouts);
    saveWorkouts(filteredWorkouts); // Не забываем обновить память телефона
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("active_profile_id");
    onLogout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.header}>Мой Тренер 💪</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Settings", { profileId, onLogout })
            }
            style={styles.iconButton}
          >
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Что сегодня тренируем?"
          value={text}
          onChangeText={setText}
        />

        {/* Выбор категории */}
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catButton,
                selectedCat.id === cat.id && {
                  borderColor: cat.color,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedCat(cat)}
            >
              <Ionicons name={cat.icon} size={20} color={cat.color} />
              <Text style={{ fontSize: 12, color: "#555" }}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
            <Text style={styles.dateText}>
              {date.toLocaleDateString("ru-RU")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={addWorkout}>
            <Text style={styles.addButtonText}>Добавить запись</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Календарь (показывается только при showPicker = true) */}
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.item,
              { borderLeftColor: item.category.color, borderLeftWidth: 5 },
            ]}
          >
            <View style={styles.itemContent}>
              <Ionicons
                name={item.category.icon}
                size={24}
                color={item.category.color}
                style={{ marginRight: 12 }}
              />
              <View>
                <Text style={styles.itemDate}>
                  {item.date} • {item.category.label}
                </Text>
                <Text style={styles.itemText}>{item.name}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => deleteWorkout(item.id)}>
              <Ionicons name="trash-outline" size={20} color="#CCC" />
            </TouchableOpacity>
          </View>
        )}
      />
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
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1C1C1E",
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 5,
    marginLeft: 15,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#E5E5EA",
    paddingBottom: 10,
    fontSize: 17,
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateButton: { backgroundColor: "#E5E5EA", padding: 10, borderRadius: 8 },
  dateText: { fontSize: 14, color: "#3A3A3C" },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: { color: "#FFF", fontWeight: "bold" },
  item: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemDate: { fontSize: 12, color: "#8E8E93", marginBottom: 4 },
  itemText: { fontSize: 17, color: "#1C1C1E", fontWeight: "500" },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  catButton: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  item: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Тень
    elevation: 2,
  },
});
