import { ServiceType } from "@prisma/client";

type EstimateRequstDto = {
  customerId: string;
  movingType: ServiceType;
  movingDate: Date;
  departure: string;
  destination: string;
};

export { EstimateRequstDto };
