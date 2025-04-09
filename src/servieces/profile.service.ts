import { Area, Prisma, ServiceType } from "@prisma/client";
import prisma from "../db/prisma/client";
import {
  CustomerProfileDto,
  profileOrderBy,
  WorkerProfileDto,
} from "../types/profile.type";

// 유저 프로필 생성
const createCustomerProfile = async (
  customerProfileDto: CustomerProfileDto
) => {
  try {
    const { customerId } = customerProfileDto;

    const existingProfile = await prisma.customerProfile.findFirst({
      where: { customerId },
    });
    if (existingProfile) {
      throw new Error("400/profile already exist");
    }

    await prisma.customerProfile.create({
      data: customerProfileDto,
    });
    return;
  } catch (e) {
    throw e;
  }
};

// 기사 프로필 생성
const createWorkerProfile = async (workerProfileDto: WorkerProfileDto) => {
  try {
    const { workerId } = workerProfileDto;

    const existingProfile = await prisma.workerProfile.findFirst({
      where: { workerId },
    });
    if (existingProfile) {
      throw new Error("400/profile already exist");
    }

    await prisma.workerProfile.create({
      data: workerProfileDto,
    });

    return;
  } catch (e) {
    throw e;
  }
};

// 프로필 상태 업데이트 - 유저가 프로필을 만들었는지 확인해서 true/false 값 반환
const updateUserProfileStatus = async (userId: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user) throw new Error("400/User not exist");
    await prisma.user.update({
      where: { id: userId },
      data: { hasProfile: true },
    });
  } catch (e) {
    throw e;
  }
};

// 유저 프로필 업데이트
const updateCustomerProfile = async (
  customerProfileDto: Partial<CustomerProfileDto>
) => {
  try {
    const { customerId } = customerProfileDto;
    if (!customerId) throw new Error("401/customerId not exist");
    const existingProfile = await prisma.customerProfile.findFirst({
      where: { customerId },
    });
    if (!existingProfile) {
      throw new Error("400/profile not exist");
    }

    await prisma.customerProfile.update({
      where: { customerId },
      data: customerProfileDto,
    });
    return;
  } catch (e) {
    throw e;
  }
};

// 기사 프로필 업데이트트
const updateWorkerProfile = async (
  workerProfileDto: Partial<WorkerProfileDto>
) => {
  try {
    const { workerId } = workerProfileDto;
    if (!workerId) throw new Error("401/userId not exist");
    const existingProfile = await prisma.workerProfile.findFirst({
      where: { workerId: workerId },
    });
    if (!existingProfile) {
      throw new Error("400/profile not exist");
    }

    await prisma.workerProfile.update({
      where: { workerId: workerId },
      data: workerProfileDto,
    });

    return;
  } catch (e) {
    throw e;
  }
};

// 기사 유저의 profile 가져오기
// workerProfileImage: string;
// workerSummary: string;
// workerNickname: string;
// workerFavoritesCount: number;
// workerReviewsCount: number;
// workerRating: number;
// workerExperience: number;
// workerConfirmedEstimatesCount: number;
const getWorkerProfile = async (workerId: string) => {
  const now = new Date();
  try {
    const worker = await prisma.user.findFirst({
      where: { id: workerId },
      include: {
        _count: { select: { customerFavorites: true, receivedReviews: true } },
        workProfile: {
          select: {
            profileImage: true,
            nickname: true,
            summary: true,
            experience: true,
          },
        },
      },
    });

    if (!worker) throw new Error("400/worker not found");
    if (!worker.workProfile) throw new Error("400/worker profile not found");
    const avgStar = await prisma.review.aggregate({
      where: { workerId },
      _avg: { star: true },
    });

    const confirmedEstimateCount = await prisma.estimate.count({
      where: {
        workerId,
        isConfirmed: true,
        movingDate: { lt: now },
      },
    });

    return {
      workerProfileImage: worker.workProfile.profileImage ?? null,
      workerSummary: worker.workProfile.summary,
      workerNickname: worker.workProfile.nickname,
      workerExperience: worker.workProfile.experience,
      workerFavoritesCount: worker._count.customerFavorites || 0,
      workerReviewsCount: worker._count.receivedReviews || 0,
      workerRating: avgStar._avg.star ?? null,
      workerConfirmedEstimatesCount: confirmedEstimateCount || 0,
    };
  } catch (e) {
    throw e;
  }
};

const getWorkerServiceArea = async (workerId: string) => {
  try {
    const serviceAreas = await prisma.workerProfile.findFirst({
      where: { workerId },
      select: { serviceAreas: true },
    });
    if (!serviceAreas) throw new Error("400/worker profile not found");
    return serviceAreas.serviceAreas;
  } catch (e) {
    throw e;
  }
};

// // 일반 유저의 profile 가져오기
// const getCustomerProfile = async (customerId: string) => {
//   try {
//     const customerProfile = await prisma.customerProfile.findFirst({
//       where: { customerId },
//     });
//     if (!customerProfile) throw new Error("400/worker profile not exist");
//     return customerProfile;
//   } catch (e) {
//     throw e;
//   }
// };

const getWorkerProfiles = async (
  orderBy?: profileOrderBy,
  service?: ServiceType,
  area?: Area
) => {
  try {
    let order = "";

    switch (orderBy) {
      case "mostReview":
        order = '"reviewCount" DESC';
        break;
      case "highestRated":
        order = '"avgStar" DESC';
        break;
      case "mostExperience":
        order = 'wp."experience" DESC';
        break;
      case "mostConfirmed":
        order = '"confirmedEstimateCount" DESC';
        break;
      default:
        order = '"reviewCount" DESC';
    }

    const result = await prisma.$queryRawUnsafe(`
      SELECT 
        u.id as "workerId",
        wp."profileImage",
        wp."experience",
        wp."nickname",
        wp."services",
        wp."serviceAreas",
        count(distinct r.id)::int as "reviewCount",
        count(distinct f.id)::int as "favoriteCount",
        coalesce(avg(r.star), 0)::float as "avgStar",
        count(distinct CASE 
          WHEN e."isConfirmed" = true AND e."movingDate" < NOW() 
          THEN e.id 
        END)::int as "confirmedEstimateCount"
      FROM "User" u 
      LEFT JOIN "WorkerProfile" wp ON u.id = wp."workerId" 
      LEFT JOIN "Review" r ON u.id = r."workerId" 
      LEFT JOIN "Favorite" f ON f."workerId" = u.id 
      LEFT JOIN "Estimate" e ON u.id = e."workerId" 
      WHERE u.role = 'worker' AND u."hasProfile" = true
      ${
        service
          ? `AND wp."services" @> ARRAY['${service}']::"ServiceType"[]`
          : ""
      }
      ${area ? `AND wp."serviceAreas" @> ARRAY['${area}']::"Area"[]` : ""}
      GROUP BY u.id, wp."profileImage", wp."experience", wp."nickname", wp."services", wp."serviceAreas"
      ORDER BY ${order};
    `);

    return result;
  } catch (e) {
    throw e;
  }
};

const profileService = {
  createCustomerProfile,
  createWorkerProfile,
  updateUserProfileStatus,
  updateCustomerProfile,
  updateWorkerProfile,
  getWorkerProfile,
  getWorkerServiceArea,
  getWorkerProfiles,
};

export default profileService;
