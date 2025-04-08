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

// 필터기능 추가할 예정, 고객 이름 추가로 주기, orderBy만 먼저 적용함,
//적용할 필터 serviceType 배열 , 서비스 가능 지역 , 지정 견적 요청
const getRequsetEstimateRequestsController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const workerId = req.userId as string;

    const { orderBy, serviceType, filter, search } = req.validateQuery;

    const isAssigned = filter?.includes("assigned");
    const isServiceable = filter?.includes("area");

    let serviceArea: Array<Area> | undefined = undefined;
    if (isServiceable) {
      serviceArea = await profileService.getWorkerServiceArea(workerId);
    }
    const estimateRequests = isAssigned
      ? []
      : await findActiveEstimateRequests(serviceType, serviceArea, search);
    const assignedEstimates = await estimateService.getAssignedEstimate(
      workerId,
      false,
      serviceType,
      serviceArea,
      search
    );

    const assignedCustomerIds = new Set(
      assignedEstimates.map((estimate) => estimate.customerId)
    );

    const filteredEstimateRequests = estimateRequests.filter(
      (req) => !assignedCustomerIds.has(req.customerId)
    );

    const formattedEstimateRequests = await Promise.all(
      filteredEstimateRequests.map(async (estimateRequest) => {
        return {
          id: estimateRequest.id,
          customerId: estimateRequest.customerId,
          serviceType: estimateRequest.serviceType,
          movingDate: estimateRequest.movingDate,
          departure: estimateRequest.departureAddress,
          destination: estimateRequest.destination,
          createdAt: estimateRequest.createdAt,
          updatedAt: estimateRequest.updatedAt,
          status: null,
          customerName: estimateRequest.user.name,
        };
      })
    );

    const formattedAssignedEstimates = await Promise.all(
      assignedEstimates.map(async (estimate) => {
        return {
          id: estimate.id,
          customerId: estimate.customerId,
          serviceType: estimate.serviceType,
          movingDate: estimate.movingDate,
          departure: estimate.departureAddress,
          destination: estimate.destination,
          createdAt: estimate.createdAt,
          updatedAt: estimate.updatedAt,
          status: estimate.status,
          customerName: estimate.customer?.name,
        };
      })
    );

    const allEstimates = [
      ...formattedAssignedEstimates,
      ...formattedEstimateRequests,
    ];

    const sortedEstimates = allEstimates.sort((a, b) => {
      if (orderBy === "earliestRequest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else if (orderBy === "earliestMove") {
        return (
          new Date(a.movingDate).getTime() - new Date(b.movingDate).getTime()
        );
      } else {
        throw new Error("400/orderBy is not correct form");
      }
    });

    res.status(200).send(sortedEstimates);
  }
);

const estimateRequest = {
  createEstimateRequestController,
  deleteEstimateRequestController,
  getEstimateRequestsController,
  getRequsetEstimateRequestsController,
};

export default estimateRequest;
