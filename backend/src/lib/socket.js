import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import Message from "../models/Message.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // ================= TYPING =================
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
    }
  });

  // ================= DELIVERED =================
  socket.on("messageDelivered", ({ messageId, senderId }) => {
    const senderSocketId = userSocketMap[senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDelivered", { messageId });
    }
  });

  // ================= SEEN =================
  socket.on("messageSeen", async ({ messageId, senderId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, {
        status: "seen",
      });

      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageSeenUpdate", { messageId });
      }
    } catch (error) {
      console.log("Error updating seen:", error);
    }
  });

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };