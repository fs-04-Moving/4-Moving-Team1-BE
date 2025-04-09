import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { EstimateRequstDto } from "../types/estimate-request.type";
import estimateRequstService from "../servieces/estimate-request.sevice";
import {
  findActiveEstimateRequests,
  findInactiveEstimateRequests,
} from "../servieces/utills";
import estimateService from "../servieces/estimate.service";
import userService from "../servieces/user.service";
import { Area, ServiceType } from "@prisma/client";
import { profile } from "console";
import profileService from "../servieces/profile.service";

// 견적 요청 생성하기
const createEstimateRequestController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const {
      serviceType,
      departureAddress,
      destination,
      movingDate,
      departureArea,
    } = req.body;
    const customerId = req.userId as string;
    const estimateRequstDto: EstimateRequstDto = {
      customerId,
      serviceType,
      departureAddress,
      destination,
      movingDate,
      departureArea,
    };
    // await 서비스 함수 호출
    await estimateRequstService.createEstimateRequest(estimateRequstDto);
    res.sendStatus(201);
  }
);

// 견적 요청 삭제하기
const deleteEstimateRequestController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
    await estimateRequstService.deleteEstimateRequest(customerId);
    res.sendStatus(204);
  }
);

// 일반 유저 받았던 견적 요청들
const getEstimateRequestsController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const customerId = req.userId as string;
    const inactiveEstimateRequests = await findInactiveEstimateRequests(
      customerId
    );
    const estimateRequests = await Promise.all(
      inactiveEstimateRequests.map(async (inactiveEstimateRequest) => {
        const {
          id,
          createdAt,
          serviceType,
          movingDate,
          departureAddress,
          destination,
        } = inactiveEstimateRequest;
        return {
          id,
          requestDate: createdAt,
          serviceType,
          movingDate,
          destination,
          departureAddress,
        };
      })
    );
    res.status(200).send(estimateRequests);
  }
);

//1.모든 estimateReuest를 가져온다.
//2.estimateReuest include estimate (estimate.workerId === estimateRequest.workId) 인게 있는지 확인한다.
//3.2에서 있다면 status가 assigned 를 응답값에 추가 없으면 null 추가

const getRequsetEstimateRequestsController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const workerId = req.userId as string;

    const { orderBy, serviceType, filter, search, page, pageSize } =
      req.validateQuery;

    const isAssigned = filter?.includes("assigned");
    const isServiceable = filter?.includes("area");

    let serviceArea: Array<Area> | undefined = undefined;
    if (isServiceable) {
      serviceArea = await profileService.getWorkerServiceArea(workerId);
    }
    const data = await estimateRequstService.getRecivedEstimateReuests({
      page,
      pageSize,
      workerId,
      orderBy,
      serviceType,
      serviceArea,
      search,
      isAssigned,
    });
    res.status(200).send(data);
  }
);

const estimateRequest = {
  createEstimateRequestController,
  deleteEstimateRequestController,
  getEstimateRequestsController,
  getRequsetEstimateRequestsController,
};

export default estimateRequest;
