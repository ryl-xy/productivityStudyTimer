import {useState, useEffect, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TOTAL_TIME: 'total_study_time',
  LAST_START_TIME: 'last_start_time',
  IS_TIMER_RUNNING: 'is_timer_running',
  DAILY_SUBJECTS: 'daily_subjects',
};

export const usePersistentTimer = () => {
  const [totalTime, setTotalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStartTimeRef = useRef<number | null>(null);

  //load saved data on mount
  useEffect(() => {
    loadPersistedData();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadPersistedData = async () => {
    try {
      const [savedTotalTime, savedLastStartTime, savedIsRunning] =
        await AsyncStorage.multiGet([
          STORAGE_KEYS.TOTAL_TIME,
          STORAGE_KEYS.LAST_START_TIME,
          STORAGE_KEYS.IS_TIMER_RUNNING,
        ]);

      // const persistedTotalTime = parseInt(savedTotalTime[1]) || 0;
      // const persistedLastStartTime = parseInt(savedLastStartTime[1]);
      const persistedTotalTime = parseInt(savedTotalTime[1] || '0');
      const persistedLastStartTime = parseInt(savedLastStartTime[1] || '0');
      const persistedIsRunning = savedIsRunning[1] === 'true';

      setTotalTime(persistedTotalTime);

      //resume timer if it was running when app is closed
      if (persistedIsRunning && persistedLastStartTime) {
        const elapsedTime = Date.now() - persistedLastStartTime;
        setTotalTime(persistedTotalTime + elapsedTime);
        lastStartTimeRef.current = Date.now();
        setIsRunning(true);
        startTimer();
      }
    } catch (error) {
      console.error('Failed to load timer data:', error);
    }
  };

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    lastStartTimeRef.current = Date.now();
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      if (lastStartTimeRef.current) {
        const elapsedSeconds = Math.floor(
          (Date.now() - lastStartTimeRef.current) / 1000,
        );
        setTotalTime(prev => prev + elapsedSeconds);
        lastStartTimeRef.current = Date.now();
      }
    }, 1000);
  };

  const stopTimer = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    await AsyncStorage.setItem(STORAGE_KEYS.IS_TIMER_RUNNING, 'false');
  };

  const resetTimer = async () => {
    stopTimer();
    setTotalTime(0);
    await AsyncStorage.setItem(STORAGE_KEYS.TOTAL_TIME, '0');
  };

  const addTime = async (seconds: number) => {
    setTotalTime(prev => {
      const newTotal = prev + seconds;
      AsyncStorage.setItem(STORAGE_KEYS.TOTAL_TIME, newTotal.toString());
      return newTotal;
    });
  };

  //format time for displat in HH:MM:SS
  const formattedTime = () => {
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    const seconds = totalTime % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    totalTime,
    formattedTime: formattedTime(),
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    addTime,
  };
};
