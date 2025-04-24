import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import userService from "../services/user.service";
import { UpdateUserDto } from "../types/auth.type";

// 내정보 가저오기 : 이름 프로필 이미지 , 프로필 생성 여부
const getUserMeController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const userId = req.userId as string;
    const userData = await userService.getUserMe(userId);
    const profileImage = await userService.getProfileImage(userId);
    res
      .status(200)
      .send({ ...userData, profileImage: profileImage?.profileImage ?? null });
  }
);

// 유저 정보 업데이트 : 이름 , 이메일 , 전화번호, 비밀번호
const updateUserMeController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const userId = req.userId as string;
    const { email, password, newPassword, name, phoneNumber } = req.body;
    const updateUserDto: UpdateUserDto = {
      userId,
      email,
      password,
      newPassword,
      name,
      phoneNumber,
    };
    await userService.updateUserInfo(updateUserDto);

    res.sendStatus(204);
  }
);

const getUserInfoController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const userId = req.userId as string;
    const userInfo = await userService.getUserInfo(userId);
    res.status(200).send(userInfo);
  }
);

const user = {
  getUserMeController,
  updateUserMeController,
  getUserInfoController,
};
export default user;
