import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
} from "../controller/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { archjetProtection } from "../middleware/archjet.middleware.js";
const router = express.Router();
router.use(archjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

export default router;
