import prisma from "../db/prisma/client";
import { UserProfileDto, WorkerProfileDto } from "../types/profile.type";

// 유저 프로필 생성
const createUserProfile = async (userProfileDto: UserProfileDto) => {
  try {
    const { userId } = userProfileDto;

    const existingProfile = await prisma.userProfile.findFirst({
      where: { userId },
    });
    if (existingProfile) {
      throw new Error("400/profile already exist");
    }

    await prisma.userProfile.create({
      data: userProfileDto,
    });
    return;
  } catch (e) {
    throw e;
  }
};
// 기사 프로필 생성
const createWorkerProfile = async (workerProfileDto: WorkerProfileDto) => {
  try {
    const { userId } = workerProfileDto;

    const existingProfile = await prisma.workerProfile.findFirst({
      where: { userId },
    });
    if (existingProfile) {
      throw new Error("400/profile already exist");
    }

    await prisma.workerProfile.create({
      data: workerProfileDto,
    });

    return;
  } catch (e) {
    throw e;
  }
};
// 프로필 상태 업데이트 - 유저가 프로필을 만들었는지 확인해서 true/false 값 반환
const updateUserProfileStatus = async (userId: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user) throw new Error("400/User not exist");
    await prisma.user.update({
      where: { id: userId },
      data: { hasProfile: true },
    });
  } catch (e) {
    throw e;
  }
};

// 유저 프로필 업데이트
const updateUserProfile = async (userProfileDto: Partial<UserProfileDto>) => {
  try {
    const { userId } = userProfileDto;
    if (!userId) throw new Error("401/userId not exist");
    const existingProfile = await prisma.userProfile.findFirst({
      where: { userId },
    });
    if (!existingProfile) {
      throw new Error("400/profile not exist");
    }

    await prisma.userProfile.update({
      where: { userId },
      data: userProfileDto,
    });
    return;
  } catch (e) {
    throw e;
  }
};

// 기사 프로필 업데이트트
const updateWorkerProfile = async (
  workerProfileDto: Partial<WorkerProfileDto>
) => {
  try {
    const { userId } = workerProfileDto;
    if (!userId) throw new Error("401/userId not exist");
    const existingProfile = await prisma.workerProfile.findFirst({
      where: { userId },
    });
    if (!existingProfile) {
      throw new Error("400/profile not exist");
    }

    await prisma.workerProfile.update({
      where: { userId },
      data: workerProfileDto,
    });

    return;
  } catch (e) {
    throw e;
  }
};

const profileService = {
  createUserProfile,
  createWorkerProfile,
  updateUserProfileStatus,
  updateUserProfile,
  updateWorkerProfile,
};

export default profileService;
