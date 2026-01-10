import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from '../constants/colors';

export default function SettingsScreen({ route, navigation }) {
    const { profileId, onLogout } = route.params;
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const storedProfiles = await AsyncStorage.getItem("profiles");
            if (storedProfiles) {
                const profiles = JSON.parse(storedProfiles);
                const current = profiles.find((p) => p.id === profileId);
                setProfile(current);
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        }
    };

    const handleChangePassword = async () => {
        if (!profile) return;

        // Check old password if one exists
        if (profile.password && profile.password !== currentPassword) {
            Alert.alert("Ошибка", "Текущий пароль неверен");
            return;
        }

        try {
            const storedProfiles = await AsyncStorage.getItem("profiles");
            let profiles = JSON.parse(storedProfiles);

            const updatedProfiles = profiles.map((p) => {
                if (p.id === profileId) {
                    return { ...p, password: newPassword };
                }
                return p;
            });

            await AsyncStorage.setItem("profiles", JSON.stringify(updatedProfiles));
            Alert.alert("Успешно", "Пароль обновлен");
            setProfile({ ...profile, password: newPassword });
            setNewPassword("");
            setCurrentPassword("");
        } catch (error) {
            console.error("Failed to update password", error);
            Alert.alert("Ошибка", "Не удалось обновить пароль");
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Удалить аккаунт?",
            "Это действие необратимо. Все ваши данные и тренировки будут удалены.",
            [
                { text: "Отмена", style: "cancel" },
                {
                    text: "Удалить",
                    style: "destructive",
                    onPress: performDelete,
                },
            ]
        );
    };

    const performDelete = async () => {
        try {
            // 1. Remove from profiles list
            const storedProfiles = await AsyncStorage.getItem("profiles");
            let profiles = JSON.parse(storedProfiles) || [];
            const updatedProfiles = profiles.filter((p) => p.id !== profileId);
            await AsyncStorage.setItem("profiles", JSON.stringify(updatedProfiles));

            // 2. Remove workout logs
            await AsyncStorage.removeItem(`@workout_logs_${profileId}`);

            // 3. Complete logout process via parent handler
            // We first clear active profile locally to be safe, though onLogout likely handles it
            await AsyncStorage.removeItem("active_profile_id");

            onLogout(); // This should trigger the app to go back to ProfileSelect
        } catch (error) {
            console.error("Failed to delete account", error);
            Alert.alert("Ошибка", "Не удалось удалить аккаунт");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Смена пароля</Text>

                {profile?.password ? (
                    <TextInput
                        style={styles.input}
                        placeholder="Текущий пароль"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                    />
                ) : null}

                <TextInput
                    style={styles.input}
                    placeholder="Новый пароль"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                    <Text style={styles.buttonText}>Обновить пароль</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.section, styles.dangerZone]}>
                <Text style={[styles.sectionTitle, { color: COLORS.error }]}>
                    Опасная зона
                </Text>
                <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={handleDeleteAccount}
                >
                    <Text style={styles.buttonText}>Удалить аккаунт</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20,
    },
    section: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: COLORS.textMain,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primaryLight,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 15,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    deleteButton: {
        backgroundColor: COLORS.error,
    },
    buttonText: {
        color: COLORS.surface,
        fontWeight: "bold",
        fontSize: 16,
    },
    dangerZone: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: COLORS.error,
    },
});
