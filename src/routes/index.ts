import express from "express";
import authRouter from "./auth.route";
import { authMiddleware } from "../middleware/auth.middleware";
import profileRouter from "./profile.route";
import userRouter from "./user.route";
import estimateRequstRouter from "./estimate-request.router";
import estimateRouter from "./estimate.route";
import favoriteRouter from "./favorite.route";
import reviewRouter from "./review.route";
import cookieParser from "cookie-parser";

app.use(cookieParser());

const router = express.Router();

router.use(authMiddleware);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/user", userRouter);
router.use("/estimate-request", estimateRequstRouter);
router.use("/estimate", estimateRouter);
router.use("/favorite", favoriteRouter);
router.use("/review", reviewRouter);

export default router;
