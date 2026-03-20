import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  assistantChat,
  assistantConfirm,
} from "../controllers/assistantController.js";

const router = express.Router();

// All assistant routes require authentication
router.post("/chat", protect, assistantChat);
router.post("/confirm", protect, assistantConfirm);

export default router;
