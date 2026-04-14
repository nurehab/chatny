import express from "express";

import path from "path";
import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { ENV } from "./lib/env.js";

const app = express();
const __direname = path.resolve();

const PORT = ENV.PORT || 3000;

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

/* Yalla Deployment */
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__direname, "../frontend/dist")));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__direname, "../frontend/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  connectDB();
});
