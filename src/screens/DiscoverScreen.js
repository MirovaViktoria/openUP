import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DiscoverScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Discover Screen</Text>
            <Text style={styles.subText}>Content coming soon...</Text>
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
