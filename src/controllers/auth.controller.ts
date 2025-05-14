import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import authService from "../services/auth.service";

// 로그인 컨트롤러
const logInController: RequestHandler = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;
  const logInDto = { email, password, role };

  try {
    const { sub, accessToken, refreshToken } = await authService.logIn(
      logInDto
    );
    req.userId = sub;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // prod에서는 true로 변경
      sameSite: "strict",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
    });
    // sameSite:none secure:ture
    // 백엔드랑 프론트엔드 ip
    // secure:ture -> https // http
    // 백엔드 도메인입히고 SSL 인증서 받아서
    //

    res.status(200).send({ accessToken });
  } catch (e) {
    // 소셜 가입자 충돌 처리
    if (typeof e === "object" && e && "errorCode" in e) {
      const { errorCode, data } = e as {
        errorCode: string;
        data?: Record<string, string>;
      };
      res.status(400).json({ errorCode, ...data });
    }
    // 일반 에러는 에러 미들웨어로
    throw e;
  }
});

// 회원가입 컨트롤러
const signUpController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { email, password, name, phoneNumber, role } = req.body;
    const signUpDto = { email, password, name, phoneNumber, role };

    try {
      const result = await authService.signUp(signUpDto);
      res.status(200).send({ result });
    } catch (e) {
      if (typeof e === "object" && e && "errorCode" in e) {
        const { errorCode, data } = e as {
          errorCode: string;
          data?: Record<string, string>;
        };
        res.status(400).json({ errorCode, ...data });
      }
      throw e;
    }
  }
);

// 리프레쉬 토큰 컨트롤러
const refreshTokenController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new Error("401/No refresh token");

    const { accessToken } = await authService.refreshToken(refreshToken);

    res.status(200).send({ accessToken });
  }
);

const logOutController: RequestHandler = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.clearCookie("accessToken", {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.status(200).send({ message: "로그아웃 완료" });
};

const auth = {
  logInController,
  signUpController,
  refreshTokenController,
  logOutController,
};

export default auth;
