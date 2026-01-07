import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subText: {
        fontSize: 16,
        color: '#666',
    },
});
