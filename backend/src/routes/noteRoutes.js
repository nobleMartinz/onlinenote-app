import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createNote,
  deleteNote,
  getNotesForUser,
  updateNote
} from "../controllers/noteController.js";

const router = Router();

router.use(authenticate);

router.post("/", createNote);
router.get("/", getNotesForUser);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
