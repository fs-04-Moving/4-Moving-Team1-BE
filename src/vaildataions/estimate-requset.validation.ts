import { Area, ServiceType } from "@prisma/client";
import { RequestHandler } from "express";
import { z } from "zod";

export const estimateRequestSchema = z.object({
  serviceType: z.nativeEnum(ServiceType),
  movingDate: z.coerce.date(),
  departureAddress: z.string().min(1, "Departure is required"),
  destination: z.string().min(1, "Destination is required"),
  departureArea: z.nativeEnum(Area),
});

const estimateRequestQuerySchema = z.object({
  orderBy: z.enum(["earliestMove", "earliestRequest"] as const).optional(),
  serviceType: z.array(z.nativeEnum(ServiceType)).optional(),
  filter: z.array(z.enum(["area", "assigned"] as const)).optional(),
  search: z.string().optional(),
});

export type EstimateRequestQuery = z.infer<typeof estimateRequestQuerySchema>;

const validateEstimateRequset: RequestHandler = (req, res, next) => {
  try {
    const {
      serviceType,
      movingDate,
      departureAddress,
      destination,
      departureArea,
    } = req.body;
    const parsedContext = estimateRequestSchema.safeParse({
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
  } catch (e) {
    next(e);
  }
};

const validateEstimateRequsetQuery: RequestHandler = (req, res, next) => {
  try {
    const { orderBy, serviceType, filter, search } = req.query as {
      orderBy: string;
      serviceType: string;
      filter: string;
      search: string;
    };
    const parsedContext = estimateRequestQuerySchema.safeParse({
      orderBy,
      serviceType: serviceType
        ? serviceType.split(",").map((s) => s.trim())
        : undefined,
      filter: filter ? filter.split(",").map((f) => f.trim()) : undefined,
      search,
    });
    if (!parsedContext.success) {
      throw new Error(`400/Validation error: ${parsedContext.error}`);
    }
    req.validateQuery = parsedContext.data;
    next();
  } catch (e) {
    next(e);
  }
};

export { validateEstimateRequset, validateEstimateRequsetQuery };
