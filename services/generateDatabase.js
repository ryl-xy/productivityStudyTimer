const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('studytime.sqlite');

db.serialize(() => {
  db.run('DROP TABLE IF EXIST subjects');
  db.run('DROP TABLE IF EXIST todo');

  db.run(`
        CREATE table subject(
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        drink_name TEXT NOT NULL,
        drink_icon TEXT NOT NULL,
        color TEXT NOT NULL,
        )
    `);

  db.run(`CREATE TABLE todo (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        subject_id INTEGER NOT NULL,
        priority TEXT DEFAULT 'no',
        is_completed boolean DEFAULT 0,
        duedate DATETIME,
        FOREIGN KEY (subject_id) REFERENCES subjects(id))
    `);

  // Insert default subjects (drinks)
  const stmt = db.prepare(`
    INSERT INTO subjects(name, drink_name, drink_icon, color, default_duration)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run('Mathematics', 'Espresso', '☕', '#8B4513', 25);
  stmt.run('Programming', 'Bubble Tea', '🧋', '#D2B48C', 30);
  stmt.run('History', 'Matcha Latte', '🍵', '#556B2F', 20);
  stmt.run('Languages', 'Smoothie', '🥤', '#FF6B6B', 15);
  stmt.run('Physics', 'Americano', '☕', '#4A3728', 25);

  stmt.finalize();
});

// Close database
db.close(err => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Database closed.');
});
