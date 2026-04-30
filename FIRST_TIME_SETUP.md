# 🎯 FIRST TIME SETUP - Step by Step

Follow this guide the very first time you want to run the app.

---

## ⏱️ Time Required: 5-10 minutes

---

## Step 1: Install Backend Dependencies

**One-time setup. Do this once.**

Open a terminal in your project folder and run:

```bash
npm install express sqlite3 cors
```

Wait for it to finish. You should see:

```
added XXX packages, and audited XXX packages
```

---

## Step 2: Start the Backend Server

**Keep this running while using the app.**

In the same terminal, run:

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

✅ **Leave this terminal open and running!**

---

## Step 3: Open a New Terminal

**For the React Native app.**

Open a **NEW terminal window** in your project folder.

---

## Step 4: Start the React Native App

In the new terminal, run:

```bash
npm start
```

Wait for Metro Bundler to start. You'll see:

```
> <bunch of output>
> To run on Android: press a
> To run on iOS: press i
```

---

## Step 5: Launch the App

Press the letter for your platform:

**For Android:**

```
a
```

**For iOS:**

```
i
```

The app will compile and launch automatically!

---

## Step 6: Test It's Working

Once the app opens:

1. Navigate to the **Todo** tab
2. Find any subject (e.g., "Math Assignment")
3. Click the **Add** button (colored button)
4. Fill in:
   - **Title:** "Test Task"
   - **Description:** "Testing the backend"
   - **Priority:** Select one (or leave as "No")
   - **Due Date:** Leave blank or enter YYYY-MM-DD format
5. Click **Add Task**
6. You should see the task appear in the list!

✅ **Backend is working!**

---

## Step 7: Test Timer Integration

1. Click on the task you just created
2. Tap the **⏱️ Timer** button
3. The CountUpTimer should open showing your task name
4. Tap **Start** to begin the timer
5. Your task context is displayed!

✅ **Everything is working!**

---

## 🎉 You're All Set!

The backend and frontend are now connected and working together.

### Now You Can:

- ✅ Add todos with full details
- ✅ Edit todos
- ✅ Delete todos
- ✅ Mark todos as complete
- ✅ Launch timers from todos
- ✅ Track study time

---

## 📝 Important Notes

### Keep Two Terminals Open!

```
Terminal 1: Backend Server (NEVER CLOSE)
├── Running: node services/todoService.js
├── Status: "Todo server running on http://0.0.0.0:5000"
└── If you close this, the app won't work!

Terminal 2: Metro Bundler (Development)
├── Running: npm start
├── Status: Can press 'a', 'i', 'r', etc.
└── Safe to close when done
```

### If Something Goes Wrong

**Backend won't start?**

```bash
npm install express sqlite3 cors
node services/todoService.js
```

**App can't connect to backend?**

1. Make sure backend is running in Terminal 1
2. Check it says "Todo server running on http://0.0.0.0:5000"
3. In app terminal, press 'r' to reload

**Port 5000 already in use?**

```bash
# Kill process using port 5000 (Mac/Linux)
lsof -ti:5000 | xargs kill -9

# Then restart backend
node services/todoService.js
```

---

## 📂 What Each Terminal Does

### Terminal 1: Backend Server

```
Runs Express.js on port 5000
Manages SQLite database
Handles all API requests
MUST be running for app to work
```

### Terminal 2: React Native

```
Runs Metro Bundler
Compiles your app
Deploys to emulator/device
Can be closed when not using app
```

---

## 🔄 Typical Workflow

```
Day 1:
  1. Open Terminal 1
  2. Run: node services/todoService.js
  3. Open Terminal 2
  4. Run: npm start
  5. Press 'a' or 'i' to launch app
  6. Use the app!

Day 2+:
  1. Open Terminal 1
  2. Run: node services/todoService.js
  3. Open Terminal 2
  4. Run: npm start
  5. Press 'a' or 'i' to launch app
  6. Use the app!

When done:
  - Close both terminals (or just leave them open for next time)
  - App data saved in SQLite database
```

---

## 📚 Need Help?

- **Backend issues?** → See [BACKEND_SETUP.md](BACKEND_SETUP.md)
- **API questions?** → See [API_GUIDE.md](API_GUIDE.md)
- **Full overview?** → See [README_COMPLETE.md](README_COMPLETE.md)
- **Quick commands?** → See [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

---

## ✅ Checklist

- [ ] Ran `npm install express sqlite3 cors`
- [ ] Backend server running: `node services/todoService.js`
- [ ] New terminal opened for app
- [ ] App started: `npm start`
- [ ] Pressed 'a' or 'i' to launch
- [ ] Can add a todo
- [ ] Can launch timer from todo
- [ ] Everything working!

---

**You're all set! Enjoy tracking your study time! 📚⏱️**
