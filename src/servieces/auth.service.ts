import prisma from "../db/prisma/client";
import { LogInDto, PayloadData, SignUpDto } from "../types/auth.type";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import user from "../controllers/user.controller";

const jwtSecretKey = process.env.JWT_SECRET_KEY;

if (!jwtSecretKey) {
  throw new Error("jwtSerectKey is not exist");
}

// 토큰 생성 함수
const createToken = (data: PayloadData) => {
  try {
    const payload = {
      sub: data.id,
      email: data.email,
      role: data.role,
      hasProfile: data.hasProfile,
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
    throw e;
  }
};

// 비밀번호가 암호화된(DB에 저장된) 비밀번호와 같은지 확인하는 함수
export const checkPassword = async (
  password: string,
  encryptedPassword: string
) => {
  try {
    const checkPassword = await bcrypt.compare(password, encryptedPassword);
    if (!checkPassword) {
      throw new Error("400/Incorrect password");
    }
  } catch (e) {
    throw e;
  }
};

// 로그인 함수
const logIn = async (logInDto: LogInDto) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const { email, password, role } = logInDto;
      const user = await prisma.user.findUnique({
        where: { email, role },
      });
      if (!user) throw new Error("400/유저가 존재하지 않습니다.");

      await checkPassword(password, user.encryptedPassword);

      const data: PayloadData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasProfile: user.hasProfile,
      };

      const { accessToken, refreshToken } = createToken(data);
      const { sub } = jwt.verify(accessToken, jwtSecretKey);

      if (typeof sub !== "string") {
        throw new Error("400/sub is not string");
      }

      return {
        sub,
        accessToken,
        refreshToken,
      };
    });
    return result;
  } catch (e) {
    throw e;
  }
};

// 회원가입 함수
const signUp = async (signUpDto: SignUpDto) => {
  try {
    const { email, password, name, phoneNumber, role } = signUpDto;
    const encryptedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (prisma) => {
      const isExistingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (isExistingEmail) throw new Error("400/이미 존재하는 이메일입니다.");
      const newUser = await prisma.user.create({
        data: { email, name, encryptedPassword, phoneNumber, role },
      });

      const data: PayloadData = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        hasProfile: newUser.hasProfile,
        role: newUser.role,
      };
      const { accessToken, refreshToken } = createToken(data);
      const { sub } = jwt.verify(accessToken, jwtSecretKey);

      if (typeof sub !== "string") {
        throw new Error("400/sub is not string");
      }
      return { sub, accessToken, refreshToken };
    });

    return result;
  } catch (e) {
    throw e;
  }
};

// 리프레쉬 토큰 함수
const refreshToken = async (refreshToken: string) => {
  const { sub, email, name, hasProfile, role } = jwt.verify(
    refreshToken,
    jwtSecretKey
  ) as jwt.JwtPayload;
  if (typeof sub !== "string") {
    throw new Error("400/sub is not string");
  }
  const data: PayloadData = {
    id: sub,
    email,
    name,
    hasProfile,
    role,
  };
  const { accessToken } = createToken(data);
  return { accessToken };
};

const authService = { logIn, signUp, refreshToken };

export default authService;
