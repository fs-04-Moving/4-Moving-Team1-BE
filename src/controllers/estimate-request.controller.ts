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

// 견적 요청 생성하기
const createEstimateRequestController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { serviceType, departure, destination, movingDate } = req.body;
    const customerId = req.userId as string;
    const estimateRequstDto: EstimateRequstDto = {
      customerId,
      serviceType,
      departure,
      destination,
      movingDate,
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
          departure,
          destination,
        } = inactiveEstimateRequest;
        return {
          id,
          requestDate: createdAt,
          serviceType,
          movingDate,
          destination,
          departure,
        };
      })
    );
    res.status(200).send(estimateRequests);
  }
);

// 필터기능 추가할 예정, 고객 이름 추가로 주기, orderBy만 먼저 적용함,
const getRequsetEstimateRequestsController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const workerId = req.userId as string;
    const { orderBy } = req.query;

    const estimateRequests = await findActiveEstimateRequests();
    const assignedEstimates = await estimateService.getAssignedEstimate(
      workerId,
      false
    );

    const assignedCustomerIds = new Set(
      assignedEstimates.map((estimate) => estimate.customerId)
    );

    const filteredEstimateRequests = estimateRequests.filter(
      (req) => !assignedCustomerIds.has(req.customerId)
    );

    const formattedEstimateRequests = await Promise.all(
      filteredEstimateRequests.map(async (estimateRequest) => {
        const { name } = await userService.getUserMe(
          estimateRequest.customerId
        );
        return {
          id: estimateRequest.id,
          customerId: estimateRequest.customerId,
          serviceType: estimateRequest.serviceType,
          movingDate: estimateRequest.movingDate,
          departure: estimateRequest.departure,
          destination: estimateRequest.destination,
          createdAt: estimateRequest.createdAt,
          updatedAt: estimateRequest.updatedAt,
          status: null,
          customerName: name,
        };
      })
    );

    const formattedAssignedEstimates = await Promise.all(
      assignedEstimates.map(async (estimate) => {
        const { name } = await userService.getUserMe(estimate.customerId);
        return {
          id: estimate.id,
          customerId: estimate.customerId,
          serviceType: estimate.serviceType,
          movingDate: estimate.movingDate,
          departure: estimate.departure,
          destination: estimate.destination,
          createdAt: estimate.createdAt,
          updatedAt: estimate.updatedAt,
          status: estimate.status,
          customerName: name,
        };
      })
    );

    const allEstimates = [
      ...formattedAssignedEstimates,
      ...formattedEstimateRequests,
    ];

    const sortedEstimates = allEstimates.sort((a, b) => {
      if (orderBy === "createdAt") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return (
        new Date(a.movingDate).getTime() - new Date(b.movingDate).getTime()
      );
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
