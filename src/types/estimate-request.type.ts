import { ServiceType } from "@prisma/client";

type EstimateRequstDto = {
  customerId: string;
  serviceType: ServiceType;
  movingDate: Date;
  departure: string;
  destination: string;
};

export { EstimateRequstDto };
