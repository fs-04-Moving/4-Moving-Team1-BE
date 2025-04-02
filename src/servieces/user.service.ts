import prisma from "../db/prisma/client";
import { UpdateUserDto } from "../types/auth.type";
import { checkPassword } from "./auth.service";
import bcrypt from "bcrypt";

const BASE_URL = "http://localhost:5050";

const getUserMe = async (userId: string) => {
  try {
    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) throw new Error("400/user not found");
    const { name, hasProfile } = user;
    const userData = {
      name,
      hasProfile,
    };
    return userData;
  } catch (e) {
    throw e;
  }
};

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

//유저 정보 업데이트, 기존의 signup validation을 사용하기, + 새비밀번호의 데이터가 올바른지 확인하기
const updateUserInfo = async (updateUserDto: UpdateUserDto) => {
  try {
    const { userId, password, newPassword, ...rest } = updateUserDto;
    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) {
      throw new Error("400/user not found");
    }
    // 비밀번호 확인하기
    await checkPassword(password, user.encryptedPassword);
    // 비밀번호 생성
    const encryptedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { ...rest, encryptedPassword },
    });
  } catch (e) {
    throw e;
  }
};

const userService = { getUserMe, getProfileImage, updateUserInfo };
export default userService;
