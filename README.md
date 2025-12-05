# Mini Team Chat Application (Slack-like)

A full-stack real-time chat application using the **MERN** stack + **Socket.io**, supporting multiple channels, authentication, live messaging, typing indicators, presence and pagination.

---

## Features

- User authentication (Login / Signup using JWT)
- Real-time messaging using Socket.io
- Multiple channels
- Join / Leave channels
- Online presence
- Typing indicator
- Message history stored in MongoDB
- Pagination-ready APIs
- Messages update instantly without refresh

---

## Tech Stack

### Frontend
- React + Vite
- TailwindCSS
- Axios
- Socket.io Client

### Backend
- Node.js + Express
- Socket.io
- MongoDB + Mongoose
- JWT Authentication

---

## Project Structure
```
chat-app/
├── client/ (React + Vite + Tailwind)
│ ├── src/
│ │ ├── api/
│ │ ├── assets/
│ │ ├── components/
│ │ ├── context/
│ │ ├── pages/
│ │ ├── utils/
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── vite.config.js
│ └── package.json
├── server/ (Express + Socket.io Backend)
│ ├── config/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── socket/
│ ├── server.js
│ ├── .env
│ └── package.json
└── README.md
```

---

## Setup & Run Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app
```

### 2. Setup Server (Backend)
```
cd server
npm install
```
Create .env in server directory:
```
PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Run Backend: 
```
npm run dev
```

3. Setup Client (Frontend)
```
cd ../client
npm install
```
Create .env in client directory:
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```
Run frontend
```
npm run dev
```

---
## Optional Features Implemented
- Typing indicators
- Message editing or deletion
