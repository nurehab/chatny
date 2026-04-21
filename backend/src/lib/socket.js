import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
// socketServer (io better convention)
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// APPLY AUTHENTICATION MIDDLEWARE TO ALL SOCKET CONNECTIONS
io.use(socketAuthMiddleware);

// WE WILL USE THIS FUNC. TO CHECK IF THE USER IS ONLINE OR NOT
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// THIS IS FOR SORTING ONLINE USERS
const userSocketMap = {}; // {userId:socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // io.emit() ==> IS USED TO SEND EVENTS TO ALL CONNECTED CLIENTS
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // WITH socket.on WE LISTEN FOR EVENTS FROM CLIENTS
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
