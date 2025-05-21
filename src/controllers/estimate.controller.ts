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
    // 유저의 견적 요청 상태값 변경
    await estimateRequstService.confirmEstimateRequest(customerId);
    // isConfirmed ->ture로 변경
    const estimate = await estimateService.confirmEstimate(estimateId);

    const customer = await userService.getUserMe(customerId);
    const worker = await profileService.getnickname(estimate.workerId);

    await notificationService.sendNotification({
      message: `${worker.nickname} 기사님의 견적이 확정되었어요`,
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
    const worker = await profileService.getnickname(workerId);
    const estimate = await estimateService.createEstimate(estimateDto);
    const esitmateMessage =
      estimate.serviceType === "homeMove"
        ? "가정이사"
        : estimate.serviceType === "officeMove"
        ? "사무실이사"
        : "소형이사";
    await notificationService.sendNotification({
      message: `${worker.nickname} 기사님의 ${esitmateMessage} 견적이 도착했어요`,
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
    const estimate = await estimateService.rejectEstimate(
      estimateId,
      rejectionMessage
    );
    const worker = await profileService.getnickname(estimate.workerId);
    await notificationService.sendNotification({
      message: `${worker.nickname} 기사님에게 보낸 견적이 반려되었어요.`,
      userId: estimate.customerId,
    });

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
          departure,
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
          departure,
          destination,
          isConfirmed,
          profileImage: worker.workProfile?.profileImage
            ? `${BASE_URL}/static/${worker.workProfile.profileImage
                .split("/")
                .pop()}`
            : null,
          summary: worker.workProfile?.summary,
          nickname: worker.workProfile?.nickname,
          experience: worker.workProfile?.experience,
          confirmedEstimatesCount: worker.confirmedEstimatesCount,
          reviewsCount: worker._count?.receivedReviews,
          favoritesCount: worker._count?.workerFavorites,
          rating: worker.avgStar,
          isFavorite: !!worker.workerFavorites?.length,
          estimateRequestStatus: estimate.estimateRequset.status,
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
          departure,
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
          departure,
          destination,
          isConfirmed,
          profileImage: worker.workProfile?.profileImage
            ? `${BASE_URL}/static/${worker.workProfile.profileImage
                .split("/")
                .pop()}`
            : null,
          summary: worker.workProfile?.summary,
          nickname: worker.workProfile?.nickname,
          experience: worker.workProfile?.experience,
          confirmedEstimatesCount: worker.confirmedEstimatesCount,
          reviewsCount: worker._count?.receivedReviews,
          favoritesCount: worker._count?.workerFavorites,
          rating: worker.avgStar,
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
      departure,
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
      departure,
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
      departure,
      destination,
      isConfirmed,
      workerId,
      createdAt,
      comment,
      worker,
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
      departure,
      destination,
      isConfirmed,
      workerId,
      nickname: nickname,
      profileImage: profileImage
        ? `${BASE_URL}/static/${profileImage.split("/").pop()}`
        : null,
      experience: experience,
      confirmedEstimatesCount: confirmedEstimatesCount,
      favoritesCount: favoritesCount,
      rating: reviewsAverage,
      reviewsCount: reviewsCount,
      isFavorite,
      requestDate: createdAt,
      comment,
      summary: worker.workProfile?.summary,
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
          departure,
          destination,
          createdAt,
          updatedAt,
          status,
          customer,
          price,
          isConfirmed,
          estimateRequset,
          rejectionMessage,
        }) => {
          return {
            id,
            customerId,
            serviceType,
            movingDate,
            departure,
            destination,
            createdAt,
            updatedAt,
            status,
            customerName: customer?.name,
            price,
            isConfirmed,
            estimateRequestStatus: estimateRequset.status,
            rejectionMessage,
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
          departure,
          destination,
          createdAt,
          updatedAt,
          status,
          customer,
          rejectionMessage,
        }) => {
          return {
            id,
            customerId,
            serviceType,
            movingDate,
            departure,
            destination,
            createdAt,
            updatedAt,
            status,
            customerName: customer?.name,
            rejectionMessage,
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

    const list = estimates.map((estimate) => {
      const profileImage = estimate.worker.workProfile?.profileImage
        ? `${BASE_URL}/static/${estimate.worker.workProfile.profileImage
            .split("/")
            .pop()}`
        : null;
      return {
        id: estimate.id,
        workerId: estimate.workerId,
        serviceType: estimate.serviceType,
        movingDate: estimate.movingDate,
        departure: estimate.departure,
        destination: estimate.destination,
        price: estimate.price,
        status: estimate.status,
        nickname: estimate.worker?.workProfile?.nickname,
        profileImage,
      };
    });

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
