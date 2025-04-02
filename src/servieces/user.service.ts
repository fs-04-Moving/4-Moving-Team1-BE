import prisma from "../db/prisma/client";

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
      where: { workerId:userId },
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

const userService = { getUserMe, getProfileImage };
export default userService;
