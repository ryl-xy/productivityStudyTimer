// services/studyService.ts
import SQLite from 'react-native-sqlite-storage';

// Promise-based database initialization
const database = () => {
  return SQLite.openDatabase(
    {
      name: 'studytime.sqlite',
      location: 'default',
    },
    () => {},
    (error: any) => {
      console.error('Database error:', error);
    }
  );
};

export const initDatabase = (): void => {
  const db = database();
  db.transaction((tx: any) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        subject_id INTEGER,
        subject_name TEXT,
        minutes INTEGER NOT NULL,
        timer_type TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Study sessions table created'),
      (error: any) => console.error('Table creation error:', error)
    );
  });
};

export const saveStudySession = (
  profileId: number,
  subjectId: number,
  subjectName: string,
  minutes: number,
  timerType: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const db = database();
    db.transaction((tx: any) => {
      tx.executeSql(
        'INSERT INTO study_sessions (profile_id, subject_id, subject_name, minutes, timer_type) VALUES (?, ?, ?, ?, ?);',
        [profileId, subjectId, subjectName, minutes, timerType],
        (_: any, result: any) => {
          console.log('Session saved:', minutes, 'minutes for', subjectName, 'in profile', profileId);
          resolve(result);
        },
        (_: any, error: any) => {
          console.error('Save error:', error);
          reject(error);
        }
      );
    });
  });
};

export const getTotalStudyTime = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    const db = database();
    db.transaction((tx: any) => {
      tx.executeSql(
        'SELECT SUM(minutes) as total FROM study_sessions;',
        [],
        (_: any, { rows }: any) => {
          const total = rows.item(0)?.total || 0;
          console.log('Total study time:', total);
          resolve(total);
        },
        (_: any, error: any) => reject(error)
      );
    });
  });
};

export const getStudyTimeBySubject = (subjectName: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const db = database();
    db.transaction((tx: any) => {
      tx.executeSql(
        'SELECT SUM(minutes) as total FROM study_sessions WHERE subject_name = ?;',
        [subjectName],
        (_: any, { rows }: any) => {
          const total = rows.item(0)?.total || 0;
          console.log(`Total time for ${subjectName}:`, total);
          resolve(total);
        },
        (_: any, error: any) => reject(error)
      );
    });
  });
};

