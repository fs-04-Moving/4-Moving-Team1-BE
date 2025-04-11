import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { CustomerProfileDto, WorkerProfileDto } from "../types/profile.type";
import profileService from "../servieces/profile.service";
import { GetWorkerProfilesQuery } from "../validations/profile.validation";

// 일반 유저 프로필 생성
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
    const { accessToken, refreshToken } =
      await profileService.updateUserProfileStatus(customerId); // 유저 프로필 상태 업데이트 (hasProfile :true)

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: false,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    });

    res.status(200).send({ accessToken });
  }
);

// 기사 유저 프로필 생성
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

    const { accessToken, refreshToken } =
      await profileService.updateUserProfileStatus(workerId); // 유저 프로필 상태 업데이트 (hasProfile :true)

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: false,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    });

    res.status(200).send({ accessToken });
  }
);

// 일반 유저 프로필 수정
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

// 기사 유저 프로필 수정
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
// 기사님 프로필 정보 가져오기
const getWorkerProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { workerId } = req.params;
    const workerProfile = await profileService.getWorkerProfile(workerId);

    res.status(200).send(workerProfile);
  }
);

const getWorkerProfilesController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { orderBy, serviceType, serviceArea, page, pageSize } =
      req.validateQuery as GetWorkerProfilesQuery;
    const workerProfiles = await profileService.getWorkerProfiles({
      orderBy,
      serviceType,
      serviceArea,
      page,
      pageSize,
    });

    res.status(200).send(workerProfiles);
  }
);

const profile = {
  createWorkerProfileController,
  createCustomerProfileController,
  updateCustomerProfileController,
  updateWorkerProfileController,
  getWorkerProfileController,
  getWorkerProfilesController,
};

export default profile;
