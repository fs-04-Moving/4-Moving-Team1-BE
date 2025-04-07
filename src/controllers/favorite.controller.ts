import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { findUser } from "../servieces/utills";
import favoriteService from "../servieces/favorite.service";

const createFavoriteController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
    const { workerId } = req.params;
    await findUser(workerId);
    await favoriteService.createFavorite(customerId, workerId);
    res.sendStatus(201);
  }
);

const deleteFavoriteController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
    const { workerId } = req.params;
    await findUser(workerId);
    await favoriteService.deleteFavorite(customerId, workerId);
    res.sendStatus(204);
  }
);

const getFavoritesController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
  }
);

const favorite = {
  createFavoriteController,
  deleteFavoriteController,
  getFavoritesController,
};
export default favorite;
