import express from "express";
import auth from "../controllers/auth.controller";
import {
  validateSignIn,
  validateSignUp,
} from "../vaildataions/auth.validation";

const authRouter = express.Router();

authRouter.post("/log-in", validateSignIn, auth.logInController);
authRouter.post("/sign-up", validateSignUp, auth.signUpController);
authRouter.post("/refresh-token", auth.refreshTokenController);

export default authRouter;
