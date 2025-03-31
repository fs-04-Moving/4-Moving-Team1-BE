import express from "express";
import auth from "../controllers/auth.controller";
import {
  validateSignInContext,
  validateSignUpContext,
} from "../vaildataions/auth.validation";

const authRouter = express.Router();

authRouter.post("/log-in", validateSignInContext, auth.logInController);
authRouter.post("/sign-up", validateSignUpContext, auth.signUpController);
authRouter.post("/refresh-token", auth.refreshTokenController);

export default authRouter;
