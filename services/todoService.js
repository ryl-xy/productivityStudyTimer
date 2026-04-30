const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const DB_PATH = path.join(__dirname, '../studytime.sqlite');

app.use(cors());
app.use(express.json());

// Initialize database with schema
function initializeDatabase() {
  const db = new sqlite3.Database(DB_PATH, err => {
    if (err) {
      console.error('Database connection error:', err);
      return;
    }
    console.log('Connected to SQLite database');
  });

  // Create subjects table if it doesn't exist
  db.run(
    `CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      drink_icon TEXT,
      color TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    err => {
      if (err) console.error('Error creating subjects table:', err);
      else console.log('Subjects table ready');
    },
  );

  // Create todos table if it doesn't exist
  db.run(
    `CREATE TABLE IF NOT EXISTS todos (
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
    err => {
      if (err) console.error('Error creating todos table:', err);
      else console.log('Todos table ready');
    },
  );

  db.close();
}

// Initialize database on startup
initializeDatabase();

// Helper function to format todo row
function getTodoRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    subject_id: row.subject_id,
    subject_name: row.subject_name,
    drink_icon: row.drink_icon,
    color: row.color,
    priority: row.priority || 'no',
    is_completed: row.is_completed === 1,
    due_date: row.due_date,
  };
}

// GET all todos (grouped by subject)
app.get('/api/todos', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);

  db.all(
    `
    SELECT 
      t.*,
      s.name as subject_name,
      s.drink_icon,
      s.color
    FROM todos t
    JOIN subjects s ON t.subject_id = s.id
    ORDER BY s.name ASC, 
             CASE t.priority 
               WHEN 'high' THEN 1 
               WHEN 'medium' THEN 2 
               WHEN 'low' THEN 3 
               WHEN 'no' THEN 4 
             END ASC,
             t.created_at ASC
  `,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({error: err.message});

      // Group by subject
      const grouped = {};
      rows.forEach(row => {
        if (!grouped[row.subject_id]) {
          grouped[row.subject_id] = {
            subject_id: row.subject_id,
            subject_name: row.subject_name,
            drink_icon: row.drink_icon,
            color: row.color,
            todos: [],
          };
        }
        grouped[row.subject_id].todos.push(getTodoRow(row));
      });

      res.json(Object.values(grouped));
      db.close();
    },
  );
});

// GET single todo
app.get('/api/todos/:id', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);

  db.get(
    `
    SELECT t.*, s.name as subject_name, s.drink_icon, s.color
    FROM todos t
    JOIN subjects s ON t.subject_id = s.id
    WHERE t.id = ?
  `,
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({error: err.message});
      res.json(row ? getTodoRow(row) : null);
      db.close();
    },
  );
});

// POST create todo (full taskDetails: title, description, subject_id, priority, due_date)
app.post('/api/todos', (req, res) => {
  const {title, description, subject_id, priority, due_date} = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({error: 'Title is required'});
  }

  const db = new sqlite3.Database(DB_PATH);

  db.run(
    `INSERT INTO todos(title, description, subject_id, priority, due_date) VALUES (?, ?, ?, ?, ?)`,
    [
      title.trim(),
      description || null,
      subject_id,
      priority || 'no',
      due_date || null,
    ],
    function (err) {
      if (err) return res.status(500).json({error: err.message});

      res.status(201).json({id: this.lastID, affected: this.changes});
      db.close();
    },
  );
});

// PUT update todo (full edit)
app.put('/api/todos/:id', (req, res) => {
  const {title, description, subject_id, priority, due_date, is_completed} =
    req.body;

  const db = new sqlite3.Database(DB_PATH);

  db.run(
    `UPDATE todos 
     SET title = ?, description = ?, subject_id = ?, priority = ?, 
         due_date = ?, is_completed = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      title,
      description || null,
      subject_id,
      priority || 'no',
      due_date || null,
      is_completed ? 1 : 0,
      req.params.id,
    ],
    function (err) {
      if (err) return res.status(500).json({error: err.message});

      res.json({id: req.params.id, affected: this.changes});
      db.close();
    },
  );
});

// PATCH toggle todo completion
app.patch('/api/todos/:id/toggle', (req, res) => {
  const {is_completed} = req.body;

  const db = new sqlite3.Database(DB_PATH);

  db.run(
    `UPDATE todos SET is_completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [is_completed ? 1 : 0, req.params.id],
    function (err) {
      if (err) return res.status(500).json({error: err.message});

      res.json({id: req.params.id, affected: this.changes});
      db.close();
    },
  );
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);

  db.run(`DELETE FROM todos WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({error: err.message});

    res.json({id: req.params.id, affected: this.changes});
    db.close();
  });
});

// ============ SUBJECTS API (for dropdown) ============

app.get('/api/subjects', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);

  db.all('SELECT * FROM subjects ORDER BY name', [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
    db.close();
  });
});

// POST create a new subject
app.post('/api/subjects', (req, res) => {
  const {name, drink_icon, color} = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({error: 'Subject name is required'});
  }

  const db = new sqlite3.Database(DB_PATH);

  db.run(
    `INSERT INTO subjects(name, drink_icon, color) VALUES (?, ?, ?)`,
    [name.trim(), drink_icon || '', color || ''],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({error: 'Subject already exists'});
        }
        return res.status(500).json({error: err.message});
      }

      res.status(201).json({id: this.lastID, affected: this.changes});
      db.close();
    },
  );
});

// Start server
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Todo server running on http://0.0.0.0:${PORT}`);
});
