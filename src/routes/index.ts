import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import profileRouter from "./profile/profile.route";
import estimateRequstRouter from "./estimate-request/estimate-request.router";
import estimateRouter from "./estimate/estimate.route";
import favoriteRouter from "./favorite/favorite.route";
import authRouter from "./auth/auth.route";
import reviewRouter from "./review/review.route";
import userRouter from "./user/user.route";

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
