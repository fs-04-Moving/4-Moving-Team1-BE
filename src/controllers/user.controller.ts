import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import userService from "../servieces/user.service";
import { UpdateUserDto } from "../types/auth.type";

const getUserMeController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const userId = req.userId as string;
    const userData = await userService.getUserMe(userId);
    const profileImage = await userService.getProfileImage(userId);
    res.status(200).send({ ...userData, ...profileImage });
  }
);

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

const user = { getUserMeController, updateUserMeController };
export default user;
