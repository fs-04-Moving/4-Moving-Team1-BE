import express from "express";
import profile from "../controllers/profile.controller";
import {
  authenticatedOnly,
  customerOnly,
  workerOnly,
} from "../middleware/auth.middleware";
import { uploadProfileImage } from "../middleware/upload";
import {
  validateCustomerProfile,
  validateWorkerProfile,
} from "../vaildataions/profile.validation";

const profileRouter = express.Router();

profileRouter.post(
  "/customer",
  authenticatedOnly,
  customerOnly,
  uploadProfileImage,
  validateCustomerProfile(false),
  profile.createCustomerProfileController
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
  "/customer",
  authenticatedOnly,
  customerOnly,
  uploadProfileImage,
  validateCustomerProfile(true),
  profile.updateCustomerProfileController
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
