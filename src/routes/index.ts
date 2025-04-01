import express from "express";
import authRouter from "./auth.route";
import { authMiddleware } from "../middleware/auth.middleware";
import profileRouter from "./profile.route";
import userRouter from "./user.route";

const router = express.Router();

router.use(authMiddleware);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/user", userRouter);

export default router;
