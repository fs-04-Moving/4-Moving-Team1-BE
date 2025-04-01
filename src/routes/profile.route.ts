import express from "express";
import profile from "../controllers/profile.controller";
import {
  authenticatedOnly,
  userOnly,
  workerOnly,
} from "../middleware/auth.middleware";
import { uploadProfileImage } from "../middleware/upload";
import {
  validateUserProfile,
  validateWorkerProfile,
} from "../vaildataions/profile.validation";

const profileRouter = express.Router();

profileRouter.post(
  "/user",
  authenticatedOnly,
  userOnly,
  uploadProfileImage,
  validateUserProfile(false),
  profile.createUserProfileController
);

profileRouter.post(
  "/worker",
  authenticatedOnly,
  workerOnly,
  uploadProfileImage,
  validateWorkerProfile(false),
  profile.createWorkerProfileController
);

profileRouter.put(
  "/user",
  authenticatedOnly,
  userOnly,
  uploadProfileImage,
  validateUserProfile(true),
  profile.updateUserProfileController
);

profileRouter.put(
  "/worker",
  authenticatedOnly,
  workerOnly,
  uploadProfileImage,
  validateWorkerProfile(true),
  profile.updateWorkerProfileController
);

export default profileRouter;
