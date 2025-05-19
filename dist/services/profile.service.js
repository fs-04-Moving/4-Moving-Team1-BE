"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../db/prisma/client"));
const app_1 = require("../app");
const auth_service_1 = __importDefault(require("./auth.service"));
// 유저 프로필 생성
const createCustomerProfile = (customerProfileDto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId } = customerProfileDto;
        const existingProfile = yield client_1.default.customerProfile.findFirst({
            where: { customerId },
        });
        if (existingProfile) {
            throw new Error("400/profile already exist");
        }
        yield client_1.default.customerProfile.create({
            data: customerProfileDto,
        });
        return;
    }
    catch (e) {
        throw e;
    }
});
// 기사 프로필 생성
const createWorkerProfile = (workerProfileDto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workerId } = workerProfileDto;
        const existingProfile = yield client_1.default.workerProfile.findFirst({
            where: { workerId },
        });
        if (existingProfile) {
            throw new Error("400/profile already exist");
        }
        yield client_1.default.workerProfile.create({
            data: workerProfileDto,
        });
        return;
    }
    catch (e) {
        throw e;
    }
});
// 프로필 상태 업데이트 - 유저가 프로필을 만들었는지 확인해서 true/false 값, 토큰들 새로 발급급
const updateUserProfileStatus = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client_1.default.user.findFirstOrThrow({
            where: { id: userId },
        });
        const user = yield client_1.default.user.update({
            where: { id: userId },
            data: { hasProfile: true },
            include: {
                workProfile: { select: { profileImage: true } },
                customerProfile: { select: { profileImage: true } },
            },
        });
        return auth_service_1.default.createTokenByUserData(user);
    }
    catch (e) {
        throw e;
    }
});
// 유저 프로필 업데이트
const updateCustomerProfile = (customerProfileDto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId } = customerProfileDto;
        if (!customerId)
            throw new Error("401/customerId not exist");
        const existingProfile = yield client_1.default.customerProfile.findFirst({
            where: { customerId },
        });
        if (!existingProfile) {
            throw new Error("400/profile not exist");
        }
        yield client_1.default.customerProfile.update({
            where: { customerId },
            data: customerProfileDto,
        });
        const user = yield client_1.default.user.findFirst({
            where: { id: customerId },
            include: {
                workProfile: { select: { profileImage: true } },
                customerProfile: { select: { profileImage: true } },
            },
        });
        if (!user)
            throw new Error("400/user not found");
        return auth_service_1.default.createTokenByUserData(user);
    }
    catch (e) {
        throw e;
    }
});
// 기사 프로필 업데이트트
const updateWorkerProfile = (workerProfileDto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workerId } = workerProfileDto;
        if (!workerId)
            throw new Error("401/userId not exist");
        const existingProfile = yield client_1.default.workerProfile.findFirst({
            where: { workerId: workerId },
        });
        if (!existingProfile) {
            throw new Error("400/profile not exist");
        }
        yield client_1.default.workerProfile.update({
            where: { workerId: workerId },
            data: workerProfileDto,
        });
        const user = yield client_1.default.user.findFirst({
            where: { id: workerId },
            include: {
                workProfile: { select: { profileImage: true } },
                customerProfile: { select: { profileImage: true } },
            },
        });
        if (!user)
            throw new Error("400/user not found");
        return auth_service_1.default.createTokenByUserData(user);
    }
    catch (e) {
        throw e;
    }
});
// 기사 유저의 profile 가져오기
// profileImage: string;
// summary: string;
// nickname: string;
// favoritesCount: number;
// reviewsCount: number;
// rating: number;
// experience: number;
// confirmedEstimatesCount: number;
const getWorkerProfile = (workerId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const now = new Date();
    try {
        const worker = yield client_1.default.user.findFirst({
            where: { id: workerId },
            include: {
                _count: { select: { workerFavorites: true, receivedReviews: true } },
                workProfile: {
                    select: {
                        profileImage: true,
                        nickname: true,
                        summary: true,
                        experience: true,
                        services: true,
                        serviceAreas: true,
                        description: true,
                    },
                },
            },
        });
        if (!worker)
            throw new Error("400/worker not found");
        if (!worker.workProfile)
            throw new Error("400/worker profile not found");
        const avgStar = yield client_1.default.review.aggregate({
            where: { workerId },
            _avg: { star: true },
        });
        const confirmedEstimatesCount = yield client_1.default.estimate.count({
            where: {
                workerId,
                isConfirmed: true,
                movingDate: { lt: now },
            },
        });
        return {
            profileImage: worker.workProfile.profileImage
                ? `${app_1.BASE_URL}/static/${worker.workProfile.profileImage
                    .split("/")
                    .pop()}`
                : null,
            summary: worker.workProfile.summary,
            nickname: worker.workProfile.nickname,
            experience: worker.workProfile.experience,
            favoritesCount: worker._count.workerFavorites || 0,
            reviewsCount: worker._count.receivedReviews || 0,
            reviewsAverage: (_a = avgStar._avg.star) !== null && _a !== void 0 ? _a : null,
            confirmedEstimatesCount: confirmedEstimatesCount || 0,
            serviceType: worker.workProfile.services,
            serviceArea: worker.workProfile.serviceAreas,
            description: worker.workProfile.description,
        };
    }
    catch (e) {
        throw e;
    }
});
const getWorkerServiceArea = (workerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const serviceAreas = yield client_1.default.workerProfile.findFirst({
            where: { workerId },
            select: { serviceAreas: true },
        });
        if (!serviceAreas)
            throw new Error("400/worker profile not found");
        return serviceAreas.serviceAreas;
    }
    catch (e) {
        throw e;
    }
});
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
const getWorkerProfiles = (_a) => __awaiter(void 0, [_a], void 0, function* ({ orderBy, serviceType, serviceArea, page, pageSize, search, customerId, }) {
    var _b, _c;
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
                order = '"confirmedEstimatesCount" DESC';
                break;
            default:
                order = '"reviewsCount" DESC';
        }
        const orderClause = `${order}, u.id ASC`;
        const where = `
    u.role = 'worker' AND u."hasProfile" = true
    ${serviceType
            ? `AND wp."services" @> ARRAY['${serviceType}']::"ServiceType"[]`
            : ""}
    ${serviceArea
            ? `AND wp."serviceAreas" @> ARRAY['${serviceArea}']::"Area"[]`
            : ""}
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
        const imageUrlPrefix = `${app_1.BASE_URL}/static`;
        const list = yield client_1.default.$queryRawUnsafe(`
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
        END)::int as "confirmedEstimatesCount",
        ${favoriteField}
      FROM "User" u 
      LEFT JOIN "WorkerProfile" wp ON u.id = wp."workerId" 
      LEFT JOIN "Review" r ON u.id = r."workerId" 
      LEFT JOIN "Favorite" f ON f."workerId" = u.id 
      LEFT JOIN "Estimate" e ON u.id = e."workerId" 
      WHERE ${where}
      GROUP BY u.id, wp."profileImage", wp."experience", wp."nickname", wp."services", wp."serviceAreas",wp."summary"
      ORDER BY ${orderClause}
      LIMIT ${limit}
      OFFSET ${offset};
    `);
        const totalCountResult = yield client_1.default.$queryRawUnsafe(`
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
        const totalCount = (_c = (_b = totalCountResult[0]) === null || _b === void 0 ? void 0 : _b.count) !== null && _c !== void 0 ? _c : 0;
        return { list, totalCount };
    }
    catch (e) {
        throw e;
    }
});
const getnickname = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const worker = yield client_1.default.workerProfile.findFirst({
            where: { workerId: userId },
            select: { nickname: true },
        });
        if (!worker)
            throw new Error("400/worker not found");
        return worker;
    }
    catch (e) {
        throw e;
    }
});
const getWorkerProfileMe = (workerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workerProfile = yield client_1.default.workerProfile.findFirst({
            where: {
                workerId,
            },
        });
        if (!workerProfile)
            throw new Error("400/worker profile not found");
        return workerProfile;
    }
    catch (e) {
        throw e;
    }
});
const getCustomerProfileMe = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerProfile = yield client_1.default.customerProfile.findFirst({
            where: {
                customerId,
            },
        });
        if (!customerProfile)
            throw new Error("400/customer profile not found");
        return customerProfile;
    }
    catch (e) {
        throw e;
    }
});
const profileService = {
    createCustomerProfile,
    createWorkerProfile,
    updateUserProfileStatus,
    updateCustomerProfile,
    updateWorkerProfile,
    getWorkerProfile,
    getWorkerServiceArea,
    getWorkerProfiles,
    getnickname,
    getWorkerProfileMe,
    getCustomerProfileMe,
};
exports.default = profileService;
