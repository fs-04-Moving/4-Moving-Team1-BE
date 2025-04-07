import express from "express";
import favorite from "../controllers/favorite.controller";
import { authenticatedOnly, customerOnly } from "../middleware/auth.middleware";
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

//찜한 기사님 보기
favoriteRouter.get("/", favorite.getFavoritesController);

export default favoriteRouter;
