#!/bin/bash

# Backend startup script for Productivity Study Timer
# This script installs dependencies and starts the Node.js/Express server

echo "📦 Installing backend dependencies..."
npm install express sqlite3 cors

echo ""
echo "🚀 Starting backend server..."
node services/todoService.js
