# ⚡ Quick Reference - Commands & Setup

## 🚀 Get Started in 2 Steps

### Terminal 1: Start Backend

```bash
node services/todoService.js
```

### Terminal 2: Start App

```bash
npm start
# Then press 'a' for Android or 'i' for iOS
```

---

## 📋 Full Backend Setup (First Time Only)

```bash
# Install backend dependencies (one-time)
npm install express sqlite3 cors

# Start backend
node services/todoService.js
```

Or use the batch/shell scripts:

- **Windows:** `start-backend.bat`
- **macOS/Linux:** `bash start-backend.sh`

---

## 🔧 Important Files & Locations

| File                      | Purpose                              |
| ------------------------- | ------------------------------------ |
| `services/todoService.js` | Express backend + SQLite             |
| `screens/TodoScreen.tsx`  | Todo management UI                   |
| `API/index.tsx`           | API base URL: `http://10.0.2.2:5000` |
| `studytime.sqlite`        | Database (auto-created)              |
| `API_GUIDE.md`            | Complete API endpoints               |
| `BACKEND_SETUP.md`        | Backend detailed setup               |

---

## 🌐 API Quick Reference

| Method | Endpoint                | Purpose                 |
| ------ | ----------------------- | ----------------------- |
| GET    | `/api/todos`            | Get all todos (grouped) |
| POST   | `/api/todos`            | Create todo             |
| PUT    | `/api/todos/:id`        | Update todo             |
| PATCH  | `/api/todos/:id/toggle` | Toggle completion       |
| DELETE | `/api/todos/:id`        | Delete todo             |
| GET    | `/api/subjects`         | Get all subjects        |
| POST   | `/api/subjects`         | Create subject          |

---

## 🔗 API Connection

The app connects to backend at: **`http://10.0.2.2:5000`**

**For different targets:**

```
Android Emulator:   http://10.0.2.2:5000 ✓ (default)
iOS Simulator:      http://localhost:5000
Physical Device:    http://192.168.X.X:5000 (your IP)
```

Change in: `API/index.tsx`

---

## ✅ Feature Checklist

- [x] Backend Express server with SQLite
- [x] Todo CRUD API (Create, Read, Update, Delete)
- [x] Todo grouping by subject
- [x] Priority system (no/low/medium/high)
- [x] Due date support
- [x] Completion toggle
- [x] Description field
- [x] Add modal with all fields
- [x] Detail view with Start Timer button
- [x] Edit modal
- [x] Delete functionality
- [x] Timer integration (launches from todo)
- [x] Task context display in timer
- [x] API integration in TodoScreen
- [x] Database auto-initialization

---

## 🧪 Quick Test (After Starting Backend)

```bash
# Test API is running
curl http://localhost:5000/api/todos

# Should return (if no todos yet):
# [
#   {
#     "subject_id": 1,
#     "subject_name": "...",
#     "drink_icon": "...",
#     "color": "...",
#     "todos": []
#   }
# ]
```

---

## 🐛 Debugging

### Backend logs show errors?

```bash
# Kill any existing process on port 5000
lsof -ti:5000 | xargs kill -9

# Restart backend
node services/todoService.js
```

### App shows "API not found" in Logcat?

1. Verify backend running: `http://0.0.0.0:5000`
2. Check baseUrl in `API/index.tsx` = `http://10.0.2.2:5000`
3. Check firewall not blocking port 5000

### Database locked error?

- Only one backend instance can run
- Close all terminal windows running the server

---

## 📊 Data Flow

```
TodoScreen.tsx
    ↓
fetch(baseUrl + '/api/todos')
    ↓
Express Server (port 5000)
    ↓
SQLite Database (studytime.sqlite)
    ↓
Response with todos grouped by subject
    ↓
UI renders todos with completion status
```

---

## 🎯 Common Tasks

### Add a new todo

```javascript
POST /api/todos
{
  "title": "Study for exam",
  "description": "Chapters 5-7",
  "subject_id": 1,
  "priority": "high",
  "due_date": "2026-05-15"
}
```

### Mark todo complete

```javascript
PATCH /api/todos/1/toggle
{
  "is_completed": true
}
```

### Edit todo

```javascript
PUT /api/todos/1
{
  "title": "Updated title",
  "description": "Updated description",
  "subject_id": 1,
  "priority": "medium",
  "due_date": "2026-05-20",
  "is_completed": false
}
```

### Delete todo

```javascript
DELETE / api / todos / 1;
```

---

## 📦 Dependencies

**Backend:**

- `express` - Web framework
- `sqlite3` - Database
- `cors` - Cross-origin requests

**Frontend:**

- React Native + TypeScript
- Redux/Context for state
- Async Storage for persistence

---

## 💡 Tips

1. **Restart Metro Bundler:** Press `r` in terminal running `npm start`
2. **Check Network:** Ensure Android emulator can reach `10.0.2.2:5000`
3. **View Database:** Use SQLite viewer on `studytime.sqlite`
4. **Test API:** Use Postman or cURL commands above
5. **Check Logs:** Both backend console and React Native Logcat

---

## 🔐 Remember

⚠️ Development mode - not for production!

For production:

- Add authentication
- Validate inputs
- Use environment variables
- Enable HTTPS
- Add error handling
- Rate limiting
- Proper logging

---

**Last Updated:** April 30, 2026

**Status:** ✅ Ready to use
