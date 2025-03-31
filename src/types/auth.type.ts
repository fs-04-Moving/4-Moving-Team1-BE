import { ROLE } from "@prisma/client";

type payloadData = {
  id: string;
  email: string;
  name: string;
};

type logInDto = {
  email: string;
  password: string;
  role: ROLE;
};

type signUpDto = logInDto & {
  name: string;
  phoneNumber: string;
};

export { payloadData, logInDto, signUpDto };
