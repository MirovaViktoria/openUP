import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AddActionScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>New Observation</Text>
            <Text style={styles.subText}>This will be the add modal.</Text>
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
