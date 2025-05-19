"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const user_controller_1 = __importDefault(require("../../controllers/user.controller"));
const auth_validation_1 = require("../../validations/auth.validation");
const userRouter = express_1.default.Router();
userRouter.use(auth_middleware_1.authenticatedOnly);
// 내 정보 가져오기 , 프로필 이미지, 이름, 프로필 생성 여부
userRouter.get("/me", user_controller_1.default.getUserMeController);
// 내 정보 수정하기 , 이메일,이름,전화번호,비밀번호 수정
userRouter.put("/", auth_validation_1.validateUpdateUserInfo, user_controller_1.default.updateUserMeController);
userRouter.get("/info", user_controller_1.default.getUserInfoController);
exports.default = userRouter;
