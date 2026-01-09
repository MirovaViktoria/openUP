import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, View, StyleSheet } from 'react-native';

export default function ScaleButton({
    children,
    onPress,
    style,
    scaleTo = 0.96, // целевой масштаб
    disabled = false
}) {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scaleValue, {
            toValue: scaleTo,
            useNativeDriver: true,
            speed: 20, // скорость анимации
            bounciness: 4, // "пружинистость"
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 4,
        }).start();
    };

    return (
        <TouchableWithoutFeedback
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
            disabled={disabled}
        >
            <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
                {children}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}
