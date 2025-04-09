// src/types/express.d.ts
import { EstimateRequest, ServiceType } from "@prisma/client";
import { Request } from "express";
import { EstimateRequestQuery } from "../validations/estimate-requset.validation";
import { GetWorkerProfilesQuery } from "../validations/profile.validation";
import { PaginationQuery } from "../validations/common.validation";

declare global {
  namespace Express {
    interface Request {
      userId?: string | undefined;
      validateQuery?:
        | EstimateRequestQuery
        | GetWorkerProfilesQuery
        | PaginationQuery;
    }
  }
}

export {};
