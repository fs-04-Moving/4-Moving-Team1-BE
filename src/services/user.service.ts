import { BASE_URL } from "../app";
import prisma from "../db/prisma/client";
import { UpdateUserDto } from "../types/auth.type";
import authService, { checkPassword } from "./auth.service";
import bcrypt from "bcrypt";

// 내정보 가져오는 함수 : 이름 , 프로필 생성 여부
const getUserMe = async (userId: string) => {
  try {
    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) throw new Error("400/user not found");
    const { name, hasProfile, role, hasRequest } = user;
    const userData = {
      name,
      hasProfile,
      role,
      hasRequest,
    };
    return userData;
  } catch (e) {
    throw e;
  }
};

// 내정보 가져오는 함수 : 프로필 이미지 가져오는 함수
const getProfileImage = async (userId: string) => {
  try {
    // 유저인 경우
    const customerProfile = await prisma.customerProfile.findFirst({
      where: { customerId: userId },
    });
    if (customerProfile?.profileImage) {
      return {
        profileImage: `${BASE_URL}/static/${customerProfile.profileImage
          .split("/")
          .pop()}`,
      };
    }
    // 기사인 경우
    const workerProfile = await prisma.workerProfile.findFirst({
      where: { workerId: userId },
    });
    if (workerProfile?.profileImage) {
      return {
        profileImage: `${BASE_URL}/static/${workerProfile.profileImage
          .split("/")
          .pop()}`,
      };
    }
    //프로필 이미지 없음
    return null;
  } catch (e) {
    throw e;
  }
};

//유저 정보 업데이트하는 함수
const updateUserInfo = async (updateUserDto: UpdateUserDto) => {
  try {
    const { userId, password, newPassword, ...rest } = updateUserDto;
    let user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) {
      throw new Error("400/user not found");
    }
    // 비밀번호 확인하기
    await checkPassword(password, user.encryptedPassword);
    // 비밀번호 생성
    const encryptedPassword = await bcrypt.hash(newPassword, 12);
    user = await prisma.user.update({
      where: { id: userId },
      data: { ...rest, encryptedPassword },
      include: {
        workProfile: { select: { profileImage: true } },
        customerProfile: { select: { profileImage: true } },
      },
    });

    return authService.createTokenByUserData(user);
  } catch (e) {
    throw e;
  }
};

const updateUserRequestStatus = async (userId: string) => {
  try {
    await prisma.user.findFirstOrThrow({
      where: { id: userId },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { hasRequest: true },
    });
  } catch (e) {
    throw e;
  }
};

const findUser = async (userId: string) => {
  try {
    await prisma.user.findFirst({
      where: { id: userId },
      select: { id: true },
    });
    if (!userId) throw new Error("400/worker not found");
  } catch (e) {
    throw e;
  }
};

const userService = {
  getUserMe,
  getProfileImage,
  updateUserInfo,
  updateUserRequestStatus,
  findUser,
};
export default userService;
