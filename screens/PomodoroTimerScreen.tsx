// screens/PomodoroTimerScreen.tsx
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Vibration,
} from 'react-native';
import {PomodoroTimerScreenProps} from '../types/navigation';
import {usePersistentTimer} from '../hooks/usePersistentTimer';
import { useStudy } from '../context/studyContext.tsx';

export default function PomodoroTimerScreen({
  navigation,
  route,
}: PomodoroTimerScreenProps) {
  const {subjectName} = route.params;
  const {addTime} = usePersistentTimer(); // Get the addTime function
  const{addStudySession} = useStudy(); // Get the addStudySession function from context
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionCount, setSessionCount] = useState(1);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  // const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const WORK_DURATION = 25 * 60;
  const BREAK_DURATION = 5 * 60;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    Vibration.vibrate(500);
    setIsRunning(false);
    setSessionStartTime(null);

    if (sessionType === 'work') {
      // Work session completed - add 25 minutes to study time
      const newCompletedCount = completedSessions + 1;
      setCompletedSessions(newCompletedCount);
      setTotalStudyTime(prev => prev + WORK_DURATION);

      Alert.alert(
        '🍅 Work Session Complete!',
        `Great job studying ${subjectName}! You've completed ${newCompletedCount} Pomodoro(s). Time for a 5 minute break.`,
        [
          {
            text: 'Start Break',
            onPress: () => {
              setSessionType('break');
              setTime(BREAK_DURATION);
              setIsRunning(true);
            },
          },
          {
            text: 'Finish',
            onPress: () => finishStudy(),
            style: 'cancel',
          },
        ],
      );
    } else {
      const nextSession = sessionCount + 1;
      setSessionCount(nextSession);
      Alert.alert(
        '☕ Break Complete!',
        `Ready for another study session? This will be Pomodoro #${nextSession}`,
        [
          {
            text: 'Start Work',
            onPress: () => {
              setSessionType('work');
              setTime(WORK_DURATION);
              setIsRunning(true);
            },
          },
          {
            text: 'Finish All',
            onPress: () => finishStudy(),
            style: 'cancel',
          },
        ],
      );
    }
  };

  const startTimer = () => {
    if(!sessionStartTime){
      setSessionStartTime(Date.now());
    }
    setIsRunning(true);
  };
  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setSessionType('work');
    setSessionCount(1);
    setCompletedSessions(0);
    setTotalStudyTime(0);
    setTime(WORK_DURATION);
  };

  const skipToBreak = () => {
    setIsRunning(false);
    setSessionType('break');
    setTime(BREAK_DURATION);
    Alert.alert('Skipped to Break', 'Take a well-deserved rest!');
  };

  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = sessionType === 'work' ? WORK_DURATION : BREAK_DURATION;
    return (time / total) * 100;
  };

  const finishStudy = async () => {
    pauseTimer();

    try{
      let actualTime = totalStudyTime;

      // Add partial session time if user stops early
      if (sessionType === 'work' && sessionStartTime) {
        const elapsedSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
        actualTime += elapsedSeconds;
      }

      if (actualTime > 0) {
        await addTime(actualTime);

        const minutes = Math.floor(actualTime / 60);
        await addStudySession(0, subjectName, minutes, 'pomodoro');
      }

      const totalHours = Math.floor(actualTime / 3600);
      const totalMinutes = Math.floor((actualTime % 3600) / 60);

      Alert.alert(
        '🎉 Great Work!',
        `You completed ${completedSessions} Pomodoro session(s) for ${subjectName}!\n\nTotal study time: ${totalHours}h ${totalMinutes}m\n\nYour cumulative timer has been updated!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error('Error finishing study session:', error);
      Alert.alert('Error', 'There was an error saving your study session. Please try again.');
    };
  };

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.background}
      blurRadius={2}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            if (isRunning) {
              Alert.alert(
                'Exit Timer?',
                'Your current session is in progress. Progress will be lost if you exit.',
                [
                  {text: 'Cancel', style: 'cancel'},
                  {text: 'Exit', onPress: () => navigation.goBack()},
                ],
              );
            } else {
              navigation.goBack();
            }
          }}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.subjectTitle}>🍅 {subjectName}</Text>

        <View style={styles.sessionInfo}>
          <Text style={styles.sessionType}>
            {sessionType === 'work' ? '📖 Focus Time' : '☕ Break Time'}
          </Text>
          <Text style={styles.sessionCount}>Pomodoro #{sessionCount}</Text>
          <Text style={styles.completedCount}>
            Completed: {completedSessions}
          </Text>
          <Text style={styles.totalTime}>
            Total Study: {Math.floor(totalStudyTime / 60)} min
          </Text>
        </View>

        <View style={styles.timerCard}>
          <Text style={styles.timer}>{formatTime()}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, {width: `${getProgress()}%`}]} />
          </View>
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

        {sessionType === 'work' && (
          <TouchableOpacity style={styles.skipButton} onPress={skipToBreak}>
            <Text style={styles.skipButtonText}>Skip to Break</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.finishButton} onPress={finishStudy}>
          <Text style={styles.finishButtonText}>✓ Finish All Sessions</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {flex: 1},
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subjectTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sessionType: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 8,
  },
  sessionCount: {
    fontSize: 18,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  completedCount: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  totalTime: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  timerCard: {
    backgroundColor: 'rgba(255, 248, 220, 0.95)',
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  timer: {
    fontSize: 72,
    fontFamily: 'monospace',
    color: '#8B4513',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
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
  skipButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  skipButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  finishButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
