import express from "express";
import profile from "../controllers/profile.controller";
import {
  authenticatedOnly,
  userOnly,
  workerOnly,
} from "../middlewear/auth.middlewwaer";
import { uploadProfileImage } from "../middlewear/upload";

const profileRouter = express.Router();

profileRouter.post(
  "/user",
  authenticatedOnly,
  userOnly,
  uploadProfileImage,
  profile.createUserProfileController
);
profileRouter.post(
  "/worker",
  authenticatedOnly,
  workerOnly,
  uploadProfileImage,
  profile.createRiderProfileController
);

export default profileRouter;
