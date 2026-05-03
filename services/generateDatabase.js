const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('studytime.sqlite');

// Function to initialize database only if tables don't exist
function initializeDatabase() {
  db.serialize(() => {
    // Check if profiles table exists
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='profiles'",
      (err, row) => {
        if (err) {
          console.error('Error checking database:', err);
          return;
        }

        // If profiles table doesn't exist, create all tables
        if (!row) {
          console.log('Tables not found. Creating database schema...');

          db.run(
            `CREATE TABLE profiles (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              avatar TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            (err) => {
              if (err) console.error('Error creating profiles table:', err);
              else console.log('✓ Profiles table created');
            }
          );

          db.run(
            `CREATE TABLE subjects (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              drink_icon TEXT,
              color TEXT,
              profile_id INTEGER NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
              UNIQUE(name, profile_id)
            )`,
            (err) => {
              if (err) console.error('Error creating subjects table:', err);
              else console.log('✓ Subjects table created');
            }
          );

          db.run(
            `CREATE TABLE todos (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              description TEXT,
              subject_id INTEGER NOT NULL,
              priority TEXT DEFAULT 'no',
              due_date DATETIME,
              is_completed INTEGER DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            )`,
            (err) => {
              if (err) console.error('Error creating todos table:', err);
              else console.log('✓ Todos table created');
            }
          );

          // Insert default profile
          db.run(
            `INSERT INTO profiles(name, avatar) VALUES (?, ?)`,
            ['My Profile', '🎓'],
            function (err) {
              if (err) {
                console.error('Error inserting profile:', err);
                return;
              }
              const profileId = this.lastID;
              console.log('✓ Created default profile with id:', profileId);

              // Insert default subjects for the profile
              const defaultSubjects = [
                { name: 'Mathematics', drink_icon: '☕', color: '#FF5733' },
                { name: 'Science', drink_icon: '🍵', color: '#33FF57' },
                { name: 'History', drink_icon: '🥤', color: '#3357FF' },
                { name: 'Programming', drink_icon: '🧋', color: '#FF33F5' },
              ];

              defaultSubjects.forEach(subject => {
                db.run(
                  `INSERT INTO subjects(name, drink_icon, color, profile_id) VALUES (?, ?, ?, ?)`,
                  [subject.name, subject.drink_icon, subject.color, profileId],
                  function (err) {
                    if (err) {
                      console.error('Error inserting subject:', err);
                    } else {
                      console.log(`✓ Created subject: ${subject.name}`);
                    }
                  }
                );
              });
            }
          );
        } else {
          console.log('Database tables already exist. Skipping initialization.');
        }
      }
    );
  });
}

// Export the initialization function
module.exports = initializeDatabase;

// Close database after operations complete
setTimeout(() => {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Database connection closed.');
  });
}, 1000);