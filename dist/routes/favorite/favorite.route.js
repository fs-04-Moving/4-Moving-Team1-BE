"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const favorite_controller_1 = __importDefault(require("../../controllers/favorite.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const common_validation_1 = require("../../validations/common.validation");
const favoriteRouter = express_1.default.Router();
favoriteRouter.use(auth_middleware_1.authenticatedOnly, auth_middleware_1.customerOnly);
//유저 찜하기
favoriteRouter.post("/:workerId", favorite_controller_1.default.createFavoriteController);
//찜하기 취소
favoriteRouter.delete("/:workerId", favorite_controller_1.default.deleteFavoriteController);
//기사님을 찜한적이 있는지 확인
favoriteRouter.get("/:workerId", favorite_controller_1.default.checkFavoriteController);
//찜한 기사님 보기
favoriteRouter.get("/", common_validation_1.validatePaginationQuery, favorite_controller_1.default.getFavoriteWorkersController);
exports.default = favoriteRouter;
