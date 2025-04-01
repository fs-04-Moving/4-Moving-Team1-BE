import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { UserProfileDto, WorkerProfileDto } from "../types/profile.type";
import profileService from "../servieces/profile.service";

const createUserProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { livingArea, services } = req.body;
    let profileImage = null;
    if (req.file) {
      profileImage = req.file.path;
    }
    const userId = req.userId;
    if (!userId) return;

    const userProfileDto: UserProfileDto = {
      profileImage,
      livingArea,
      services,
      userId,
    };
    await profileService.createUserProfile(userProfileDto); //유저 프로필 생성
    await profileService.updateUserProfileStatus(userId); // 유저 프로필 상태 업데이트 (hasProfile :true)

    res.sendStatus(201);
  }
);

const createWorkerProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const {
      nickname,
      experience,
      summary,
      description,
      services,
      serviceAreas,
    } = req.body;

    let profileImage = null;
    if (req.file) {
      profileImage = req.file.path;
    }
    const userId = req.userId;
    if (!userId) return;

    const workerProfileDto: WorkerProfileDto = {
      profileImage,
      nickname,
      experience,
      summary,
      description,
      serviceAreas,
      services,
      userId,
    };

    await profileService.createWorkerProfile(workerProfileDto); //유저 프로필 생성
    await profileService.updateUserProfileStatus(userId); // 유저 프로필 상태 업데이트 (hasProfile :true)

    res.sendStatus(201);
  }
);

const updateUserProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { livingArea, services } = req.body;
    let profileImage = null;
    if (req.file) {
      profileImage = req.file.path;
    }
    const userId = req.userId;
    if (!userId) return;

    const userProfileDto: Partial<UserProfileDto> = {
      profileImage,
      livingArea,
      services,
      userId,
    };
    await profileService.updateUserProfile(userProfileDto); //유저 프로필 수정
    res.sendStatus(204);
  }
);

const updateWorkerProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const {
      nickname,
      experience,
      summary,
      description,
      services,
      serviceAreas,
    } = req.body;

    let profileImage = null;
    if (req.file) {
      profileImage = req.file.path;
    }
    const userId = req.userId;
    if (!userId) return;

    const workerProfileDto: Partial<WorkerProfileDto> = {
      profileImage,
      nickname,
      experience,
      summary,
      description,
      serviceAreas,
      services,
      userId,
    };

    await profileService.updateWorkerProfile(workerProfileDto); //유저 프로필 생성
    res.sendStatus(204);
  }
);

const profile = {
  createWorkerProfileController,
  createUserProfileController,
  updateUserProfileController,
  updateWorkerProfileController,
};

export default profile;
