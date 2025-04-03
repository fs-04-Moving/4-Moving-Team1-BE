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

// 일반 유저가 프로필 생성
profileRouter.post(
  "/customer",
  authenticatedOnly,
  customerOnly,
  uploadProfileImage,
  validateCustomerProfile(false),
  profile.createCustomerProfileController
);

// 기사사 유저가 프로필 생성
profileRouter.post(
  "/worker",
  authenticatedOnly,
  workerOnly,
  uploadProfileImage,
  validateWorkerProfile(false),
  profile.createWorkerProfileController
);

// 일반 유저가 프로필 수정
profileRouter.put(
  "/customer",
  authenticatedOnly,
  customerOnly,
  uploadProfileImage,
  validateCustomerProfile(true),
  profile.updateCustomerProfileController
);

// 기사사 유저가 프로필 수정
profileRouter.put(
  "/worker",
  authenticatedOnly,
  workerOnly,
  uploadProfileImage,
  validateWorkerProfile(true),
  profile.updateWorkerProfileController
);

export default profileRouter;
