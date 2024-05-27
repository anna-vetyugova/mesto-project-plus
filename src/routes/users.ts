import { Router, Request, Response } from "express";
import { getUsers, getUserById, createUser, updateUserProfile, updateUserAvatar } from "../controllers/users";

const router = Router();

router.get("/users", getUsers);
router.get("/users/:userId", getUserById);
router.post("/users", createUser);

router.patch('/users/me', updateUserProfile);
router.patch('/users/me/avatar', updateUserAvatar);

export default router;
