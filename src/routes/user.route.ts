import express from "express";
import user from "../controllers/user.controller";
import { authenticatedOnly } from "../middleware/auth.middleware";
import { validateUpdateUserInfo } from "../vaildataions/auth.validation";

const userRouter = express.Router();

// 내 정보 가져오기 , 프로필 이미지, 이름, 프로필 생성 여부
userRouter.get("/me", authenticatedOnly, user.getUserMeController);

// 내 정보 수정하기 , 이메일,이름,전화번호,비밀번호 수정
userRouter.put(
  "/",
  authenticatedOnly,
  validateUpdateUserInfo,
  user.updateUserMeController
);

export default userRouter;
