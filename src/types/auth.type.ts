type payloadData = {
  id: string;
  email: string;
  name: string;
};

type logInDto = {
  email: string;
  password: string;
};

type signUpDto = logInDto & {
  name: string;
  phoneNumber: string;
};

export { payloadData, logInDto, signUpDto };
