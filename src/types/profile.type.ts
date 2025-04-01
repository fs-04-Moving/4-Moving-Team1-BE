import { Area, ServiceType } from "@prisma/client";

type UserProfileDto = {
  profileImage: string | null;
  livingArea: Area;
  services: ServiceType[];
  userId: string;
};

type WorkerProfileDto = {
  profileImage: string | null;
  nickname: string;
  experience: number;
  summary: string;
  description: string;
  services: ServiceType[];
  serviceAreas: Area[];
  userId: string;
};

export { UserProfileDto, WorkerProfileDto };
