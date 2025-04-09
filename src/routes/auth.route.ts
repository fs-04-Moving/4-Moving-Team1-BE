import express from "express";
import auth from "../controllers/auth.controller";
import { validateSignIn, validateSignUp } from "../validations/auth.validation";

const authRouter = express.Router();

authRouter.post("/log-in", validateSignIn, auth.logInController);
authRouter.post("/sign-up", validateSignUp, auth.signUpController);
authRouter.post("/refresh-token", auth.refreshTokenController);
authRouter.delete("/log-out", auth.logOutController);

export default authRouter;
