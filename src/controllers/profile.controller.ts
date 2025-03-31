import { RequestHandler } from "express";
import { asyncHandler } from "../middlewear/error.middleware";
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
    await profileService.createUserProfile(userProfileDto);

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

    await profileService.createWorkProfile(workerProfileDto);

    res.sendStatus(201);
  }
);

const profile = { createWorkerProfileController, createUserProfileController };

export default profile;
