require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// connect to DB
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/channels", require("./routes/channels"));
app.use("/api/messages", require("./routes/messages"));

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

require("./socket/socketHandler")(io);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
