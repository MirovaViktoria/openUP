import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from '../constants/colors';

// Configure locale for Russian
LocaleConfig.locales['ru'] = {
    monthNames: [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ],
    monthNamesShort: ['Янв.', 'Фев.', 'Март', 'Апр.', 'Май', 'Июнь', 'Июль', 'Авг.', 'Сент.', 'Окт.', 'Нояб.', 'Дек.'],
    dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    today: "Сегодня"
};
LocaleConfig.defaultLocale = 'ru';

export default function CalendarScreen({ route }) {
    const { profileId } = route.params || {};
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [workouts, setWorkouts] = useState([]);
    const [markedDates, setMarkedDates] = useState({});
    const [dayWorkouts, setDayWorkouts] = useState([]);

    useFocusEffect(
        useCallback(() => {
            if (profileId) {
                loadWorkouts();
            }
        }, [profileId])
    );

    useEffect(() => {
        updateUI(workouts, selectedDate);
    }, [workouts, selectedDate]);

    // Robust date normalizer
    const normalizeDate = (dateStr) => {
        if (!dateStr) return null;

        // Handle DD.MM.YYYY
        if (dateStr.includes('.')) {
            const parts = dateStr.split('.');
            if (parts.length === 3) {
                const d = parts[0].padStart(2, '0');
                const m = parts[1].padStart(2, '0');
                const y = parts[2];
                return `${y}-${m}-${d}`;
            }
        }

        // Handle DD/MM/YYYY
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                const d = parts[0].padStart(2, '0');
                const m = parts[1].padStart(2, '0');
                const y = parts[2];
                return `${y}-${m}-${d}`;
            }
        }

        // Handle YYYY-MM-DD
        if (dateStr.includes('-') && dateStr.length === 10) {
            return dateStr;
        }

        return dateStr;
    };

    const loadWorkouts = async () => {
        try {
            const savedData = await AsyncStorage.getItem(`@workout_logs_${profileId}`);
            if (savedData) {
                const loadedWorkouts = JSON.parse(savedData);
                setWorkouts(loadedWorkouts);
            } else {
                setWorkouts([]);
            }
        } catch (e) {
            console.error("Failed to load workouts", e);
        }
    };

    const updateUI = (data, selDate) => {
        // 1. Filter workouts
        const filtered = data.filter(w => {
            const wDate = normalizeDate(w.date);
            return wDate === selDate || w.dateKey === selDate;
        });
        setDayWorkouts(filtered);

        // 2. Rebuild markers
        const marks = {};
        data.forEach(workout => {
            const dateKey = normalizeDate(workout.date) || workout.dateKey;
            if (dateKey) {
                marks[dateKey] = { marked: true, dotColor: workout.category?.color || COLORS.primary };
            }
        });

        // 3. Mark selected date
        const currentMark = marks[selDate] || {};
        marks[selDate] = {
            ...currentMark,
            selected: true,
            selectedColor: COLORS.primary,
            disableTouchEvent: true
        };

        setMarkedDates(marks);
    };

    const onDayPress = (day) => {
        setSelectedDate(day.dateString);
    };

    return (
        <View style={styles.container}>
            <View style={styles.calendarContainer}>
                <Calendar
                    onDayPress={onDayPress}
                    markedDates={markedDates}
                    theme={{
                        calendarBackground: COLORS.surface,
                        textSectionTitleColor: COLORS.textMain,
                        selectedDayBackgroundColor: COLORS.primary,
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: COLORS.primary,
                        dayTextColor: COLORS.textMain,
                        textDisabledColor: COLORS.textSecondary,
                        dotColor: COLORS.primary,
                        selectedDotColor: '#ffffff',
                        arrowColor: COLORS.primary,
                        monthTextColor: COLORS.primary,
                        indicatorColor: COLORS.primary,
                        textDayFontWeight: '400',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: '400',
                        textDayFontSize: 16,
                        textMonthFontSize: 18,
                        textDayHeaderFontSize: 14,
                    }}
                />
            </View>

            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>
                    Тренировки {new Date(selectedDate).toLocaleDateString()}
                </Text>

                <FlatList
                    data={dayWorkouts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={[styles.item, { borderLeftColor: item.category.color, borderLeftWidth: 5 }]}>
                            <View style={styles.itemContent}>
                                <View style={styles.itemHeader}>
                                    <Ionicons
                                        name={item.category.icon}
                                        size={20}
                                        color={item.category.color}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={styles.itemCatLabel}>{item.category.label}</Text>
                                </View>
                                <Text style={styles.itemText}>{item.name}</Text>
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
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 10 }}>
                            <Text style={styles.emptyText}>Нет тренировок на этот день</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    calendarContainer: {
        marginTop: 50,
        marginBottom: 10,
        backgroundColor: COLORS.surface,
        borderRadius: 15,
        marginHorizontal: 10,
        elevation: 2,
        overflow: 'hidden',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textMain,
        marginBottom: 10,
        marginTop: 5,
    },
    emptyText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontSize: 16,
    },
    item: {
        backgroundColor: COLORS.surface,
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
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    itemCatLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMain,
    },
    itemText: {
        fontSize: 16,
        color: COLORS.textMain,
        fontWeight: "600",
        marginBottom: 8,
    },
    itemUnits: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    itemUnitTag: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 6,
        marginBottom: 4,
    },
    itemUnitText: {
        fontSize: 12,
        color: COLORS.textMain,
    },
});
