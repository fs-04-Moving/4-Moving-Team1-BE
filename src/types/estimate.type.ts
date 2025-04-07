import { EstimateStatus } from "@prisma/client";

type EstimateDto = {
  workerId: string;
  customerId: string;
  status: EstimateStatus;
  price?: number;
};

export { EstimateDto };
