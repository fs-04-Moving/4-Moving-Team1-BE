import { Area, ServiceType } from "@prisma/client";

type userProfile = {
  profileImage: string;
  livingArea: Area;
  services: ServiceType[];
  userId: string;
};
