import { Area, ServiceType } from "@prisma/client";

type CustomerProfileDto = {
  profileImage: string | null;
  livingArea: Area;
  services: ServiceType[];
  customerId: string;
};

type WorkerProfileDto = {
  profileImage: string | null;
  nickname: string;
  experience: number;
  summary: string;
  description: string;
  services: ServiceType[];
  serviceAreas: Area[];
  workerId: string;
};

type profileOrderBy =
  | "mostReview"
  | "highestRated"
  | "mostExperience"
  | "mostConfirmed";

export { CustomerProfileDto, WorkerProfileDto, profileOrderBy };
