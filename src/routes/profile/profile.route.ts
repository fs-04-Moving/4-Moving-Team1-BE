import express from "express";
import profile from "../../controllers/profile.controller";
import {
  authenticatedOnly,
  customerOnly,
  workerOnly,
} from "../../middleware/auth.middleware";
import { uploadProfileImage } from "../../middleware/upload";
import {
  validateCustomerProfile,
  validateGetWorkerProfilesQuery,
  validateWorkerProfile,
} from "../../validations/profile.validation";

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

//기사 프로필 상세 보기
profileRouter.get("/worker/:workerId", profile.getWorkerProfileController);

//기사님 찾기
profileRouter.get(
  "/workers",
  validateGetWorkerProfilesQuery,
  profile.getWorkerProfilesController
);

profileRouter.get(
  "/worker/me",
  authenticatedOnly,
  profile.getWorkerProfileMeController
);

profileRouter.get(
  "/customer/me",
  authenticatedOnly,
  profile.getCustomerProfileMeController
);

export default profileRouter;
