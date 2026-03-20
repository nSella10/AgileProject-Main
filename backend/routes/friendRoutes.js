import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  searchUsers,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  removeFriend,
} from "../controllers/friendController.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/search", searchUsers);
router.post("/request", sendFriendRequest);
router.get("/requests", getFriendRequests);
router.post("/accept/:friendshipId", acceptFriendRequest);
router.post("/reject/:friendshipId", rejectFriendRequest);
router.get("/", getFriends);
router.delete("/:friendshipId", removeFriend);

export default router;
