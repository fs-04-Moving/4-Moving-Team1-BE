import { Area, ServiceType } from "@prisma/client";

type EstimateRequstDto = {
  customerId: string;
  serviceType: ServiceType;
  movingDate: Date;
  departureAddress: string;
  destination: string;
  departureArea: Area;
};

type EstimateRequestOrderBy = "earliestMove" | "earliestRequest";

export { EstimateRequstDto, EstimateRequestOrderBy };
