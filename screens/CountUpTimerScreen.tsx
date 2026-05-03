// screens/CountUpTimerScreen.tsx
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import {usePersistentTimer} from '../hooks/usePersistentTimer';
import {CountUpTimerScreenProps} from '../types/navigation';

export default function CountUpTimerScreen({
  navigation,
  route,
}: CountUpTimerScreenProps) {
  const {subjectName, taskId, taskName} = route.params;
  const {addTime} = usePersistentTimer();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const resetTimer = () => {
    pauseTimer();
    setSeconds(0);
  };

  const formatTime = () => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const finishStudy = () => {
    pauseTimer();

    if (seconds > 0) {
      addTime(seconds);
    }

    const timeSpent = formatTime();

    Alert.alert(
      'Great job! 🎉',
      `You studied ${subjectName} for ${timeSpent}`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.background}
      blurRadius={2}>
      <View style={styles.overlay}>
        <Text style={styles.subjectTitle}>📚 {taskName || subjectName}</Text>
        {taskName && <Text style={styles.subjectSubtitle}>{subjectName}</Text>}

        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Count Up Timer</Text>
          <Text style={styles.timer}>{formatTime()}</Text>
        </View>

        <View style={styles.controls}>
          {!isRunning ? (
            <TouchableOpacity style={styles.startButton} onPress={startTimer}>
              <Text style={styles.buttonText}>▶ Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.pauseButton} onPress={pauseTimer}>
              <Text style={styles.buttonText}>⏸ Pause</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
            <Text style={styles.buttonText}>⟳ Reset</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.finishButton} onPress={finishStudy}>
          <Text style={styles.finishButtonText}>✓ Finish Studying</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {flex: 1},
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  subjectTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subjectSubtitle: {
    fontSize: 16,
    color: '#D4D4D4',
    marginBottom: 20,
    textAlign: 'center',
  },
  timerCard: {
    backgroundColor: 'rgba(255, 248, 220, 0.95)',
    borderRadius: 25,
    padding: 40,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  timerLabel: {
    fontSize: 15,
    color: '#8B4513',
    marginBottom: 10,
    fontWeight: '600',
  },
  timer: {
    fontSize: 50,
    fontFamily: 'monospace',
    color: '#8B4513',
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
    gap: 15,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    flex: 1,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    flex: 1,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  finishButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
