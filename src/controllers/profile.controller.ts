import { RequestHandler } from "express";
import { BASE_URL } from "../app";
import { asyncHandler } from "../middleware/error.middleware";
import favoriteService from "../services/favorite.service";
import profileService from "../services/profile.service";
import { CustomerProfileDto, WorkerProfileDto } from "../types/profile.type";
import { GetWorkerProfilesQuery } from "../validations/profile.validation";
import estimateService from "../services/estimate.service";

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
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      domain: ".movings.kro.kr",
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1일
      path: "/",
      domain: ".movings.kro.kr",
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
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      domain: ".movings.kro.kr",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1일
      path: "/",
      domain: ".movings.kro.kr",
    });

    res.status(200).send({ accessToken });
  }
);

// 일반 유저 프로필 수정
const updateCustomerProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { livingArea, services } = req.body;
    let profileImage;
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

    const { accessToken, refreshToken } =
      await profileService.updateUserProfileStatus(customerId); // 프로필 상태 업데이트 + 토큰 재발급

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      domain: ".movings.kro.kr",
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1일
      path: "/",
      domain: ".movings.kro.kr",
    });
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

    let profileImage;
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

    const { accessToken, refreshToken } =
      await profileService.updateUserProfileStatus(workerId); // 유저 프로필 상태 업데이트 (hasProfile :true)

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      domain: ".movings.kro.kr",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1일
      path: "/",
      domain: ".movings.kro.kr",
    });
    res.sendStatus(204);
  }
);
// 기사님 프로필 정보 가져오기
const getWorkerProfileController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { workerId } = req.params;
    const customerId = req.userId;
    const workerProfile = await profileService.getWorkerProfile(workerId);
    const isFavorite = await favoriteService.checkFavorite({
      customerId,
      workerId,
    });
    const buttonStatus = await estimateService.checkcreateAssignedButton(
      workerId,
      customerId
    );
    res.status(200).send({ ...workerProfile, isFavorite, buttonStatus });
  }
);

const getWorkerProfilesController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { orderBy, serviceType, serviceArea, page, pageSize, search } =
      req.validateQuery as GetWorkerProfilesQuery;

    const customerId = req.userId;

    const workerProfiles = await profileService.getWorkerProfiles({
      orderBy,
      serviceType,
      serviceArea,
      page,
      pageSize,
      search,
      customerId,
    });

    res.status(200).send(workerProfiles);
  }
);

const getWorkerProfileMeController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const workerId = req.userId as string;

    const result = await profileService.getWorkerProfileMe(workerId);

    const formattedResult = {
      ...result,
      profileImage: result.profileImage
        ? `${BASE_URL}/static/${result.profileImage.split("/").pop()}`
        : null,
    };

    res.status(200).send(formattedResult);
  }
);

const getCustomerProfileMeController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
    const result = await profileService.getCustomerProfileMe(customerId);
    const formattedResult = {
      ...result,
      profileImage: result.profileImage
        ? `${BASE_URL}/static/${result.profileImage.split("/").pop()}`
        : null,
    };

    res.status(200).send(formattedResult);
  }
);

const profile = {
  createWorkerProfileController,
  createCustomerProfileController,
  updateCustomerProfileController,
  updateWorkerProfileController,
  getWorkerProfileController,
  getWorkerProfilesController,
  getWorkerProfileMeController,
  getCustomerProfileMeController,
};

export default profile;
