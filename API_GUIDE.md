# 🎯 Backend Setup & API Guide

## Quick Start

### 1. Install Dependencies

Open a terminal in the project root and run:

```bash
npm install express sqlite3 cors
```

### 2. Start the Backend Server

**Windows:**

```bash
start-backend.bat
```

**macOS/Linux:**

```bash
bash start-backend.sh
```

Or manually:

```bash
node services/todoService.js
```

You should see:

```
Connected to SQLite database
Subjects table ready
Todos table ready
Todo server running on http://0.0.0.0:5000
```

### 3. Run the React Native App

In another terminal:

```bash
npm start
```

Then select your emulator or device.

---

## Database Architecture

### Schema Overview

```
subjects (categories/topics)
├── id (PRIMARY KEY)
├── name (unique)
├── drink_icon
├── color
└── created_at

todos (tasks)
├── id (PRIMARY KEY)
├── title
├── description
├── subject_id (FOREIGN KEY → subjects.id)
├── priority (no|low|medium|high)
├── due_date
├── is_completed (0|1)
├── created_at
└── updated_at
```

---

## Complete API Reference

### 📚 Todos Endpoints

#### GET /api/todos

**Get all todos grouped by subject**

Response:

```json
[
  {
    "subject_id": 1,
    "subject_name": "Math",
    "drink_icon": "☕",
    "color": "#FF5733",
    "todos": [
      {
        "id": 1,
        "title": "Solve quadratic equations",
        "description": "Chapter 5, exercises 1-10",
        "subject_id": 1,
        "subject_name": "Math",
        "drink_icon": "☕",
        "color": "#FF5733",
        "priority": "high",
        "is_completed": false,
        "due_date": "2026-05-15T00:00:00.000Z"
      }
    ]
  }
]
```

#### POST /api/todos

**Create a new todo**

Request Body:

```json
{
  "title": "Complete assignment",
  "description": "Biology lab report",
  "subject_id": 2,
  "priority": "medium",
  "due_date": "2026-05-20"
}
```

Response:

```json
{
  "id": 5,
  "affected": 1
}
```

#### GET /api/todos/:id

**Get a specific todo**

Response:

```json
{
  "id": 1,
  "title": "Solve quadratic equations",
  "description": "Chapter 5, exercises 1-10",
  "subject_id": 1,
  "subject_name": "Math",
  "drink_icon": "☕",
  "color": "#FF5733",
  "priority": "high",
  "is_completed": false,
  "due_date": "2026-05-15T00:00:00.000Z"
}
```

#### PUT /api/todos/:id

**Update a todo**

Request Body:

```json
{
  "title": "Update: Solve quadratic equations",
  "description": "Chapter 5, exercises 1-10 (completed half)",
  "subject_id": 1,
  "priority": "medium",
  "due_date": "2026-05-15",
  "is_completed": false
}
```

Response:

```json
{
  "id": 1,
  "affected": 1
}
```

#### PATCH /api/todos/:id/toggle

**Toggle todo completion status**

Request Body:

```json
{
  "is_completed": true
}
```

Response:

```json
{
  "id": 1,
  "affected": 1
}
```

#### DELETE /api/todos/:id

**Delete a todo**

Response:

```json
{
  "id": 1,
  "affected": 1
}
```

---

### 📂 Subjects Endpoints

#### GET /api/subjects

**Get all subjects**

Response:

```json
[
  {
    "id": 1,
    "name": "Math",
    "drink_icon": "☕",
    "color": "#FF5733",
    "created_at": "2026-04-30T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Biology",
    "drink_icon": "🍵",
    "color": "#33FF57",
    "created_at": "2026-04-30T10:05:00.000Z"
  }
]
```

#### POST /api/subjects

**Create a new subject**

Request Body:

```json
{
  "name": "Physics",
  "drink_icon": "🥤",
  "color": "#3357FF"
}
```

Response:

```json
{
  "id": 3,
  "affected": 1
}
```

---

## Testing the API

### Using cURL

```bash
# Get all todos
curl http://localhost:5000/api/todos

# Create a todo
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "description": "Testing the API",
    "subject_id": 1,
    "priority": "high",
    "due_date": "2026-05-20"
  }'

# Toggle completion
curl -X PATCH http://localhost:5000/api/todos/1/toggle \
  -H "Content-Type: application/json" \
  -d '{"is_completed": true}'

# Delete a todo
curl -X DELETE http://localhost:5000/api/todos/1
```

### Using Postman

1. Import the endpoints into Postman
2. Test each endpoint with the example requests above
3. Verify responses

---

## Troubleshooting

### Issue: "Cannot find module 'sqlite3'"

**Solution:** Run `npm install sqlite3`

### Issue: "Cannot find module 'express'"

**Solution:** Run `npm install express cors`

### Issue: "EADDRINUSE: address already in use :::5000"

**Solution:** Another process is using port 5000. Either:

- Kill the process: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)
- Or change PORT in `services/todoService.js` and update `baseUrl` in `API/index.tsx`

### Issue: React app can't connect to backend

**Checklist:**

- Backend server is running (`node services/todoService.js`)
- Port 5000 is open and accessible
- Check `API/index.tsx` has correct baseUrl:
  - Android Emulator: `http://10.0.2.2:5000`
  - Physical device/iOS: `http://192.168.x.x:5000` (your machine IP)
- Check network connectivity

### Issue: "database is locked"

**Solution:** Only one instance of the server can access the database at a time. Ensure:

- Only one server instance is running
- Close all other terminals running the server

---

## Performance Notes

- Todos are grouped by subject in the GET /api/todos response
- Sorting is by: subject name → priority (high→low) → created date
- Consider adding pagination for large datasets
- Database is stored in `studytime.sqlite` in the project root

---

## Security Considerations

⚠️ **Current Setup is for Development Only**

For production, consider:

- Add input validation and sanitization
- Implement authentication/authorization
- Use environment variables for configuration
- Add rate limiting
- Enable HTTPS
- Add request logging
- Implement error handling middleware
- Add database connection pooling

---

## Next Steps

1. ✅ Start the backend server
2. ✅ Run the React Native app
3. ✅ Test adding a todo
4. ✅ Verify data persists in SQLite
5. ✅ Test launching timer from todo
6. Deploy when ready!
