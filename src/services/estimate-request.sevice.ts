import { Area, Prisma, ServiceType } from "@prisma/client";
import prisma from "../db/prisma/client";
import {
  EstimateRequestOrderBy,
  EstimateRequstDto,
} from "../types/estimate-request.type";
import { date } from "zod";

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
  try {
    const { id: estimateRequestId, status } = await findActiveEstimateRequest(
      customerId
    );

    if (status != "active") {
      throw new Error("400/estimateRequest is not active");
    }

    await prisma.estimateRequest.update({
      where: { id: estimateRequestId },
      data: { status: "confirmed" },
    });
  } catch (e) {
    throw e;
  }
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
    movingDate: { gt: new Date() },
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
    ...(isAssigned
      ? {
          // isAssigned === true: workerId + status: "assigned" 조건 필수
          estimates: {
            some: {
              workerId,
              status: "assigned",
              price: null,
            },
          },
        }
      : {
          // isAssigned === false: estimates가 없거나 status: "assigned"만 있으면 됨
          OR: [
            {
              estimates: {
                none: { workerId }, // 아예 없음
              },
            },
            {
              estimates: {
                some: {
                  workerId,
                  status: "assigned",
                  price: null,
                },
              },
            },
          ],
        }),
  };

  const orderByField: Prisma.EstimateRequestOrderByWithRelationInput =
    orderBy === "earliestMove" ? { movingDate: "asc" } : { createdAt: "desc" };

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
      departure: r.departure,
      destination: r.destination,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      customerName: r.user.name,
      status: r.estimates[0] ? r.estimates[0].status : null,
      estimateId: r.estimates[0]?.id ?? null,
      price: r.estimates[0] ? r.estimates[0].price : null,
    };
  });

  const totalCount = await prisma.estimateRequest.count({ where });

  return {
    list: formatted,
    totalCount,
  };
};

const countEstimateRequests = async ({
  workerId,
  serviceArea,
}: {
  workerId: string;
  serviceArea: Area[];
}) => {
  try {
    // 몇개인지
    const serviceTypeRawCounts = await prisma.estimateRequest.groupBy({
      by: ["serviceType"],
      where: {
        status: "active",
        movingDate: { gt: new Date() },
        OR: [
          {
            estimates: {
              none: {
                workerId,
              }, // 아예 없음
            },
          },
          {
            estimates: {
              some: {
                workerId,
                status: "assigned",
                price: null,
              },
            },
          },
        ],
      },
      _count: {
        _all: true,
      },
    });

    const allServiceTypes: ServiceType[] = [
      "smallMove",
      "homeMove",
      "officeMove",
    ];

    const serviceTypeCount = allServiceTypes.reduce<Record<string, number>>(
      (acc, type) => {
        const found = serviceTypeRawCounts.find(
          (entry) => entry.serviceType === type
        );
        acc[type] = found?._count._all || 0;
        return acc;
      },
      {}
    );

    const serviceAreaCount = await prisma.estimateRequest.count({
      where: {
        status: "active",
        movingDate: { gt: new Date() },
        departureArea: { in: serviceArea },
        OR: [
          {
            estimates: {
              none: { workerId }, // 아예 없음
            },
          },
          {
            estimates: {
              some: {
                workerId,
                status: "assigned",
                price: null,
              },
            },
          },
        ],
      },
    });

    const assignedCount = await prisma.estimateRequest.count({
      where: {
        status: "active",
        movingDate: { gt: new Date() },
        estimates: {
          some: {
            workerId,
            status: "assigned",
            price: null,
          },
        },
      },
    });

    return { ...serviceTypeCount, serviceAreaCount, assignedCount };
  } catch (e) {
    throw e;
  }
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

const findpendingEstimateRequest = async (customerId: string) => {
  try {
    const estimateRequest = await prisma.estimateRequest.findFirst({
      where: { customerId, NOT: { status: "inactive" } },
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
  countEstimateRequests,
  findpendingEstimateRequest,
};

export default estimateRequstService;
