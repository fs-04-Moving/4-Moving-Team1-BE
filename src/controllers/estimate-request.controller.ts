import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { EstimateRequstDto } from "../types/estimate-request.type";
import estimateRequstService from "../servieces/estimate-request.sevice";

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

const estimateRequest = {
  createEstimateRequestController,
  deleteEstimateRequestController,
};

export default estimateRequest;
