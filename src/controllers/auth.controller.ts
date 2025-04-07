import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import authService from "../servieces/auth.service";
import userService from "../servieces/user.service";

// 로그인 컨트롤러
const logInController: RequestHandler = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;
  const logInDto = { email, password, role };
  const { sub, accessToken, refreshToken } = await authService.logIn(logInDto);
  const { hasProfile } = await userService.getUserMe(sub);
  req.userId = sub;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: false,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
  });

  res.status(200).send({ accessToken, hasProfile, role });
});

// 회원가입 컨트롤러
const signUpController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { email, password, name, phoneNumber, role } = req.body;
    const signUpDto = { email, password, name, phoneNumber, role };
    const { sub, accessToken, refreshToken } = await authService.signUp(
      signUpDto
    );
    req.userId = sub;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: false,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    });
    res.status(200).send({ accessToken });
  }
);

// 리프레쉬 토큰 컨트롤러
const refreshTokenController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new Error("401/No refresh token");

    const accessToken = await authService.refreshToken(refreshToken);

    res.status(200).send({ accessToken });
  }
);

const auth = { logInController, signUpController, refreshTokenController };

export default auth;
