import { ServiceType } from "@prisma/client";
import { RequestHandler } from "express";
import { z } from "zod";

export const estimateRequestSchema = z.object({
  movingType: z.nativeEnum(ServiceType),
  movingDate: z.coerce.date(),
  departure: z.string().min(1, "Departure is required"),
  destination: z.string().min(1, "Destination is required"),
});

const validateEstimateRequset: RequestHandler = (req, res, next) => {
  try {
    const { movingType, movingDate, departure, destination } = req.body;
    const parsedContext = estimateRequestSchema.safeParse({
      movingType,
      movingDate,
      departure,
      destination,
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

export { validateEstimateRequset };
