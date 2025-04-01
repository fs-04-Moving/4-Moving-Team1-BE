import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import userService from "../servieces/user.service";

const getUserMeController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const userId = req.userId as string;
    const userData = await userService.getUserMe(userId);
    const profileImage = await userService.getProfileImage(userId);
    res.status(200).send({ ...userData, ...profileImage });
  }
);

const user = { getUserMeController };
export default user;
