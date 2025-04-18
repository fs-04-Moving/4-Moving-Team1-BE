import { Area, Prisma, ServiceType } from "@prisma/client";
import prisma from "../db/prisma/client";
import {
  EstimateRequestOrderBy,
  EstimateRequstDto,
} from "../types/estimate-request.type";

// 견적 요청 생성 함수
const createEstimateRequest = async (estimateRequstDto: EstimateRequstDto) => {
  try {
    const { customerId } = estimateRequstDto;
    const existingEstimateRequest = await prisma.estimateRequest.findFirst({
      where: {
        customerId,
        OR: [{ status: "active" }, { status: "confirmed" }],
      },
    });
    if (existingEstimateRequest) {
      throw new Error("400/active estimateRequest exist");
    }
    await prisma.estimateRequest.create({
      data: { ...estimateRequstDto },
    });
  } catch (e) {
    throw e;
  }
};

// 견적 요청 삭제 함수
const deleteEstimateRequest = async (customerId: string) => {
  try {
    const estimateRequest = await prisma.estimateRequest.findFirst({
      where: {
        customerId,
        status: "active",
      },
    });
    if (!estimateRequest) {
      throw new Error("400/estimateRequest not found");
    }
    await prisma.estimateRequest.deleteMany({
      where: {
        customerId,
        status: "active",
      },
    });
  } catch (e) {
    throw e;
  }
};

// 견적 요청의 상태를 confirm으로 변경하는함수
const confirmEstimateRequest = async (customerId: string) => {
  const { id: estimateRequestId } = await findActiveEstimateRequest(customerId);
  await prisma.estimateRequest.update({
    where: { id: estimateRequestId },
    data: { status: "confirmed" },
  });
};

const getRecivedEstimateReuests = async ({
  workerId,
  page = 1,
  pageSize = 10,
  serviceType,
  serviceArea,
  search,
  orderBy = "earliestRequest",
  isAssigned = false,
}: {
  workerId: string;
  page?: number;
  pageSize?: number;
  serviceType?: ServiceType[];
  serviceArea?: Area[];
  search?: string;
  orderBy?: EstimateRequestOrderBy;
  isAssigned?: boolean;
}) => {
  const where: Prisma.EstimateRequestWhereInput = {
    status: "active",
    ...(serviceType?.length && { serviceType: { in: serviceType } }),
    ...(serviceArea?.length && { departureArea: { in: serviceArea } }),
    ...(search && {
      user: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    }),
    ...(isAssigned && {
      estimates: {
        some: {
          workerId,
          status: "assigned",
        },
      },
    }),
  };

  const orderByField: Prisma.EstimateRequestOrderByWithRelationInput =
    orderBy === "earliestMove" ? { movingDate: "asc" } : { createdAt: "asc" };

  const requests = await prisma.estimateRequest.findMany({
    where,
    include: {
      estimates: {
        where: { workerId, status: "assigned" },
        take: 1,
      },
      user: true,
    },
    orderBy: orderByField,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const formatted = requests.map((r) => {
    console.log(r.estimates);
    return {
      id: r.id,
      customerId: r.customerId,
      serviceType: r.serviceType,
      movingDate: r.movingDate,
      departure: r.departureAddress,
      destination: r.destination,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      customerName: r.user.name,
      status: r.estimates.length !== 0 ? "assigned" : null,
      estimateId: r.estimates[0]?.id ?? null,
    };
  });

  const totalCount = await prisma.estimateRequest.count({ where });

  return {
    list: formatted,
    totalCount,
  };
};

const findInactiveEstimateRequests = async ({
  customerId,
  page,
  pageSize,
}: {
  customerId: string;
  page: number;
  pageSize: number;
}) => {
  try {
    const [inactiveEstimateRequests, totalCount] = await Promise.all([
      prisma.estimateRequest.findMany({
        where: { customerId, status: "inactive" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.estimateRequest.count({
        where: { customerId, status: "inactive" },
      }),
    ]);
    if (!inactiveEstimateRequests)
      throw new Error("400/acitve Estimate Request not found");

    return { inactiveEstimateRequests, totalCount };
  } catch (e) {
    throw e;
  }
};

const findActiveEstimateRequest = async (customerId: string) => {
  try {
    const estimateRequest = await prisma.estimateRequest.findFirst({
      where: { customerId, status: "active" },
    });
    if (!estimateRequest)
      throw new Error("400/acitve Estimate Request not found");

    return estimateRequest;
  } catch (e) {
    throw e;
  }
};

const estimateRequstService = {
  createEstimateRequest,
  deleteEstimateRequest,
  confirmEstimateRequest,
  getRecivedEstimateReuests,
  findInactiveEstimateRequests,
  findActiveEstimateRequest,
};

export default estimateRequstService;
