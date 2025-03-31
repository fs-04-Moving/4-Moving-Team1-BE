import { RequestHandler } from "express";
import { z } from "zod";

const userProfileSchema = z.object({
  livingArea: z.string(),
  services: z.array(z.string()),
});

const workerProfileSchema = z.object({
  nickname: z.string(),
  experience: z.number().min(0),
  summary: z.string(),
  description: z.string(),
  services: z.array(z.string()),
  serviceAreas: z.array(z.string()),
});

const validateUserProfileContext: RequestHandler = (req, res, next) => {
  try {
    let { livingArea, services } = req.body;

    services = JSON.parse(services);

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

    services = JSON.parse(services);
    serviceAreas = JSON.parse(serviceAreas);

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
