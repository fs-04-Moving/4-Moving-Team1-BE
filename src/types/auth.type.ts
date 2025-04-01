import { ROLE } from "@prisma/client";

type PayloadData = {
  id: string;
  email: string;
  name: string;
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

export { PayloadData, LogInDto, SignUpDto };
