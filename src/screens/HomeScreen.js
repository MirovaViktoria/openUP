import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  { id: "power", label: "Силовая", icon: "barbell", color: "#FF9500", defaultUnits: ["weight", "sets", "reps"] },
  { id: "cardio", label: "Кардио", icon: "heart", color: "#FF2D55", defaultUnits: ["time", "distance"] },
  { id: "yoga", label: "Йога", icon: "body", color: "#5856D6", defaultUnits: ["time"] },
  { id: "study", label: "Учеба", icon: "book", color: "#007AFF", defaultUnits: ["time", "pages"] },
  { id: "meditation", label: "Медитация", icon: "leaf", color: "#34C759", defaultUnits: ["time"] },
  { id: "other", label: "Другое", icon: "ellipsis-horizontal", color: "#8E8E93", defaultUnits: ["time"] },
];

const UNITS = {
  weight: { id: "weight", label: "Вес (кг)", type: "number", icon: "fitness" },
  sets: { id: "sets", label: "Подходы", type: "number", icon: "repeat" },
  reps: { id: "reps", label: "Повторы", type: "number", icon: "refresh" },
  time: { id: "time", label: "Время (мин)", type: "number", icon: "time" },
  distance: { id: "distance", label: "Расст. (км)", type: "number", icon: "walk" },
  pages: { id: "pages", label: "Страницы", type: "number", icon: "document-text" },
};

export default function HomeScreen({ navigation, profileId, onLogout }) {
  const insets = useSafeAreaInsets();
  // Рассчитываем высоту твоей панели управления (из предыдущего шага)
  const TAB_BAR_HEIGHT = 70 + insets.bottom;
  const [text, setText] = useState("");
  const [workouts, setWorkouts] = useState([]);
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // New state for Unit Constructor
  const [activeUnits, setActiveUnits] = useState([]); // Array of unit objects with values
  const [showCatModal, setShowCatModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);

  useEffect(() => {
    loadWorkouts();
  }, [profileId]);

  // Load default units when category changes
  useEffect(() => {
    if (selectedCat) {
      const defaults = selectedCat.defaultUnits.map(unitId => ({
        ...UNITS[unitId],
        value: "",
      }));
      setActiveUnits(defaults);
    }
  }, [selectedCat]);

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

  const onChangeDate = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const addWorkout = () => {
    if (text.trim().length > 0) {
      // Filter out empty units to save space
      const filledUnits = activeUnits.filter(u => u.value && u.value.trim() !== "");

      const newEntry = {
        id: Date.now().toString(),
        name: text,
        date: date.toLocaleDateString("ru-RU"),
        category: selectedCat,
        units: filledUnits,
      };

      const newWorkouts = [newEntry, ...workouts];
      setWorkouts(newWorkouts);
      saveWorkouts(newWorkouts);

      setText("");
      // Reset units to defaults (clearing values)
      const defaults = selectedCat.defaultUnits.map(unitId => ({
        ...UNITS[unitId],
        value: "",
      }));
      setActiveUnits(defaults);

      Keyboard.dismiss();
    }
  };

  const deleteWorkout = (id) => {
    const filteredWorkouts = workouts.filter((item) => item.id !== id);
    setWorkouts(filteredWorkouts);
    saveWorkouts(filteredWorkouts);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("active_profile_id");
    onLogout();
  };

  const updateUnitValue = (index, value) => {
    const updated = [...activeUnits];
    updated[index].value = value;
    setActiveUnits(updated);
  };

  const removeUnit = (index) => {
    const updated = [...activeUnits];
    updated.splice(index, 1);
    setActiveUnits(updated);
  };

  const addUnit = (unitKey) => {
    const newUnit = { ...UNITS[unitKey], value: "" };
    setActiveUnits([...activeUnits, newUnit]);
    setShowUnitModal(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top + 10 : 20 }]}>
      {/* --- HEADER --- */}
      <View style={styles.topHeader}>
        <Text style={styles.header}>Мой Тренер 💪</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings", { profileId, onLogout })}
            style={styles.iconButton}
          >
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- ADD CARD --- */}
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Что сегодня делали?"
          value={text}
          onChangeText={setText}
        />

        {/* Category Selector */}
        <TouchableOpacity
          style={[styles.selectorButton, { borderColor: selectedCat.color }]}
          onPress={() => setShowCatModal(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={selectedCat.icon} size={24} color={selectedCat.color} style={{ marginRight: 10 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1C1C1E' }}>{selectedCat.label}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#8E8E93" />
        </TouchableOpacity>

        {/* Units Constructor */}
        <View style={styles.unitsContainer}>
          {activeUnits.map((unit, index) => (
            <View key={index} style={styles.unitRow}>
              <View style={styles.unitLabelContainer}>
                <Ionicons name={unit.icon} size={16} color="#555" style={{ marginRight: 5 }} />
                <Text style={styles.unitLabel}>{unit.label}</Text>
              </View>
              <TextInput
                style={styles.unitInput}
                placeholder="0"
                keyboardType="numeric"
                value={unit.value}
                onChangeText={(val) => updateUnitValue(index, val)}
              />
              <TouchableOpacity onPress={() => removeUnit(index)} style={styles.removeUnitBtn}>
                <Ionicons name="close-circle" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addUnitButton} onPress={() => setShowUnitModal(true)}>
            <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.addUnitText}>Добавить параметр</Text>
          </TouchableOpacity>
        </View>

        {/* Date & Add Actions */}
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
            <Text style={styles.addButtonText}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

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
            <TouchableOpacity onPress={() => deleteWorkout(item.id)} style={{ padding: 5 }}>
              <Ionicons name="trash-outline" size={22} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* --- CATEGORY MODAL --- */}
      <Modal visible={showCatModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите категорию</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCat(cat);
                    setShowCatModal(false);
                  }}
                >
                  <Ionicons name={cat.icon} size={24} color={cat.color} style={{ marginRight: 15 }} />
                  <Text style={styles.modalItemText}>{cat.label}</Text>
                  {selectedCat.id === cat.id && (
                    <Ionicons name="checkmark" size={24} color="#007AFF" style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setShowCatModal(false)}
            >
              <Text style={styles.closeModalText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- ADD UNIT MODAL --- */}
      <Modal visible={showUnitModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить параметр</Text>
            <View style={styles.unitGrid}>
              {Object.keys(UNITS).map((key) => {
                const u = UNITS[key];
                // Should allow adding if not already present? Or just allow multiple? 
                // Allow multiple sets? Logic says maybe unique types for now, 
                // but user might want "Set 1", "Set 2". 
                // For now let's just show all available types.
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.unitGridItem}
                    onPress={() => addUnit(key)}
                  >
                    <Ionicons name={u.icon} size={24} color="#007AFF" />
                    <Text style={styles.unitGridText}>{u.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setShowUnitModal(false)}
            >
              <Text style={styles.closeModalText}>Закрыть</Text>
            </TouchableOpacity>
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
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  input: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderColor: "#E5E5EA",
    paddingBottom: 8,
    marginBottom: 15,
    color: "#1C1C1E",
  },
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  unitsContainer: {
    marginBottom: 15,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  unitLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 110,
  },
  unitLabel: {
    fontSize: 14,
    color: '#3A3A3C',
  },
  unitInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    marginRight: 10,
    color: "#1C1C1E",
  },
  removeUnitBtn: {
    padding: 4,
  },
  addUnitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  addUnitText: {
    color: '#007AFF',
    marginLeft: 5,
    fontWeight: '600',
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  dateButton: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: "#007AFF",
    marginLeft: 5,
    fontWeight: '600'
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  // List Item
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

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1C1C1E',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalItemText: {
    fontSize: 17,
    color: '#1C1C1E',
  },
  closeModalBtn: {
    marginTop: 15,
    alignItems: 'center',
    padding: 10,
  },
  closeModalText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  unitGridItem: {
    width: '30%',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  unitGridText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: '#3A3A3C',
  },
});

