# Backend Setup Guide

This guide explains how to set up and run the Express.js + SQLite backend for the Productivity Study Timer.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

### 1. Install Backend Dependencies

Navigate to the project root directory and run:

```bash
npm install express sqlite3 cors
```

Or if you want to use the backend-specific setup:

```bash
npm install --prefix ./backend
```

### 2. Database

The SQLite database (`studytime.sqlite`) will be created automatically in the root directory when you first run the server. It will initialize with two tables:

- **subjects**: Stores subject/category data
- **todos**: Stores todo items with all fields

## Running the Backend

### Option 1: Direct Node (Production)

```bash
node services/todoService.js
```

The server will start on `http://0.0.0.0:5000`

### Option 2: With Nodemon (Development - Auto-restart on changes)

Install nodemon globally or locally:

```bash
npm install -g nodemon
```

Then run:

```bash
nodemon services/todoService.js
```

## API Endpoints

### Todos

- **GET /api/todos** - Get all todos grouped by subject
- **GET /api/todos/:id** - Get a single todo by ID
- **POST /api/todos** - Create a new todo
  - Body: `{title, description, subject_id, priority, due_date}`
- **PUT /api/todos/:id** - Update a todo
  - Body: `{title, description, subject_id, priority, due_date, is_completed}`
- **PATCH /api/todos/:id/toggle** - Toggle todo completion status
  - Body: `{is_completed: boolean}`
- **DELETE /api/todos/:id** - Delete a todo

### Subjects

- **GET /api/subjects** - Get all subjects

## Database Schema

### subjects table

```sql
CREATE TABLE subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  drink_icon TEXT,
  color TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### todos table

```sql
CREATE TABLE todos (
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
)
```

## Troubleshooting

### Port 5000 already in use

Change the `PORT` variable in `services/todoService.js` and update the `baseUrl` in `API/index.tsx`

### Database locked error

Ensure only one instance of the server is running

### CORS errors

The CORS middleware is configured to accept all origins. Modify if needed in `todoService.js`

## Notes

- The React Native app expects the backend to be running at `http://10.0.2.2:5000` (Android emulator default for host)
- Adjust `baseUrl` in `API/index.tsx` if running on different address
