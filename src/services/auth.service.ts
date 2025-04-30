import { ROLE, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { BASE_URL } from '../app';
import prisma from '../db/prisma/client';
import { LogInDto, PayloadData, SignUpDto } from '../types/auth.type';

const jwtSecretKey = process.env.JWT_SECRET_KEY;

if (!jwtSecretKey) {
  throw new Error('jwtSerectKey is not exist');
}

// 토큰 생성 함수
export const createToken = (data: PayloadData) => {
  try {
    const payload = {
      sub: data.id,
      email: data.email,
      role: data.role,
      hasProfile: data.hasProfile,
      hasRequest: data.hasRequest,
      name: data.name, // 추가(조형민)
      ...(data.profileImage && {
        profileImage: `${BASE_URL}/static/${data.profileImage
          .split('/')
          .pop()}`,
      }), // 추가(조형민)
    };

    const accessToken = jwt.sign(payload, jwtSecretKey, {
      expiresIn: '2h',
    });

    const refreshToken = jwt.sign(payload, jwtSecretKey, {
      expiresIn: '5d',
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
      throw new Error('400/Incorrect password');
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
        include: {
          customerProfile: true,
          workProfile: true,
        },
      });
      if (!user) throw new Error('400/유저가 존재하지 않습니다.');
      const profileImage =
        user.customerProfile?.profileImage ?? user.workProfile?.profileImage;

      await checkPassword(password, user.encryptedPassword);

      const data: PayloadData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasProfile: user.hasProfile,
        hasRequest: user.hasRequest,
        profileImage: profileImage
          ? `${BASE_URL}/static/${profileImage.split('/').pop()}`
          : undefined, // 추가(조형민)
      };

      const { accessToken, refreshToken } = createToken(data);
      const { sub } = jwt.verify(accessToken, jwtSecretKey);

      if (typeof sub !== 'string') {
        throw new Error('400/sub is not string');
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
      if (isExistingEmail) throw new Error('400/이미 존재하는 이메일입니다.');
      const newUser = await prisma.user.create({
        data: { email, name, encryptedPassword, phoneNumber, role },
      });

      return { id: newUser.id, email: newUser.email };
    });

    return result;
  } catch (e) {
    throw e;
  }
};

// 리프레쉬 토큰 함수
const refreshToken = async (refreshToken: string) => {
  const { sub, email, name, hasProfile, role, profileImage, hasRequest } =
    jwt.verify(refreshToken, jwtSecretKey) as jwt.JwtPayload;
  if (typeof sub !== 'string') {
    throw new Error('400/sub is not string');
  }
  const data: PayloadData = {
    id: sub,
    email,
    name,
    hasProfile,
    hasRequest,
    role,
    profileImage:
      typeof profileImage === 'string'
        ? `${BASE_URL}/static/${profileImage.split('/').pop()}`
        : undefined,
  };
  const { accessToken } = createToken(data);
  return { accessToken };
};

// 토큰 업데이트
const createTokenByUserData = (user: {
  id: string;
  email: string;
  name: string;
  role: ROLE;
  hasProfile: boolean;
  hasRequest: boolean;
  customerProfile?: { profileImage?: string | null } | null;
  workProfile?: { profileImage?: string | null } | null;
}) => {
  const profileImage =
    user.role === 'customer'
      ? typeof user.customerProfile?.profileImage === 'string'
        ? `${BASE_URL}/static/${user.customerProfile.profileImage
            .split('/')
            .pop()}`
        : undefined
      : user.role === 'worker'
      ? typeof user.workProfile?.profileImage === 'string'
        ? `${BASE_URL}/static/${user.workProfile.profileImage.split('/').pop()}`
        : undefined
      : undefined;

  const data: PayloadData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    hasProfile: user.hasProfile,
    profileImage,
    hasRequest: user.hasRequest,
  };

  const { accessToken, refreshToken } = createToken(data);
  return { accessToken, refreshToken };
};

// 소셜 사용자 처리
const findOrCreateOAuthUser = async ({
  email,
  name,
  profileImage,
  provider,
}: {
  email: string;
  name: string;
  profileImage?: string;
  provider: 'google' | 'kakao' | 'naver';
}): Promise<User> => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      customerProfile: true,
      workProfile: true,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  // encryptedPassword가 필수이므로 dummy를 만들어서 넣음
  const dummyPassword = 'social_login_dummy_password';
  const encryptedPassword = await bcrypt.hash(dummyPassword, 12);

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      provider,
      role: 'customer',
      hasProfile: false,
      hasRequest: false,
      encryptedPassword,
    },
    include: {
      customerProfile: true,
      workProfile: true,
    },
  });

  if (!newUser) {
    throw new Error('유저 생성 실패');
  }

  return newUser;
};

const authService = {
  logIn,
  signUp,
  refreshToken,
  createTokenByUserData,
  findOrCreateOAuthUser,
};

export default authService;
