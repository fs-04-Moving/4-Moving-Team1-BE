import express from "express";
import user from "../controllers/user.controller";
import { authenticatedOnly } from "../middleware/auth.middleware";

const userRouter = express.Router();

userRouter.get("/me", authenticatedOnly, user.getUserMeController);

export default userRouter;
