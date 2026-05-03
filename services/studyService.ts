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
    // First, drop the old table if it exists
    tx.executeSql(
      'DROP TABLE IF EXISTS study_sessions',
      [],
      () => {
        console.log('Old study_sessions table dropped');
      },
      (error: any) => {
        console.error('Error dropping table:', error);
      }
    );

    // Then create the new table with correct schema
    tx.executeSql(
      `CREATE TABLE study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        subject_id INTEGER,
        subject_name TEXT,
        minutes INTEGER NOT NULL,
        timer_type TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      [],
      () => console.log('Study sessions table created with correct schema'),
      (error: any) => {
        console.error('Table creation error:', error);
      }
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
        'INSERT INTO study_sessions (profile_id, subject_id, subject_name, minutes, timer_type) VALUES (?, ?, ?, ?, ?)',
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

export const getTotalStudyTime = (profileId: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const db = database();
    db.transaction(
      (tx: any) => {
        tx.executeSql(
          'SELECT SUM(minutes) as total FROM study_sessions WHERE profile_id = ?',
          [profileId],
          (_: any, result: any) => {
            try {
              if (!result || !result.rows) {
                console.warn('No result from getTotalStudyTime query');
                resolve(0);
                return;
              }
              const total = result.rows.item(0)?.total || 0;
              console.log('Total study time for profile', profileId, ':', total);
              resolve(total);
            } catch (error) {
              console.error('Error parsing getTotalStudyTime result:', error);
              resolve(0);
            }
          },
          (_: any, error: any) => {
            console.error('getTotalStudyTime query error:', error);
            resolve(0);
          }
        );
      },
      (error: any) => {
        console.error('getTotalStudyTime transaction error:', error);
        resolve(0);
      }
    );
  });
};

export const getStudyTimeBySubject = (
  profileId: number,
  subjectName: string
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const db = database();
    db.transaction(
      (tx: any) => {
        tx.executeSql(
          'SELECT SUM(minutes) as total FROM study_sessions WHERE profile_id = ? AND subject_name = ?',
          [profileId, subjectName],
          (_: any, result: any) => {
            try {
              if (!result || !result.rows) {
                console.warn('No result from getStudyTimeBySubject query');
                resolve(0);
                return;
              }
              const total = result.rows.item(0)?.total || 0;
              console.log(`Total time for ${subjectName}:`, total);
              resolve(total);
            } catch (error) {
              console.error('Error parsing getStudyTimeBySubject result:', error);
              resolve(0);
            }
          },
          (_: any, error: any) => {
            console.error('getStudyTimeBySubject query error:', error);
            resolve(0);
          }
        );
      },
      (error: any) => {
        console.error('getStudyTimeBySubject transaction error:', error);
        resolve(0);
      }
    );
  });
};