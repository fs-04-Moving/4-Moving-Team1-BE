// src/types/express.d.ts
import { EstimateRequest, ServiceType } from "@prisma/client";
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string | undefined;
      validateQuery?: EstimateRequestQuery;
    }
  }
}

export {};
