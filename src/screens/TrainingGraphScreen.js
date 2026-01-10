import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function TrainingGraphScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Training Graph Screen</Text>
            <Text style={styles.subText}>Charts and statistics will appear here.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: COLORS.textMain,
    },
    subText: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
});
