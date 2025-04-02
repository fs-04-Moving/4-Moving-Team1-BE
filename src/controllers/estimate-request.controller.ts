import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { EstimateRequstDto } from "../types/estimate-request.type";
import estimateRequstService from "../servieces/estimate-request.sevice";

const createEstimateRequestController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { movingType, departure, destination, movingDate } = req.body;
    const customerId = req.userId as string;
    const estimateRequstDto: EstimateRequstDto = {
      customerId,
      movingType,
      departure,
      destination,
      movingDate,
    };
    // await 서비스 함수 호출
    await estimateRequstService.createEstimateRequest(estimateRequstDto);
    res.sendStatus(201);
  }
);

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
