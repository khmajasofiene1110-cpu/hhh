import express from "express";
import { deleteUser, getUsers } from "../controllers/adminController.mjs";

const router = express.Router();

router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);

export default router;

