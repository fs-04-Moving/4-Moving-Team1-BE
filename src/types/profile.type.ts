import { Area, ServiceType } from "@prisma/client";

type UserProfile = {
  profileImage: string | null;
  livingArea: Area;
  services: ServiceType[];
  userId: string;
};

type workerProfile = {
  profileImage: string | null;
  nickname: string;
  experience: number;
  summary: string;
  description: string;
  services: ServiceType[];
  serviceAreas: Area[];
  userId: string;
};

export { UserProfile, workerProfile };
