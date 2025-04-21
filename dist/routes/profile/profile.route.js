"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profile_controller_1 = __importDefault(require("../../controllers/profile.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const upload_1 = require("../../middleware/upload");
const profile_validation_1 = require("../../validations/profile.validation");
const profileRouter = express_1.default.Router();
// 일반 유저가 프로필 생성
profileRouter.post("/customer", auth_middleware_1.authenticatedOnly, auth_middleware_1.customerOnly, upload_1.uploadProfileImage, (0, profile_validation_1.validateCustomerProfile)(false), profile_controller_1.default.createCustomerProfileController);
// 기사사 유저가 프로필 생성
profileRouter.post("/worker", auth_middleware_1.authenticatedOnly, auth_middleware_1.workerOnly, upload_1.uploadProfileImage, (0, profile_validation_1.validateWorkerProfile)(false), profile_controller_1.default.createWorkerProfileController);
// 일반 유저가 프로필 수정
profileRouter.put("/customer", auth_middleware_1.authenticatedOnly, auth_middleware_1.customerOnly, upload_1.uploadProfileImage, (0, profile_validation_1.validateCustomerProfile)(true), profile_controller_1.default.updateCustomerProfileController);
// 기사사 유저가 프로필 수정
profileRouter.put("/worker", auth_middleware_1.authenticatedOnly, auth_middleware_1.workerOnly, upload_1.uploadProfileImage, (0, profile_validation_1.validateWorkerProfile)(true), profile_controller_1.default.updateWorkerProfileController);
//기사 프로필 상세 보기
profileRouter.get("/worker/:workerId", profile_controller_1.default.getWorkerProfileController);
//기사님 찾기
profileRouter.get("/workers", profile_validation_1.validateGetWorkerProfilesQuery, profile_controller_1.default.getWorkerProfilesController);
exports.default = profileRouter;
