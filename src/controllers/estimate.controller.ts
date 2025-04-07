import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import estimateService from "../servieces/estimate.service";
import estimateRequstService from "../servieces/estimate-request.sevice";
import profileService from "../servieces/profile.service";
import { findInactiveEstimateRequests } from "../servieces/utills";

//일반 유저가 지정 견적 생성 (일반 유저가 기사 유저에게 견적 보내기)
const createAssignedEstimateController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { workerId } = req.params;
    if (typeof workerId !== "string")
      throw new Error("400/workerId is invalid");
    const customerId = req.userId as string;
    // 지정 견적 생성
    await estimateService.createEstimate(workerId, customerId, "assigned");
    res.sendStatus(201);
  }
);

//일반 유저가 견적 확정하기 가격확인해야함함
const confirmEstimateController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { estimateId } = req.params;
    const customerId = req.userId as string;
    if (typeof estimateId !== "string")
      throw new Error("400/workerId is invalid");
    // isConfirmed ->ture로 변경
    await estimateService.confirmEstimate(estimateId);
    // 유저의 견적 요청 상태값 변경경
    await estimateRequstService.confirmEstimateRequest(customerId);
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
    await estimateService.createEstimate(
      workerId,
      customerId,
      "general",
      price
    );
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
//나중에 추가해야하는것
//workerFavoritesCount
//workerReviewsCount
//workerRating
//workerConfirmedEstimatesCount
const getPendingEstimatesController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;

    const pendingEstimates = await estimateService.getPendingEstimates(
      customerId
    );
    const mergedData = await Promise.all(
      pendingEstimates.map(async (estimate) => {
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
          workerId,
        };
      })
    );

    res.status(200).send(mergedData);
  }
);

const getEstimatesController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { estimateRequestId } = req.params;
    const estimates = await estimateService.getEstimatesByEstimateRequestId(
      estimateRequestId
    );
    const mergedData = await Promise.all(
      estimates.map(async (estimate) => {
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
          workerId,
        };
      })
    );

    res.status(200).send(mergedData);
  }
);

const getEstimateDetailController: RequestHandler = asyncHandler(
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
      workerId,
    } = estimate;
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
    };
    res.status(200).send(data);
  }
);

const getSentEstimatesController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const workerId = req.userId as string;
    const estimates = await estimateService.getSentEstimates(workerId);

    const data = estimates.map(
      ({
        id,
        customerId,
        serviceType,
        movingDate,
        departure,
        destination,
        createdAt,
        updatedAt,
        status,
      }) => ({
        id,
        customerId,
        serviceType,
        movingDate,
        departure,
        destination,
        createdAt,
        updatedAt,
        status,
      })
    );

    res.status(200).send(data);
  }
);

const getRejectEstimatesController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const workerId = req.userId as string;
    const estimates = await estimateService.getRejectEstimates(workerId);

    const data = estimates.map(
      ({
        id,
        customerId,
        serviceType,
        movingDate,
        departure,
        destination,
        createdAt,
        updatedAt,
        status,
      }) => ({
        id,
        customerId,
        serviceType,
        movingDate,
        departure,
        destination,
        createdAt,
        updatedAt,
        status,
      })
    );

    res.status(200).send(data);
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
  getEstimateDetailController,
  getSentEstimatesController,
  getRejectEstimatesController,
};

export default estimate;
