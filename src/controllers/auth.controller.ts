import { RequestHandler } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import authService from "../servieces/auth.service";

// 로그인 컨트롤러
const logInController: RequestHandler = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;
  const logInDto = { email, password, role };
  const { sub, accessToken, refreshToken } = await authService.logIn(logInDto);
  req.userId = sub;
  res.status(200).send({ accessToken, refreshToken });
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
    res.status(200).send({ accessToken, refreshToken });
  }
);

// 리프레쉬 토큰 컨트롤러
const refreshTokenController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { refreshToken } = req.body;

    const accessToken = await authService.refreshToken(refreshToken);

    res.status(200).send(accessToken);
  }
);

const auth = { logInController, signUpController, refreshTokenController };

export default auth;
