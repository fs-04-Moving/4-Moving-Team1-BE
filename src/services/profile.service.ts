import { Area, ServiceType } from "@prisma/client";
import prisma from "../db/prisma/client";
import {
  CustomerProfileDto,
  profileOrderBy,
  WorkerProfileDto,
} from "../types/profile.type";
import { BASE_URL } from "../app";
import authService from "./auth.service";

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

// 프로필 상태 업데이트 - 유저가 프로필을 만들었는지 확인해서 true/false 값, 토큰들 새로 발급급
const updateUserProfileStatus = async (userId: string) => {
  try {
    await prisma.user.findFirstOrThrow({
      where: { id: userId },
    });
    const user = await prisma.user.update({
      where: { id: userId },
      data: { hasProfile: true },
      include: {
        workProfile: { select: { profileImage: true } },
        customerProfile: { select: { profileImage: true } },
      },
    });

    return authService.createTokenByUserData(user);
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

    const user = await prisma.user.findFirst({
      where: { id: customerId },
      include: {
        workProfile: { select: { profileImage: true } },
        customerProfile: { select: { profileImage: true } },
      },
    });
    if (!user) throw new Error("400/user not found");

    return authService.createTokenByUserData(user);
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

    const user = await prisma.user.findFirst({
      where: { id: workerId },
      include: {
        workProfile: { select: { profileImage: true } },
        customerProfile: { select: { profileImage: true } },
      },
    });
    if (!user) throw new Error("400/user not found");

    return authService.createTokenByUserData(user);
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
            services: true,
            serviceAreas: true,
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
      profileImage: worker.workProfile.profileImage
        ? `${BASE_URL}/static/${worker.workProfile.profileImage
            .split("/")
            .pop()}`
        : null,
      summary: worker.workProfile.summary,
      nickname: worker.workProfile.nickname,
      experience: worker.workProfile.experience,
      favoritesCount: worker._count.customerFavorites || 0,
      reviewsCount: worker._count.receivedReviews || 0,
      reviewsAverage: avgStar._avg.star ?? null,
      confirmedEstimatesCount: confirmedEstimateCount || 0,
      serviceType: worker.workProfile.services,
      serviceArea: worker.workProfile.serviceAreas,
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

const getWorkerProfiles = async ({
  orderBy,
  serviceType,
  serviceArea,
  page,
  pageSize,
  search,
  customerId,
}: {
  orderBy?: profileOrderBy;
  serviceType?: ServiceType;
  serviceArea?: Area;
  page: number;
  pageSize: number;
  search?: string;
  customerId?: string;
}) => {
  try {
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    let order = "";

    switch (orderBy) {
      case "mostReview":
        order = '"reviewsCount" DESC';
        break;
      case "highestRated":
        order = '"reviewsAverage" DESC';
        break;
      case "mostExperience":
        order = 'wp."experience" DESC';
        break;
      case "mostConfirmed":
        order = '"confirmedEstimateCount" DESC';
        break;
      default:
        order = '"reviewsCount" DESC';
    }

    const where = `
    u.role = 'worker' AND u."hasProfile" = true
    ${
      serviceType
        ? `AND wp."services" @> ARRAY['${serviceType}']::"ServiceType"[]`
        : ""
    }
    ${
      serviceArea
        ? `AND wp."serviceAreas" @> ARRAY['${serviceArea}']::"Area"[]`
        : ""
    }
    ${search ? `AND wp."nickname" ILIKE '%${search}%'` : ""}
  `;

    const favoriteField = customerId
      ? `CASE 
        WHEN EXISTS (
          SELECT 1 FROM "Favorite" f 
          WHERE f."workerId" = u.id AND f."customerId" = '${customerId}'
        ) THEN true
        ELSE false
     END as "isFavorite"`
      : `false as "isFavorite"`;

    const imageUrlPrefix = `${BASE_URL}/static`;

    const list = await prisma.$queryRawUnsafe(`
      SELECT 
        u.id as "workerId",
        CASE 
  WHEN wp."profileImage" IS NULL THEN NULL
  ELSE CONCAT('${imageUrlPrefix}', '/', split_part(wp."profileImage", '/', array_length(string_to_array(wp."profileImage", '/'), 1)))
END AS "profileImage",
        wp."experience",
        wp."nickname",
        wp."services",
        wp."serviceAreas",
        wp."summary",
        count(distinct r.id)::int as "reviewsCount",
        count(distinct f.id)::int as "favoritesCount",
        coalesce(avg(r.star), 0)::float as "reviewsAverage",
        count(distinct CASE 
          WHEN e."isConfirmed" = true AND e."movingDate" < NOW() 
          THEN e.id 
        END)::int as "confirmedEstimateCount",
        ${favoriteField}
      FROM "User" u 
      LEFT JOIN "WorkerProfile" wp ON u.id = wp."workerId" 
      LEFT JOIN "Review" r ON u.id = r."workerId" 
      LEFT JOIN "Favorite" f ON f."workerId" = u.id 
      LEFT JOIN "Estimate" e ON u.id = e."workerId" 
      WHERE ${where}
      GROUP BY u.id, wp."profileImage", wp."experience", wp."nickname", wp."services", wp."serviceAreas",wp."summary"
      ORDER BY ${order}
      LIMIT ${limit}
      OFFSET ${offset};
    `);

    const totalCountResult = await prisma.$queryRawUnsafe<{ count: number }[]>(`
      SELECT COUNT(*)::int as count FROM (
        SELECT 
          u.id
          FROM "User" u 
          LEFT JOIN "WorkerProfile" wp ON u.id = wp."workerId" 
          LEFT JOIN "Review" r ON u.id = r."workerId" 
          LEFT JOIN "Favorite" f ON f."workerId" = u.id 
          LEFT JOIN "Estimate" e ON u.id = e."workerId" 
          WHERE ${where}
          GROUP BY u.id, wp."profileImage", wp."experience", wp."nickname", wp."services", wp."serviceAreas"
      ) AS subquery;
    `);

    const totalCount = totalCountResult[0]?.count ?? 0;

    return { list, totalCount };
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
