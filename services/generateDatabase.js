const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('studytime.sqlite');

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS subjects');
  db.run('DROP TABLE IF EXISTS todo');

  db.run(
    `CREATE TABLE subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      drink_icon TEXT,
      color TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
    )`,
  );

  // Insert default subjects (drinks)
  // const stmt = db.prepare(`
  //   INSERT INTO subjects(name, drink_name, drink_icon, color, default_duration)
  //   VALUES (?, ?, ?, ?, ?)
  // `);

  // stmt.run('Mathematics', 'Espresso', '☕', '#8B4513', 25);
  // stmt.run('Programming', 'Bubble Tea', '🧋', '#D2B48C', 30);
  // stmt.run('History', 'Matcha Latte', '🍵', '#556B2F', 20);
  // stmt.run('Languages', 'Smoothie', '🥤', '#FF6B6B', 15);
  // stmt.run('Physics', 'Americano', '☕', '#4A3728', 25);

  // stmt.finalize();
});

// Close database
db.close(err => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Database closed.');
});
