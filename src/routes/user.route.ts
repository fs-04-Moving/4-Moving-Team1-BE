import express from "express";
import user from "../controllers/user.controller";
import { authenticatedOnly } from "../middleware/auth.middleware";
import { validateUpdateUserInfo } from "../vaildataions/auth.validation";

const userRouter = express.Router();

userRouter.get("/me", authenticatedOnly, user.getUserMeController);
userRouter.put(
  "/",
  authenticatedOnly,
  validateUpdateUserInfo,
  user.updateUserMeController
);

export default userRouter;
