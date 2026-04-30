# 📚 Productivity Study Timer - Complete Setup Guide

A React Native app for tracking study time with organized todos and timer integration.

## 🎯 Features

- **Timer Management**

  - Count-up timer for study sessions
  - Pomodoro timer with work/break cycles
  - Automatic cumulative study time tracking

- **Todo Management**

  - Organize todos by subject
  - Add todos with title, description, priority, and due date
  - Mark todos as complete/incomplete
  - Edit and delete todos
  - Launch timer directly from todo detail view

- **Data Persistence**
  - SQLite database for todos
  - AsyncStorage for timer data
  - Real-time API sync

---

## 🚀 Quick Start

### Prerequisites

- Node.js v14+
- npm
- Android Studio (Android) or Xcode (iOS)
- Java Development Kit (JDK 8+)

### Step 1: Install Frontend Dependencies

```bash
npm install
```

### Step 2: Install Backend Dependencies

```bash
npm install express sqlite3 cors
```

### Step 3: Start the Backend Server

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

### Step 4: Start the React Native App

Open a new terminal in the project root:

**Android:**

```bash
npm start
a
```

**iOS:**

```bash
npm start
i
```

---

## 📁 Project Structure

```
productivityStudyTimer/
├── screens/
│   ├── TodoScreen.tsx           # Main todo management screen
│   ├── CountUpTimerScreen.tsx   # Count-up timer
│   ├── PomodoroTimerScreen.tsx  # Pomodoro timer
│   ├── TimerSelectionScreen.tsx # Timer selection
│   ├── HomeScreen.tsx           # Home screen
│   └── ViewTodoScreen.tsx       # Placeholder (modals in TodoScreen)
├── services/
│   ├── todoService.js           # Express backend API
│   ├── databaseService.ts       # SQLite service
│   ├── todoService.js           # Todo business logic
│   └── apiService.ts            # API configuration
├── hooks/
│   └── usePersistentTimer.ts    # Timer persistence hook
├── types/
│   └── navigation.ts            # TypeScript navigation types
├── API/
│   └── index.tsx                # API base URL
├── assets/
│   └── background.jpg           # Background image
├── icons/
│   └── add_icon.png             # UI icons
├── package.json                 # Frontend dependencies
├── backend-package.json         # Backend dependencies (reference)
├── start-backend.bat            # Windows backend startup
├── start-backend.sh             # macOS/Linux backend startup
├── BACKEND_SETUP.md             # Backend setup guide
├── API_GUIDE.md                 # Complete API documentation
└── README.md                    # This file
```

---

## 🔧 Backend API

The Express.js server provides RESTful endpoints for todo management:

### Key Endpoints

**Todos:**

- `GET /api/todos` - Get all todos grouped by subject
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `PATCH /api/todos/:id/toggle` - Toggle completion
- `DELETE /api/todos/:id` - Delete a todo

**Subjects:**

- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create a new subject

Full API documentation in [API_GUIDE.md](API_GUIDE.md)

---

## 📱 Frontend Architecture

### Screens

**TodoScreen.tsx**

- Main todo management interface
- Tasks grouped by subject
- Modals for add/edit/detail views
- Toggle completion, delete, edit functionality
- Launch timer from task detail

**CountUpTimerScreen.tsx**

- Starts at 0:00:00 and counts up
- Start/Pause/Reset controls
- Task context display (if launched from todo)
- Automatic study time logging

**PomodoroTimerScreen.tsx**

- 25min work + 5min break cycles
- Session tracking
- Pause and skip controls
- Study time accumulation

**TimerSelectionScreen.tsx**

- Choose subject/topic
- Select timer type (count-up or pomodoro)
- Add new subjects

**HomeScreen.tsx**

- Dashboard showing cumulative study time
- Quick navigation to timers and todos

### Key Components

**TodoItem Component**

- Displays individual todo with priority badge
- Checkbox for completion toggle
- Due date display

**AddTaskModal**

- Full task creation form
- Fields: title, description, priority, due date
- Subject context

**TodoDetailModal**

- Complete task information
- Start Timer button (launches CountUpTimer)
- Edit and Delete buttons

**EditTodoModal**

- Full task editing
- All fields editable

---

## 💾 Database Schema

### Subjects Table

```sql
CREATE TABLE subjects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  drink_icon TEXT,
  color TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Todos Table

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY,
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

---

## 🔌 API Configuration

The app connects to the backend via `API/index.tsx`:

```typescript
const baseUrl = 'http://10.0.2.2:5000'; // Android emulator default
```

**For different targets:**

- **Android Emulator:** `http://10.0.2.2:5000`
- **Physical Device/iOS:** `http://YOUR_IP:5000` (e.g., `http://192.168.1.100:5000`)

---

## 🎮 Usage Guide

### Creating a Todo

1. Go to **Todo** tab
2. Click **Add** button next to a subject
3. Fill in:
   - **Title** (required)
   - **Description** (optional)
   - **Priority** (None/Low/Medium/High)
   - **Due Date** (optional, format: YYYY-MM-DD)
4. Tap **Add Task**

### Launching a Timer from a Todo

1. Click on a todo item
2. In the detail view, tap **⏱️ Timer** button
3. The timer launches with the task name displayed
4. Study time is tracked and added to cumulative total

### Studying with a Timer

1. Go to **Timers** tab
2. Select subject and timer type:
   - **⏱️ Count Up:** Free-form timing
   - **🍅 Pomodoro:** 25min work + 5min break
3. Tap **Start** when ready
4. **Finish Studying** when done
5. Study time is automatically logged

### Tracking Progress

1. Go to **Home** tab
2. See cumulative study time
3. Check todo completion status

---

## 🐛 Troubleshooting

### Backend Won't Start

```
Error: Cannot find module 'express'
```

**Fix:** Run `npm install express sqlite3 cors`

### App Can't Connect to API

1. Check backend is running: `node services/todoService.js`
2. Verify port 5000 is open
3. Check correct baseUrl in `API/index.tsx`:
   - Android Emulator: `http://10.0.2.2:5000`
   - Other: Check your machine IP
4. Restart metro bundler: `npm start` (press `r`)

### Database Locked Error

- Only one backend instance can run at a time
- Close all terminal windows running the backend
- Restart: `node services/todoService.js`

### Port 5000 Already in Use

```bash
# Kill process on port 5000 (macOS/Linux)
lsof -ti:5000 | xargs kill -9

# Or change PORT in services/todoService.js
# Then update baseUrl in API/index.tsx
```

---

## 📚 Documentation

- [Backend Setup Guide](BACKEND_SETUP.md)
- [Complete API Reference](API_GUIDE.md)
- [Navigation Types](types/navigation.ts)

---

## 🔐 Security Notes

⚠️ **Current setup is for development only**

For production:

- Add authentication/authorization
- Validate all inputs on backend
- Use environment variables
- Enable HTTPS
- Add rate limiting
- Implement proper error handling
- Add database connection pooling

---

## 🚀 Next Steps

1. ✅ Complete setup above
2. ✅ Start backend: `node services/todoService.js`
3. ✅ Start app: `npm start`
4. ✅ Test adding todos
5. ✅ Test launching timers
6. ✅ Verify data persistence
7. 🎉 Start tracking your study time!

---

## 📞 Support

If you encounter issues:

1. Check the relevant guide:

   - Backend issues → [BACKEND_SETUP.md](BACKEND_SETUP.md)
   - API issues → [API_GUIDE.md](API_GUIDE.md)

2. Verify setup steps above

3. Check:
   - Backend running on port 5000
   - Metro bundler running
   - Correct baseUrl in `API/index.tsx`
   - Database file exists at `studytime.sqlite`

---

## 📄 License

Private project for personal use

---

**Happy studying! 📚⏱️**
