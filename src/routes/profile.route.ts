import express from "express";
import profile from "../controllers/profile.controller";
import {
  authenticatedOnly,
  userOnly,
  workerOnly,
} from "../middlewear/auth.middlewwaer";
import { uploadProfileImage } from "../middlewear/upload";
import {
  validateUserProfileContext,
  validateWorkerProfileContext,
} from "../vaildataions/profile.validation";

const profileRouter = express.Router();

profileRouter.post(
  "/user",
  authenticatedOnly,
  userOnly,
  uploadProfileImage,
  validateUserProfileContext,
  profile.createUserProfileController
);

profileRouter.post(
  "/worker",
  authenticatedOnly,
  workerOnly,
  uploadProfileImage,
  validateWorkerProfileContext,
  profile.createWorkerProfileController
);

export default profileRouter;
