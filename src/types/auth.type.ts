import { ROLE } from "@prisma/client";

type PayloadData = {
  id: string;
  email: string;
  name: string;
  role: ROLE;
  hasProfile: boolean;
  hasRequest: boolean;
  profileImage?: string; // 추가(조형민)
};

type LogInDto = {
  email: string;
  password: string;
  role: ROLE;
};

type SignUpDto = LogInDto & {
  name: string;
  phoneNumber: string;
};

type UpdateUserDto = {
  userId: string;
  email: string;
  password: string;
  newPassword: string;
  name: string;
  phoneNumber: string;
};

export { LogInDto, PayloadData, SignUpDto, UpdateUserDto };
