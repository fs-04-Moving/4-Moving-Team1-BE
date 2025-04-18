import {
  Area,
  EstimateStatus,
  Prisma,
  ROLE,
  ServiceType,
} from "@prisma/client";
import prisma from "../db/prisma/client";
import user from "../controllers/user.controller";
import { BASE_URL } from "../app";
import { PayloadData } from "../types/auth.type";
import { createToken } from "./auth.service";

// 유저가 존재하는지 찾기
export const findUser = async (userId: string) => {
  try {
    await prisma.user.findFirst({
      where: { id: userId },
      select: { id: true },
    });
    if (!userId) throw new Error("400/worker not found");
  } catch (e) {
    throw e;
  }
};

// 기사-유저간의 존재하는 활성 견적 요청 가져오기 함수
export const findActiveEstimateRequest = async (customerId: string) => {
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

export const findInactiveEstimateRequests = async ({
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

export const findActiveEstimateRequests = async (
  serviceType?: ServiceType[],
  serviceArea?: Area[],
  search?: string
) => {
  try {
    const where: Prisma.EstimateRequestWhereInput = {
      status: "active",
      ...(serviceType &&
        serviceType.length > 0 && {
          serviceType: { in: serviceType },
        }),
      ...(serviceArea &&
        serviceArea.length > 0 && {
          departureArea: { in: serviceArea },
        }),
      ...(search && {
        user: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      }),
    };

    const estimateRequest = await prisma.estimateRequest.findMany({
      where,
      include: { user: { select: { name: true } } },
    });
    if (!estimateRequest)
      throw new Error("400/acitve Estimate Request not found");

    return estimateRequest;
  } catch (e) {
    throw e;
  }
};

// 기사-유저간의 존재하는 견적 가져오기 함수
export const findEstimate = async (
  estimateId: string,
  status?: EstimateStatus
) => {
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

export const createTokenByUserData = (user: {
  id: string;
  email: string;
  name: string;
  role: ROLE;
  hasProfile: boolean;
  customerProfile?: { profileImage?: string | null } | null;
  workProfile?: { profileImage?: string | null } | null;
}) => {
  const profileImage =
    user.role === "customer"
      ? typeof user.customerProfile?.profileImage === "string"
        ? `${BASE_URL}/static/${user.customerProfile.profileImage
            .split("/")
            .pop()}`
        : undefined
      : user.role === "worker"
      ? typeof user.workProfile?.profileImage === "string"
        ? `${BASE_URL}/static/${user.workProfile.profileImage.split("/").pop()}`
        : undefined
      : undefined;

  const data: PayloadData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    hasProfile: user.hasProfile,
    profileImage,
  };

  const { accessToken, refreshToken } = createToken(data);
  return { accessToken, refreshToken };
};
