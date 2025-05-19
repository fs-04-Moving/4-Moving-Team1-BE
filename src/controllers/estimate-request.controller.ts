import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { EstimateRequstDto } from "../types/estimate-request.type";
import estimateRequstService from "../services/estimate-request.sevice";
import { Area } from "@prisma/client";
import profileService from "../services/profile.service";
import { EstimateRequestQuery } from "../validations/estimate-requset.validation";
import { PaginationQuery } from "../validations/common.validation";
import userService from "../services/user.service";

// 견적 요청 생성하기
const createEstimateRequestController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { serviceType, departure, destination, movingDate, departureArea } =
      req.body;
    const customerId = req.userId as string;
    const estimateRequstDto: EstimateRequstDto = {
      customerId,
      serviceType,
      departure,
      destination,
      movingDate,
      departureArea,
    };
    // await 서비스 함수 호출
    await estimateRequstService.createEstimateRequest(estimateRequstDto);
    const { accessToken, refreshToken } =
      await userService.updateUserRequestStatus(customerId);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      domain: ".movings.kro.kr",
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      domain: ".movings.kro.kr",
    });

    res.status(200).send({ accessToken });
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
    const { page, pageSize } = req.validateQuery as PaginationQuery;
    const { inactiveEstimateRequests, totalCount } =
      await estimateRequstService.findInactiveEstimateRequests({
        customerId,
        page,
        pageSize,
      });
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
    res.status(200).send({ list: estimateRequests, totalCount });
  }
);

//1.모든 estimateReuest를 가져온다.
//2.estimateReuest include estimate (estimate.workerId === estimateRequest.workId) 인게 있는지 확인한다.
//3.2에서 있다면 status가 assigned 를 응답값에 추가 없으면 null 추가

const getRequsetEstimateRequestsController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const workerId = req.userId as string;

    const { orderBy, serviceType, filter, search, page, pageSize } =
      req.validateQuery as EstimateRequestQuery;

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
    serviceArea = await profileService.getWorkerServiceArea(workerId);
    const count = await estimateRequstService.countEstimateRequests({
      serviceArea,
      workerId,
    });

    res.status(200).send({ ...data, ...count });
  }
);

const estimateRequest = {
  createEstimateRequestController,
  deleteEstimateRequestController,
  getEstimateRequestsController,
  getRequsetEstimateRequestsController,
};

export default estimateRequest;
