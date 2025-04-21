import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import estimateService from "../services/estimate.service";
import estimateRequstService from "../services/estimate-request.sevice";
import { EstimateDto } from "../types/estimate.type";
import { PaginationQuery } from "../validations/common.validation";
import userService from "../services/user.service";
import profileService from "../services/profile.service";
import favoriteService from "../services/favorite.service";
import { BASE_URL } from "../app";
import notificationService from "../services/notification.service";

//일반 유저가 지정 견적 생성 (일반 유저가 기사 유저에게 견적 보내기)
const createAssignedEstimateController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { workerId } = req.params;
    if (typeof workerId !== "string")
      throw new Error("400/workerId is invalid");
    const customerId = req.userId as string;
    // 지정 견적 생성
    const estimateDto: EstimateDto = {
      workerId,
      customerId,
      status: "assigned",
    };
    const customer = await userService.getUserMe(customerId);
    const estimate = await estimateService.createEstimate(estimateDto);
    const esitmateMessage =
      estimate.serviceType === "homeMove"
        ? "가정이사"
        : estimate.serviceType === "officeMove"
        ? "사무실이사"
        : "소형이사";
    await notificationService.sendNotification({
      message: `${customer.name} 고객님의 ${esitmateMessage}견적이 도착했어요`,
      userId: workerId,
    });
    res.sendStatus(201);
  }
);

//일반 유저가 견적 확정하기 가격확인해야함
const confirmEstimateController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { estimateId } = req.params;
    const customerId = req.userId as string;
    if (typeof estimateId !== "string")
      throw new Error("400/workerId is invalid");
    // isConfirmed ->ture로 변경
    const estimate = await estimateService.confirmEstimate(estimateId);
    // 유저의 견적 요청 상태값 변경경
    await estimateRequstService.confirmEstimateRequest(customerId);

    const customer = await userService.getUserMe(customerId);
    const workerNickname = await profileService.getWorkerNickname(
      estimate.workerId
    );

    await notificationService.sendNotification({
      message: `${workerNickname} 기사님의 견적이 확정되었어요`,
      userId: customerId,
    });

    await notificationService.sendNotification({
      message: `${customer.name} 고객님의 견적이 확정되었어요`,
      userId: estimate.workerId,
    });

    res.sendStatus(204);
  }
);

//기사 유저가 견적 생성하기 (기사유저가 일반 유저에게 견적 보내기)
const createGeneralEstimateController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { customerId } = req.params;
    const { price } = req.body;
    const workerId = req.userId as string;
    if (typeof customerId !== "string")
      throw new Error("400/workerId is invalid");
    // 일반 견적 생성
    const estimateDto: EstimateDto = {
      workerId,
      customerId,
      status: "general",
      price,
    };
    const workerNickname = await profileService.getWorkerNickname(workerId);
    const estimate = await estimateService.createEstimate(estimateDto);
    const esitmateMessage =
      estimate.serviceType === "homeMove"
        ? "가정이사"
        : estimate.serviceType === "officeMove"
        ? "사무실이사"
        : "소형이사";
    await notificationService.sendNotification({
      message: `${workerNickname} 기사님의 ${esitmateMessage}견적이 도착했어요`,
      userId: customerId,
    });
    res.sendStatus(201);
  }
);

// 기사 유저가 지정 견적 반려하기
const rejectEstimateController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { estimateId } = req.params;
    const { rejectionMessage } = req.body;
    if (typeof estimateId !== "string")
      throw new Error("400/workerId is invalid");
    await estimateService.rejectEstimate(estimateId, rejectionMessage);
    res.sendStatus(204);
  }
);

// 기사 유저가 지정 견적에 가격을 업데이트
const priceEstimateController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { estimateId } = req.params;
    const { price, comment } = req.body;
    if (typeof estimateId !== "string")
      throw new Error("400/workerId is invalid");

    await estimateService.priceEstimate(estimateId, price, comment);
    res.sendStatus(204);
  }
);
//일반 유저 대기중인 견적 get
const getPendingEstimatesController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
    const { page, pageSize } = req.validateQuery as PaginationQuery;
    const { pendingEstimatesWithData, totalCount } =
      await estimateService.getPendingEstimates({
        customerId,
        page,
        pageSize,
      });
    const list = await Promise.all(
      pendingEstimatesWithData.map(async (estimate) => {
        const {
          id,
          price,
          serviceType,
          status,
          movingDate,
          departureAddress,
          destination,
          isConfirmed,
          worker,
        } = estimate;
        return {
          id,
          price: price ? price : null,
          serviceType: serviceType,
          status,
          movingDate,
          departureAddress,
          destination,
          isConfirmed,
          workerProfileImage: worker.workProfile?.profileImage
            ? `${BASE_URL}/static/${worker.workProfile.profileImage
                .split("/")
                .pop()}`
            : null,
          workerSummary: worker.workProfile?.summary,
          workerNickname: worker.workProfile?.nickname,
          workerExperience: worker.workProfile?.experience,
          workerConfirmedEstimatesCount: worker.confirmedEstimateCount,
          workerReviewsCount: worker._count?.receivedReviews,
          workerFavoritesCount: worker._count?.workerFavorites,
          workerRating: worker.avgStar,
          isFavorite: !!worker.workerFavorites?.length,
        };
      })
    );

    res.status(200).send({ list, totalCount });
  }
);
//일반 유저 견적 컨트롤러 (받았던 견적 조회할때)
const getEstimatesController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { estimateRequestId } = req.params;
    const customerId = req.userId as string;
    const { page, pageSize } = req.validateQuery as PaginationQuery;
    const { estimatesWithData, totalCount } =
      await estimateService.getEstimatesByEstimateRequestId({
        estimateRequestId,
        page,
        pageSize,
        customerId,
      });
    const list = await Promise.all(
      estimatesWithData.map(async (estimate) => {
        const {
          id,
          price,
          serviceType,
          status,
          movingDate,
          departureAddress,
          destination,
          isConfirmed,
          worker,
        } = estimate;

        return {
          id,
          price: price ? price : null,
          serviceType: serviceType,
          status,
          movingDate,
          departureAddress,
          destination,
          isConfirmed,
          workerProfileImage: worker.workProfile?.profileImage
            ? `${BASE_URL}/static/${worker.workProfile.profileImage
                .split("/")
                .pop()}`
            : null,
          workerSummary: worker.workProfile?.summary,
          workerNickname: worker.workProfile?.nickname,
          workerExperience: worker.workProfile?.experience,
          workerConfirmedEstimatesCount: worker.confirmedEstimateCount,
          workerReviewsCount: worker._count?.receivedReviews,
          workerFavoritesCount: worker._count?.workerFavorites,
          workerRating: worker.avgStar,
          isFavorite: !!worker.workerFavorites?.length,
        };
      })
    );

    res.status(200).send({ list, totalCount });
  }
);
//상세 견적 by worker
const getEstimateDetailByWorkerController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { estimateId } = req.params;
    const estimate = await estimateService.getEstimateByEstimatetId(estimateId);

    const {
      id,
      price,
      serviceType,
      status,
      movingDate,
      departureAddress,
      destination,
      isConfirmed,
      customerId,
      createdAt,
    } = estimate;
    const { name } = await userService.getUserMe(customerId);

    const data = {
      id,
      price: price ? price : null,
      serviceType: serviceType,
      status,
      movingDate,
      departureAddress,
      destination,
      isConfirmed,
      customerId,
      customerName: name,
      requestDate: createdAt,
    };
    res.status(200).send(data);
  }
);

//상세 견적 by customer
const getEstimateDetailByCustomerController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { estimateId } = req.params;
    const customerId = req.userId;
    const estimate = await estimateService.getEstimateByEstimatetId(estimateId);

    const {
      id,
      price,
      serviceType,
      status,
      movingDate,
      departureAddress,
      destination,
      isConfirmed,
      workerId,
      createdAt,
    } = estimate;

    const isFavorite = await favoriteService.checkFavorite({
      customerId,
      workerId,
    });

    const {
      nickname,
      profileImage,
      experience,
      confirmedEstimatesCount,
      favoritesCount,
      reviewsAverage,
      reviewsCount,
    } = await profileService.getWorkerProfile(workerId);
    const data = {
      id,
      price: price ? price : null,
      serviceType: serviceType,
      status,
      movingDate,
      departureAddress,
      destination,
      isConfirmed,
      workerId,
      workerNickname: nickname,
      workerProfileImage: profileImage
        ? `${BASE_URL}/static/${profileImage.split("/").pop()}`
        : null,
      workerExperience: experience,
      workerConfirmedEstimatesCount: confirmedEstimatesCount,
      workerFavoritesCount: favoritesCount,
      workerRating: reviewsAverage,
      workerReviewsCount: reviewsCount,
      isFavorite,
      requestDate: createdAt,
    };
    res.status(200).send(data);
  }
);

const getSentEstimatesController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const workerId = req.userId as string;
    const { page, pageSize } = req.validateQuery as PaginationQuery;
    const { estimates, totalCount } = await estimateService.getSentEstimates({
      workerId,
      page,
      pageSize,
    });

    const list = await Promise.all(
      estimates.map(
        async ({
          id,
          customerId,
          serviceType,
          movingDate,
          departureAddress,
          destination,
          createdAt,
          updatedAt,
          status,
          customer,
          price,
        }) => {
          return {
            id,
            customerId,
            serviceType,
            movingDate,
            departureAddress,
            destination,
            createdAt,
            updatedAt,
            status,
            customerName: customer?.name,
            price,
          };
        }
      )
    );

    res.status(200).send({ list, totalCount });
  }
);

const getRejectEstimatesController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const workerId = req.userId as string;
    const { page, pageSize } = req.validateQuery as PaginationQuery;
    const { estimates, totalCount } = await estimateService.getRejectEstimates({
      workerId,
      page,
      pageSize,
    });

    const list = await Promise.all(
      estimates.map(
        async ({
          id,
          customerId,
          serviceType,
          movingDate,
          departureAddress,
          destination,
          createdAt,
          updatedAt,
          status,
          customer,
        }) => {
          return {
            id,
            customerId,
            serviceType,
            movingDate,
            departureAddress,
            destination,
            createdAt,
            updatedAt,
            status,
            customerName: customer?.name,
          };
        }
      )
    );

    res.status(200).send({ list, totalCount });
  }
);

const getReviewableEstimatesController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
    const { page, pageSize } = req.validateQuery as PaginationQuery;
    const { estimates, totalCount } =
      await estimateService.getReviewableEstimates({
        customerId,
        page,
        pageSize,
      });

    const list = estimates.map((estimate) => ({
      id: estimate.id,
      workerId: estimate.workerId,
      serviceType: estimate.serviceType,
      movingDate: estimate.movingDate,
      departure: estimate.departureAddress,
      destination: estimate.destination,
      price: estimate.price,
      status: estimate.status,
      workerNickname: estimate.worker?.workProfile?.nickname,
    }));

    res.send({ list, totalCount }).status(200);
  }
);

const estimate = {
  createAssignedEstimateController,
  confirmEstimateController,
  createGeneralEstimateController,
  rejectEstimateController,
  priceEstimateController,
  getPendingEstimatesController,
  getEstimatesController,
  getEstimateDetailByWorkerController,
  getSentEstimatesController,
  getRejectEstimatesController,
  getReviewableEstimatesController,
  getEstimateDetailByCustomerController,
};

export default estimate;
