import express from "express";
import favorite from "../../controllers/favorite.controller";
import {
  authenticatedOnly,
  customerOnly,
} from "../../middleware/auth.middleware";
import { validatePaginationQuery } from "../../validations/common.validation";
const favoriteRouter = express.Router();

//유저 찜하기
favoriteRouter.post(
  "/:workerId",
  authenticatedOnly,
  customerOnly,
  favorite.createFavoriteController
);

//찜하기 취소
favoriteRouter.delete(
  "/:workerId",
  authenticatedOnly,
  customerOnly,
  favorite.deleteFavoriteController
);

//기사님을 찜한적이 있는지 확인
favoriteRouter.get(
  "/:workerId",
  authenticatedOnly,
  customerOnly,
  favorite.checkFavoriteController
);

//찜한 기사님 보기
favoriteRouter.get(
  "/",
  authenticatedOnly,
  customerOnly,
  validatePaginationQuery,
  favorite.getFavoriteWorkersController
);

export default favoriteRouter;
