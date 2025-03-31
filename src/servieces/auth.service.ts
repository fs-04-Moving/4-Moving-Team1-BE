import prisma from "../db/prisma/client";
import { logInDto, payloadData, signUpDto } from "../types/auth.type";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const jwtSecretKey = process.env.JWT_SECRET_KEY;

if (!jwtSecretKey) {
  throw new Error("jwtSerectKey is not exist");
}

const createToken = (data: payloadData) => {
  try {
    const payload = {
      sub: data.id,
      email: data.email,
    };

    const accessToken = jwt.sign(payload, jwtSecretKey, {
      expiresIn: "2h",
    });

    const refreshToken = jwt.sign(payload, jwtSecretKey, {
      expiresIn: "5d",
    });

    return { accessToken, refreshToken };
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }
    throw new Error(String(e));
  }
};

const logIn = async (logInDto: logInDto) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const { email, password, role } = logInDto;
      const user = await prisma.user.findUnique({
        where: { email, role },
      });
      if (!user) throw new Error("400/유저가 존재하지 않습니다.");

      const checkPassword = await bcrypt.compare(
        password,
        user.encryptedPassword
      );
      if (!checkPassword) {
        throw new Error("400/Incorrect password");
      }

      const data = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      const { accessToken, refreshToken } = createToken(data);
      const { sub } = jwt.verify(accessToken, jwtSecretKey);

      if (typeof sub !== "string") {
        throw new Error("sub is not string");
      }

      return {
        sub,
        accessToken,
        refreshToken,
      };
    });
    return result;
  } catch (e) {
    throw new Error(String(e));
  }
};

const signUp = async (signUpDto: signUpDto) => {
  try {
    const { email, password, name, phoneNumber, role } = signUpDto;
    const encryptedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (prisma) => {
      const isExistingEmail = await prisma.user.findUnique({
        where: { email, role },
      });
      if (isExistingEmail) throw new Error("400/이미 존재하는 이메일입니다.");
      const newUser = await prisma.user.create({
        data: { email, name, encryptedPassword, phoneNumber, role },
      });

      const data = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      };
      const { accessToken, refreshToken } = createToken(data);
      const { sub } = jwt.verify(accessToken, jwtSecretKey);

      if (typeof sub !== "string") {
        throw new Error("sub is not string");
      }
      return { sub, accessToken, refreshToken };
    });

    return result;
  } catch (e) {
    throw new Error(String(e));
  }
};

const refreshToken = async (refreshToken: string) => {
  const { sub, email, name } = jwt.verify(
    refreshToken,
    jwtSecretKey
  ) as jwt.JwtPayload;
  if (typeof sub !== "string") {
    throw new Error("sub is not string");
  }
  const data: payloadData = {
    id: sub,
    email,
    name,
  };
  const { accessToken } = createToken(data);
  return { accessToken };
};

const authService = { logIn, signUp, refreshToken };

export default authService;
