import express from "express";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

const app = express();
const __direname = path.resolve();

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

/* Yalla Deployment */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__direname, "../frontend/dist")));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__direname, "../frontend/dist/index.html"));
  });
}

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
