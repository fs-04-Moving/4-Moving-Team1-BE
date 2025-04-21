"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGetWorkerProfilesQuery = exports.validateWorkerProfile = exports.validateCustomerProfile = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const customerProfileSchema = zod_1.z.object({
    livingArea: zod_1.z.nativeEnum(client_1.Area),
    services: zod_1.z.array(zod_1.z.nativeEnum(client_1.ServiceType)), // 특정 eunm 값만 들어갈수있음 소형이사, 가정이사,
});
const workerProfileSchema = zod_1.z.object({
    nickname: zod_1.z.string(),
    experience: zod_1.z.number().min(0),
    summary: zod_1.z.string(),
    description: zod_1.z.string(),
    services: zod_1.z.array(zod_1.z.nativeEnum(client_1.ServiceType)),
    serviceAreas: zod_1.z.array(zod_1.z.nativeEnum(client_1.Area)),
});
const getWorkerProfilesQuerySchema = zod_1.z.object({
    orderBy: zod_1.z
        .enum([
        "mostReview",
        "highestRated",
        "mostExperience",
        "mostConfirmed",
    ])
        .optional(),
    serviceType: zod_1.z.nativeEnum(client_1.ServiceType).optional(),
    serviceArea: zod_1.z.nativeEnum(client_1.Area).optional(),
    page: zod_1.z.number().min(0),
    pageSize: zod_1.z.number().min(0),
    search: zod_1.z.string().optional(),
});
const validateCustomerProfile = (isUpdate) => {
    return (req, res, next) => {
        try {
            let { livingArea, services } = req.body;
            if (typeof services === "string")
                services = services.split(",");
            const schema = isUpdate
                ? customerProfileSchema.partial()
                : customerProfileSchema;
            const parsedContext = schema.safeParse({
                livingArea,
                services,
            });
            if (!parsedContext.success) {
                throw new Error(`400/Validation error: ${parsedContext.error}`);
            }
            req.body = parsedContext.data;
            next();
        }
        catch (e) {
            next(e);
        }
    };
};
exports.validateCustomerProfile = validateCustomerProfile;
const validateWorkerProfile = (isUpdate) => {
    return (req, res, next) => {
        try {
            let { nickname, experience, summary, description, services, serviceAreas, } = req.body;
            if (typeof services === "string")
                services = services.split(",");
            if (typeof serviceAreas === "string")
                serviceAreas = serviceAreas.split(",");
            const schema = isUpdate
                ? workerProfileSchema.partial()
                : workerProfileSchema;
            experience = isNaN(Number(experience)) ? undefined : Number(experience);
            const parsedContext = schema.safeParse({
                nickname,
                experience,
                summary,
                description,
                services,
                serviceAreas,
            });
            if (!parsedContext.success) {
                throw new Error(`400/Validation error: ${parsedContext.error}`);
            }
            req.body = parsedContext.data;
            next();
        }
        catch (e) {
            next(e);
        }
    };
};
exports.validateWorkerProfile = validateWorkerProfile;
const validateGetWorkerProfilesQuery = (req, res, next) => {
    try {
        const { orderBy, serviceType, serviceArea, page, pageSize, search } = req.query;
        const parsedContext = getWorkerProfilesQuerySchema.safeParse({
            orderBy,
            serviceType,
            serviceArea,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 10,
            search,
        });
        if (!parsedContext.success) {
            throw new Error(`400/Validation error: ${parsedContext.error}`);
        }
        req.validateQuery = parsedContext.data;
        next();
    }
    catch (e) {
        next(e);
    }
};
exports.validateGetWorkerProfilesQuery = validateGetWorkerProfilesQuery;
