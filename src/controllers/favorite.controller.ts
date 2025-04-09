import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { findUser } from "../servieces/utills";
import favoriteService from "../servieces/favorite.service";
import { PaginationQuery } from "../validations/common.validation";

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

const getFavoriteWorkersController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
    const { page, pageSize } = req.validateQuery as PaginationQuery;
    const { favoriteWorkersWithData, totalCount } =
      await favoriteService.getFavoriteWorkers({
        customerId,
        page,
        pageSize,
      });
    const list = favoriteWorkersWithData
      .filter((fav) => fav.worker?.workProfile)
      .map((fav) => {
        const profile = fav.worker.workProfile!;
        return {
          workerId: fav.workerId,
          workerProfileImage: profile.profileImage,
          workerNickname: profile.nickname,
          workerExperience: profile.experience,
          workerSummary: profile.summary,
          workerDescription: profile.description,
          services: profile.services,
          serviceAreas: profile.serviceAreas,
          workerConfirmedEstimatesCount: fav.worker.confirmedEstimateCount,
          workerReviewsCount: fav.worker._count.receivedReviews,
          workerFavoritesCount: fav.worker._count.workerFavorites,
          workerRating: fav.worker.avgStar,
        };
      });

    res.send({ list, totalCount }).status(200);
  }
);

const checkFavoriteController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
    const { workerId } = req.params;
    await findUser(workerId);
    const result = await favoriteService.checkFavorite(customerId, workerId);
    res.status(200).send(result);
  }
);

const favorite = {
  createFavoriteController,
  deleteFavoriteController,
  getFavoriteWorkersController,
  checkFavoriteController,
};
export default favorite;
