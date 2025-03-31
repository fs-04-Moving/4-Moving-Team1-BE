import express from "express";
import authRouter from "./auth.route";
import { authMiddleware } from "../middlewear/auth.middlewwaer";
import profileRouter from "./profile.route";

const router = express.Router();

router.use(authMiddleware);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);

export default router;
