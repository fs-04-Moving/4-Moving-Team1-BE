"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEstimateRequsetQuery = exports.validateEstimateRequset = exports.estimateRequestSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.estimateRequestSchema = zod_1.z.object({
    serviceType: zod_1.z.nativeEnum(client_1.ServiceType),
    movingDate: zod_1.z.coerce.date(),
    departureAddress: zod_1.z.string().min(1, "Departure is required"),
    destination: zod_1.z.string().min(1, "Destination is required"),
    departureArea: zod_1.z.nativeEnum(client_1.Area),
});
const estimateRequestQuerySchema = zod_1.z.object({
    orderBy: zod_1.z.enum(["earliestMove", "earliestRequest"]).optional(),
    serviceType: zod_1.z.array(zod_1.z.nativeEnum(client_1.ServiceType)).optional(),
    filter: zod_1.z.array(zod_1.z.enum(["area", "assigned"])).optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.number().min(0),
    pageSize: zod_1.z.number().min(0),
});
const validateEstimateRequset = (req, res, next) => {
    try {
        const { serviceType, movingDate, departureAddress, destination, departureArea, } = req.body;
        const parsedContext = exports.estimateRequestSchema.safeParse({
            serviceType,
            movingDate,
            departureAddress,
            destination,
            departureArea,
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
exports.validateEstimateRequset = validateEstimateRequset;
const validateEstimateRequsetQuery = (req, res, next) => {
    try {
        const { orderBy, serviceType, filter, search, page, pageSize } = req.query;
        const parsedContext = estimateRequestQuerySchema.safeParse({
            orderBy,
            serviceType: serviceType
                ? serviceType.split(",").map((s) => s.trim())
                : undefined,
            filter: filter ? filter.split(",").map((f) => f.trim()) : undefined,
            search,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 10,
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
exports.validateEstimateRequsetQuery = validateEstimateRequsetQuery;
