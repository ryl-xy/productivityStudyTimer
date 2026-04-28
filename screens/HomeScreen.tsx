import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { usePersistentTimer } from '../hooks/usePersistentTimer';
import CupButton from '../components/CupButton';
import { HomeScreenNavigationProp } from '../types/navigation';

type Props = {
    navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
    const { formattedTime, isRunning, startTimer, stopTimer } = usePersistentTimer();

    return (
        <ImageBackground 
            source={require('../assets/background.jpg')} 
            style={styles.background}
            blurRadius={2}
        >
            <View style={styles.overlay}>
                <Text style={styles.title}>Productivity Study Timer</Text>

                <View style={styles.timerCard}>
                    <Text style={styles.label}>Total Focus Time</Text>
                    <Text style={styles.timer}>{formattedTime}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.startButton, isRunning && styles.stopButton]}
                    onPress={() => isRunning ? stopTimer() : startTimer()}
                >
                    <Text style={styles.buttonText}>{isRunning ? 'Pause ☕' : 'Start Sipping ✨'}</Text>
                </TouchableOpacity>

                {/* <CupButton onPress={() => navigation.navigate('Timer')} /> */}
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {flex: 1},

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 248, 220, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    timerCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        margin: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        alignItems: 'center',
    },

    label: {
        fontSize: 18,
        color: '#8b4513',
    },

    timer: {
        fontSize: 48,
        fontFamily: 'monospace',
        color: '#8b4513',
        marginTop: 10,
    },

    startButton: {
        backgroundColor: '#8b4513',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        marginTop: 20,
    },

    stopButton: {
        backgroundColor: '#a0522d',
    },

    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#5c3a21',
        marginBottom: 40,
    }
});