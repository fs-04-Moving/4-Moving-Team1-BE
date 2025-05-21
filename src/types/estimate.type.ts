import { EstimateStatus } from "@prisma/client";

type EstimateDto = {
  workerId: string;
  customerId: string;
  status: EstimateStatus;
  price?: number;
  comment?: string;
};

export { EstimateDto };
