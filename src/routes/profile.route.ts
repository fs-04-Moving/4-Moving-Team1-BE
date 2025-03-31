import express from "express";
import profile from "../controllers/profile.controller";
import { authenticatedOnly } from "../middlewear/auth.middlewwaer";

const profileRouter = express.Router();

profileRouter.post(
  "user",
  authenticatedOnly,
  profile.createUserProfileController
);
profileRouter.post(
  "user",
  authenticatedOnly,
  profile.createRiderProfileController
);

export default profileRouter;
