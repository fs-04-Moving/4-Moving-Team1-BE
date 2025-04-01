import { Area, ServiceType } from "@prisma/client";
import { RequestHandler } from "express";
import { string, z } from "zod";

const userProfileSchema = z.object({
  livingArea: z.nativeEnum(Area),
  services: z.array(z.nativeEnum(ServiceType)), // 특정 eunm 값만 들어갈수있음 소형이사, 가정이사,
});

const workerProfileSchema = z.object({
  nickname: z.string(),
  experience: z.number().min(0),
  summary: z.string(),
  description: z.string(),
  services: z.array(z.nativeEnum(ServiceType)),
  serviceAreas: z.array(z.nativeEnum(Area)),
});

const validateUserProfileContext: RequestHandler = (req, res, next) => {
  try {
    let { livingArea, services } = req.body;

    if (typeof services === "string") services = services.split(",");

    const parsedContext = userProfileSchema.safeParse({
      livingArea,
      services,
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

const validateWorkerProfileContext: RequestHandler = (req, res, next) => {
  try {
    let { nickname, experience, summary, description, services, serviceAreas } =
      req.body;

    if (typeof services === "string") services = services.split(",");
    if (typeof serviceAreas === "string")
      serviceAreas = serviceAreas.split(",");

    const parsedContext = workerProfileSchema.safeParse({
      nickname,
      experience: Number(experience),
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
  } catch (e) {
    next(e);
  }
};

export { validateUserProfileContext, validateWorkerProfileContext };
