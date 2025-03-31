import { RequestHandler } from "express";
import { asyncHandler } from "../middlewear/error.middleware";
import authService from "../servieces/auth.service";

const logInController: RequestHandler = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const logInDto = { email, password };
  const { sub, accessToken, refreshToken } = await authService.logIn(logInDto);
  req.userId = sub;
  res.status(200).send({ accessToken, refreshToken });
});

const signUpController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { email, password, name, phoneNumber } = req.body;
    const signUpDto = { email, password, name, phoneNumber };
    const { sub, accessToken, refreshToken } = await authService.signUp(
      signUpDto
    );
    req.userId = sub;
    res.status(200).send({ accessToken, refreshToken });
  }
);

const refreshTokenController: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { refreshToken } = req.body;

    const accessToken = await authService.refreshToken(refreshToken);

    res.status(200).send(accessToken);
  }
);

const auth = { logInController, signUpController, refreshTokenController };

export default auth;
