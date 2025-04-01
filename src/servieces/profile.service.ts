import prisma from "../db/prisma/client";
import { UserProfileDto, WorkerProfileDto } from "../types/profile.type";

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

const profileService = { createUserProfile, createWorkerProfile };

export default profileService;
