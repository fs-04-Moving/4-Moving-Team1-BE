import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { CustomerProfileDto, WorkerProfileDto } from "../types/profile.type";
import profileService from "../servieces/profile.service";

const createCustomerProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { livingArea, services } = req.body;
    let profileImage = null;
    if (req.file) {
      profileImage = req.file.path;
    }
    const customerId = req.userId;
    if (!customerId) return;

    const customerProfileDto: CustomerProfileDto = {
      profileImage,
      livingArea,
      services,
      customerId,
    };
    await profileService.createCustomerProfile(customerProfileDto); //유저 프로필 생성
    await profileService.updateUserProfileStatus(customerId); // 유저 프로필 상태 업데이트 (hasProfile :true)

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
    const workerId = req.userId;
    if (!workerId) return;

    const workerProfileDto: WorkerProfileDto = {
      profileImage,
      nickname,
      experience,
      summary,
      description,
      serviceAreas,
      services,
      workerId,
    };

    await profileService.createWorkerProfile(workerProfileDto); //유저 프로필 생성
    await profileService.updateUserProfileStatus(workerId); // 유저 프로필 상태 업데이트 (hasProfile :true)

    res.sendStatus(201);
  }
);

const updateCustomerProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { livingArea, services } = req.body;
    let profileImage = null;
    if (req.file) {
      profileImage = req.file.path;
    }
    const customerId = req.userId;
    if (!customerId) return;

    const customerProfileDto: Partial<CustomerProfileDto> = {
      profileImage,
      livingArea,
      services,
      customerId,
    };
    await profileService.updateCustomerProfile(customerProfileDto); //유저 프로필 수정
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
    const workerId = req.userId;
    if (!workerId) return;

    const workerProfileDto: Partial<WorkerProfileDto> = {
      profileImage,
      nickname,
      experience,
      summary,
      description,
      serviceAreas,
      services,
      workerId,
    };

    await profileService.updateWorkerProfile(workerProfileDto); //유저 프로필 생성
    res.sendStatus(204);
  }
);

const profile = {
  createWorkerProfileController,
  createCustomerProfileController,
  updateCustomerProfileController,
  updateWorkerProfileController,
};

export default profile;
