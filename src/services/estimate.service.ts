import { Area, EstimateStatus, Prisma, ServiceType } from "@prisma/client";
import prisma from "../db/prisma/client";
import { EstimateDto } from "../types/estimate.type";
import estimateRequstService from "./estimate-request.sevice";
import userService from "./user.service";

// 견적 생성 함수
const createEstimate = async (estimateDto: EstimateDto) => {
  try {
    const { workerId, customerId, status, price } = estimateDto;

    const estimateRequest =
      await estimateRequstService.findpendingEstimateRequest(customerId);

    await userService.findUser(workerId);

    const {
      id,
      serviceType,
      departure,
      destination,
      movingDate,
      departureArea,
    } = estimateRequest;

    const estimate = await prisma.estimate.findFirst({
      where: { estimateRequestId: id, workerId, customerId },
    });

    if (estimate) throw new Error("400/estimate already exist");

    if (status === "general" && price === undefined) {
      throw new Error("400/price is required for general estimate");
    }

    const newEstimate = await prisma.estimate.create({
      data: {
        estimateRequestId: id,
        customerId,
        workerId,
        serviceType,
        departure,
        destination,
        movingDate,
        status,
        departureArea,
        ...(status === "general" ? { price } : {}),
      },
    });

    return newEstimate;
  } catch (e) {
    throw e;
  }
};

// 견적의 isConfirmed: ture로 변경, 만약 가격이 없으면 에러 반환
const confirmEstimate = async (estimateId: string) => {
  try {
    const { price } = await findEstimate(estimateId);
    if (!price) throw new Error("400/The estimate is not yet priced");
    const estimate = await prisma.estimate.update({
      where: { id: estimateId },
      data: { isConfirmed: true },
      select: { workerId: true },
    });
    return estimate;
  } catch (e) {
    throw e;
  }
};
//
const rejectEstimate = async (estimateId: string, rejectionMessage: string) => {
  try {
    // 견적이 있는지 확인
    const { price } = await findEstimate(estimateId, "assigned");
    if (price) throw new Error("400/estimate already sent to the user.");
    return await prisma.estimate.update({
      where: { id: estimateId },
      data: { status: "rejected", rejectionMessage },
    });
  } catch (e) {
    throw e;
  }
};
//
const priceEstimate = async (
  estimateId: string,
  price: number,
  comment: string
) => {
  try {
    // 견적이 있는지 확인(거부된거면 가격 못하게)
    if (!price) throw new Error("400/price is required for general estimate");
    const { price: checkPrice } = await findEstimate(estimateId, "assigned");
    if (checkPrice) throw new Error("400/estimate already sent to the user.");

    await prisma.estimate.update({
      where: { id: estimateId },
      data: { price, comment },
    });
  } catch (e) {
    throw e;
  }
};

//pending 상태의 견적들 찾기기
const getPendingEstimates = async ({
  customerId,
  page,
  pageSize,
}: {
  customerId: string;
  page: number;
  pageSize: number;
}) => {
  const now = new Date();
  try {
    // 아이디 찾기
    const { id: estimateRequestId } =
      await estimateRequstService.findpendingEstimateRequest(customerId);

    const [pendingEstimates, totalCount] = await Promise.all([
      prisma.estimate.findMany({
        where: { estimateRequestId },
        include: {
          worker: {
            include: {
              workProfile: true,
              _count: {
                select: {
                  receivedReviews: true,
                  workerFavorites: true,
                },
              },
              workerFavorites: { where: { customerId } },
            },
          },
          estimateRequset: {
            select: { status: true },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.estimate.count({
        where: { estimateRequestId },
      }),
    ]);

    const workerIds = pendingEstimates.map((estimate) => estimate.workerId);

    const [avgStars, confirmedEstimatesCounts] = await Promise.all([
      prisma.review.groupBy({
        by: ["workerId"],
        where: { workerId: { in: workerIds } },
        _avg: { star: true },
      }),
      prisma.estimate.groupBy({
        by: ["workerId"],
        where: {
          workerId: { in: workerIds },
          isConfirmed: true,
          movingDate: { lt: now },
        },
        _count: { _all: true },
      }),
    ]);

    const pendingEstimatesWithData = pendingEstimates.map((estimate) => {
      const workerId = estimate.workerId;
      const avgStar =
        avgStars.find((review) => review.workerId === workerId)?._avg.star ||
        null;
      const confirmedEstimatesCount =
        confirmedEstimatesCounts.find(
          (estimate) => estimate.workerId === workerId
        )?._count._all || 0;

      return {
        ...estimate,
        worker: {
          ...estimate.worker,
          avgStar,
          confirmedEstimatesCount,
        },
      };
    });

    return { pendingEstimatesWithData, totalCount };
  } catch (e) {
    throw e;
  }
};

//estimateRequestId에 해당하는 견적들 찾기
const getEstimatesByEstimateRequestId = async ({
  estimateRequestId,
  page,
  pageSize,
  customerId,
}: {
  estimateRequestId: string;
  page: number;
  pageSize: number;
  customerId: string;
}) => {
  const now = new Date();
  try {
    const [estimates, totalCount] = await Promise.all([
      prisma.estimate.findMany({
        where: { estimateRequestId },
        include: {
          worker: {
            include: {
              workProfile: true,
              _count: {
                select: {
                  receivedReviews: true,
                  workerFavorites: true,
                },
              },
              workerFavorites: { where: { customerId } },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.estimate.count({ where: { estimateRequestId } }),
    ]);

    const workerIds = estimates.map((estimate) => estimate.workerId);

    const [avgStars, confirmedEstimatesCounts] = await Promise.all([
      prisma.review.groupBy({
        by: ["workerId"],
        where: { workerId: { in: workerIds } },
        _avg: { star: true },
      }),
      prisma.estimate.groupBy({
        by: ["workerId"],
        where: {
          workerId: { in: workerIds },
          isConfirmed: true,
          movingDate: { lt: now },
        },
        _count: { _all: true },
      }),
    ]);

    const estimatesWithData = estimates.map((estimate) => {
      const workerId = estimate.workerId;
      const avgStar =
        avgStars.find((review) => review.workerId === workerId)?._avg.star ||
        null;
      const confirmedEstimatesCount =
        confirmedEstimatesCounts.find(
          (estimate) => estimate.workerId === workerId
        )?._count._all || 0;

      return {
        ...estimate,
        worker: {
          ...estimate.worker,
          avgStar,
          confirmedEstimatesCount,
        },
      };
    });
    return { estimatesWithData, totalCount };
  } catch (e) {
    throw e;
  }
};

const getEstimateByEstimatetId = async (estimatetId: string) => {
  try {
    const estimate = await prisma.estimate.findFirst({
      where: { id: estimatetId },
    });
    if (!estimate) throw new Error("400/Estimate not found");
    return estimate;
  } catch (e) {
    throw e;
  }
};

const getAssignedEstimate = async (
  workerId: string,
  isConfirmed?: boolean,
  serviceType?: ServiceType[],
  serviceArea?: Area[],
  search?: string
) => {
  try {
    const where: Prisma.EstimateWhereInput = {
      workerId,
      status: "assigned",
      ...(typeof isConfirmed === "boolean" && { isConfirmed }),
      ...(serviceType &&
        serviceType.length > 0 && {
          serviceType: { in: serviceType },
        }),
      ...(serviceArea &&
        serviceArea.length > 0 && {
          departureArea: { in: serviceArea },
        }),
      ...(search && {
        customer: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      }),
    };

    const estimates = await prisma.estimate.findMany({
      where,
      include: { customer: { select: { name: true } } },
    });
    if (!estimates) throw new Error("400/estimates not found");
    return estimates;
  } catch (e) {
    throw e;
  }
};

const getSentEstimates = async ({
  workerId,
  page,
  pageSize,
}: {
  workerId: string;
  page: number;
  pageSize: number;
}) => {
  try {
    const [estimates, totalCount] = await Promise.all([
      prisma.estimate.findMany({
        where: { workerId, status: { not: "rejected" }, price: { not: null } },
        include: { customer: { select: { name: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.estimate.count({
        where: { workerId, status: { not: "rejected" }, price: { not: null } },
      }),
    ]);

    if (!estimates) throw new Error("400/estimates not found");
    return { estimates, totalCount };
  } catch (e) {
    throw e;
  }
};

const getRejectEstimates = async ({
  workerId,
  page,
  pageSize,
}: {
  workerId: string;
  page: number;
  pageSize: number;
}) => {
  try {
    const [estimates, totalCount] = await Promise.all([
      prisma.estimate.findMany({
        where: { workerId, status: "rejected" },
        include: { customer: { select: { name: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.estimate.count({ where: { workerId, status: "rejected" } }),
    ]);

    if (!estimates) throw new Error("400/estimates not found");
    return { estimates, totalCount };
  } catch (e) {
    throw e;
  }
};

const getReviewableEstimates = async ({
  customerId,
  page,
  pageSize,
}: {
  customerId: string;
  page: number;
  pageSize: number;
}) => {
  try {
    const [estimates, totalCount] = await Promise.all([
      prisma.estimate.findMany({
        where: {
          customerId,
          isConfirmed: true,
          movingDate: { lt: new Date() },
          review: null,
        },
        select: {
          id: true,
          workerId: true,
          serviceType: true,
          movingDate: true,
          departure: true,
          destination: true,
          price: true,
          status: true,
          worker: {
            select: {
              workProfile: {
                select: {
                  nickname: true,
                  profileImage: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.estimate.count({
        where: {
          customerId,
          isConfirmed: true,
          movingDate: { lt: new Date() },
          review: null,
        },
      }),
    ]);

    return {
      estimates,
      totalCount,
    };
  } catch (e) {
    throw e;
  }
};

const getworkerIdByEstimateId = async (estimateId: string) => {
  try {
    const estimate = await prisma.estimate.findFirst({
      where: { id: estimateId },
      select: { workerId: true },
    });
    if (!estimate?.workerId) throw new Error("400/worker not found");

    return estimate.workerId;
  } catch (e) {
    throw e;
  }
};

// 기사-유저간의 존재하는 견적 가져오기 함수
const findEstimate = async (estimateId: string, status?: EstimateStatus) => {
  try {
    const where: any = { id: estimateId };
    if (status) {
      where.status = status;
    }
    const estimate = await prisma.estimate.findFirst({
      where,
    });
    if (!estimate)
      throw new Error(`400/${status ? status : ""} Estimate not found`);

    return estimate;
  } catch (e) {
    throw e;
  }
};

const estimateService = {
  createEstimate,
  confirmEstimate,
  rejectEstimate,
  priceEstimate,
  getPendingEstimates,
  getEstimatesByEstimateRequestId,
  getEstimateByEstimatetId,
  getAssignedEstimate,
  getSentEstimates,
  getRejectEstimates,
  getReviewableEstimates,
  getworkerIdByEstimateId,
  findEstimate,
};

export default estimateService;
