import express from "express";
import auth from "../controllers/auth.controller";
import {
  validateSignInContext,
  validateSignUpContext,
} from "../vaildataions/auth.validation";

const authRouter = express.Router();

authRouter.post("/logIn", validateSignInContext, auth.logInController);
authRouter.post("/signUp", validateSignUpContext, auth.signUpController);
authRouter.post("/refreshToken", auth.refreshTokenController);

export default authRouter;
