const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const DB = 'studytime.sqlite';

app.use(cors());
app.use(express.json());

// Helper function
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

// GET all todos
app.get('/api/todos', (req, res) => {
  const db = new sqlite3.Database(DB);

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
  const db = new sqlite3.Database(DB);

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

// POST create todo
app.post('/api/todos', (req, res) => {
  const {title, description, subject_id, priority, due_date} = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({error: 'Title is required'});
  }

  const db = new sqlite3.Database(DB);

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

// PUT update todo
app.put('/api/todos/:id', (req, res) => {
  const {title, description, subject_id, priority, due_date, is_completed} =
    req.body;

  const db = new sqlite3.Database(DB);

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

  const db = new sqlite3.Database(DB);

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
  const db = new sqlite3.Database(DB);

  db.run(`DELETE FROM todos WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({error: err.message});

    res.json({id: req.params.id, affected: this.changes});
    db.close();
  });
});

// ============ PROFILES API ============

// GET all profiles
app.get('/api/profiles', (req, res) => {
  const db = new sqlite3.Database(DB);

  db.all('SELECT * FROM profiles ORDER BY name', [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
    db.close();
  });
});

// GET profile with all subjects and todos
app.get('/api/profiles/:id', (req, res) => {
  const db = new sqlite3.Database(DB);

  db.get(
    'SELECT * FROM profiles WHERE id = ?',
    [req.params.id],
    (err, profile) => {
      if (err) return res.status(500).json({error: err.message});
      if (!profile) {
        db.close();
        return res.status(404).json({error: 'Profile not found'});
      }

      // Get subjects for this profile
      db.all(
        'SELECT * FROM subjects WHERE profile_id = ? ORDER BY name',
        [req.params.id],
        (err, subjects) => {
          if (err) return res.status(500).json({error: err.message});

          profile.subjects = subjects || [];
          res.json(profile);
          db.close();
        },
      );
    },
  );
});

// POST create profile
app.post('/api/profiles', (req, res) => {
  const {name, avatar} = req.body;

  if (!name) {
    return res.status(400).json({error: 'Name is required'});
  }

  const db = new sqlite3.Database(DB);

  db.run(
    `INSERT INTO profiles(name, avatar) VALUES (?, ?)`,
    [name.trim(), avatar || '🎓'],
    function (err) {
      if (err) return res.status(500).json({error: err.message});

      res.status(201).json({
        id: this.lastID,
        name: name.trim(),
        avatar: avatar || '🎓',
        subjects: [],
        affected: this.changes,
      });

      db.close();
    },
  );
});

// PUT update profile
app.put('/api/profiles/:id', (req, res) => {
  const {name, avatar} = req.body;
  const db = new sqlite3.Database(DB);

  db.run(
    `UPDATE profiles SET name = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [name, avatar, req.params.id],
    function (err) {
      if (err) return res.status(500).json({error: err.message});

      res.json({id: req.params.id, affected: this.changes});
      db.close();
    },
  );
});

// DELETE profile
app.delete('/api/profiles/:id', (req, res) => {
  const db = new sqlite3.Database(DB);

  db.run(`DELETE FROM profiles WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({error: err.message});

    res.json({id: req.params.id, affected: this.changes});
    db.close();
  });
});

// ============ SUBJECTS API ============

// GET all subjects for a profile
app.get('/api/profiles/:profileId/subjects', (req, res) => {
  const db = new sqlite3.Database(DB);

  db.all(
    'SELECT * FROM subjects WHERE profile_id = ? ORDER BY name',
    [req.params.profileId],
    (err, rows) => {
      if (err) return res.status(500).json({error: err.message});
      res.json(rows || []);
      db.close();
    },
  );
});

// GET all subjects
app.get('/api/subjects', (req, res) => {
  const db = new sqlite3.Database(DB);

  db.all('SELECT * FROM subjects ORDER BY name', [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows || []);
    db.close();
  });
});

// POST create subject
app.post('/api/subjects', (req, res) => {
  const {name, drink_icon, color, profile_id} = req.body;

  if (!name || !profile_id) {
    return res.status(400).json({error: 'Name and profile_id are required'});
  }

  const db = new sqlite3.Database(DB);

  db.run(
    `INSERT INTO subjects(name, drink_icon, color, profile_id) VALUES (?, ?, ?, ?)`,
    [name.trim(), drink_icon || '☕', color || '#8B4513', profile_id],
    function (err) {
      if (err) return res.status(500).json({error: err.message});

      res.status(201).json({
        id: this.lastID,
        name: name.trim(),
        drink_icon: drink_icon || '☕',
        color: color || '#8B4513',
        profile_id: profile_id,
        affected: this.changes,
      });

      db.close();
    },
  );
});

// PUT update subject
app.put('/api/subjects/:id', (req, res) => {
  const {name, drink_icon, color} = req.body;
  const db = new sqlite3.Database(DB);

  db.run(
    `UPDATE subjects SET name = ?, drink_icon = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [name, drink_icon, color, req.params.id],
    function (err) {
      if (err) return res.status(500).json({error: err.message});

      res.json({id: req.params.id, affected: this.changes});
      db.close();
    },
  );
});

// DELETE subject
app.delete('/api/subjects/:id', (req, res) => {
  const db = new sqlite3.Database(DB);

  db.run(`DELETE FROM subjects WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({error: err.message});

    res.json({id: req.params.id, affected: this.changes});
    db.close();
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`server is running on http://0.0.0.0:${PORT}`);
});
