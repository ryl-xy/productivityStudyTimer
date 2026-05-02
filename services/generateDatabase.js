const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('studytime.sqlite');

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS todos');
  db.run('DROP TABLE IF EXISTS subjects');
  db.run('DROP TABLE IF EXISTS profiles');

  db.run(
    `CREATE TABLE profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      avatar TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
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
      console.log('Created profile with id:', profileId);

      // Insert default subjects for the profile
      const defaultSubjects = [
        {name: 'Mathematics', drink_icon: '☕', color: '#FF5733'},
        {name: 'Science', drink_icon: '🍵', color: '#33FF57'},
        {name: 'History', drink_icon: '🥤', color: '#3357FF'},
        {name: 'Programming', drink_icon: '🧋', color: '#FF33F5'},
      ];

      defaultSubjects.forEach(subject => {
        db.run(
          `INSERT INTO subjects(name, drink_icon, color, profile_id) VALUES (?, ?, ?, ?)`,
          [subject.name, subject.drink_icon, subject.color, profileId],
          function (err) {
            if (err) {
              console.error('Error inserting subject:', err);
            } else {
              console.log(`Created subject: ${subject.name}`);
            }
          },
        );
      });
    },
  );
});

// Close database after a delay to allow all operations to complete
// setTimeout(() => {
db.close(err => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Database closed.');
});
// }, 500);
