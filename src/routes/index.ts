import express from "express";
import authRouter from "./auth.route";
import { authMiddleware } from "../middlewear/auth.middlewwaer";

const router = express.Router();

router.use(authMiddleware);
router.use("/auth", authRouter);

export default router;
