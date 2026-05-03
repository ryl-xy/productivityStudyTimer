import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getTotalStudyTime,
  getStudyTimeBySubject,
  saveStudySession,
} from '../services/studyService';

interface StudyContextType {
  totalFocusTime: number;
  addStudySession: (subjectId: number, subjectName: string, minutes: number, timerType: string) => Promise<boolean>;
  getSubjectStudyTime: (subjectName: string) => Promise<number>;
  refreshTotalTime: () => Promise<void>;
  formatTime: (minutes: number) => string;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

interface StudyProviderProps {
  children: ReactNode;
}

export const StudyProvider: React.FC<StudyProviderProps> = ({ children }) => {
  const [totalFocusTime, setTotalFocusTime] = useState<number>(0);

  const refreshTotalTime = async (): Promise<void> => {
    try {
      const total = await getTotalStudyTime();
      setTotalFocusTime(total);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  const addStudySession = async (
    subjectId: number,
    subjectName: string,
    minutes: number,
    timerType: string
  ): Promise<boolean> => {
    try {
      await saveStudySession(subjectId, subjectName, minutes, timerType);
      await refreshTotalTime();
      return true;
    } catch (error) {
      console.error('Error adding study session:', error);
      return false;
    }
  };

  const getSubjectStudyTime = async (subjectName: string): Promise<number> => {
    try {
      const time = await getStudyTimeBySubject(subjectName);
      return time;
    } catch (error) {
      console.error('Error getting subject time:', error);
      return 0;
    }
  };

  useEffect(() => {
    refreshTotalTime();
  }, []);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins} min`;
    }
  };

  return (
    <StudyContext.Provider
      value={{
        totalFocusTime,
        addStudySession,
        getSubjectStudyTime,
        refreshTotalTime,
        formatTime,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = (): StudyContextType => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};