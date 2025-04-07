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
    const favoriteWorkers = await favoriteService.getFavorites(customerId);
    const data = favoriteWorkers
      .map((fav) => fav.worker?.workProfile)
      .filter((profile): profile is NonNullable<typeof profile> => !!profile)
      .map((profile) => ({
        workerProfileImage: profile.profileImage,
        workerNickname: profile.nickname,
        workerExperience: profile.experience,
        workerSummary: profile.summary,
        workerDescription: profile.description,
        services: profile.services,
        serviceAreas: profile.serviceAreas,
      }));

    res.send(data).status(200);
  }
);

const favorite = {
  createFavoriteController,
  deleteFavoriteController,
  getFavoritesController,
};
export default favorite;
