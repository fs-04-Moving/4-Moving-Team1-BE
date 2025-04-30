// src/controllers/google.controller.ts
import { RequestHandler } from 'express';
import authService from '../services/auth.service';
import {
  exchangeCodeForToken,
  getGoogleAuthURL,
  getGoogleUser,
} from '../services/google.service';

const googleLoginRedirect: RequestHandler = (req, res) => {
  const url = getGoogleAuthURL();
  res.redirect(url);
};

const googleCallback: RequestHandler = async (req, res, next) => {
  try {
    const code = req.query.code as string;
    const { id_token, access_token } = await exchangeCodeForToken(code);
    const googleUser = await getGoogleUser(id_token, access_token);

    const user = await authService.findOrCreateOAuthUser({
      email: googleUser.email,
      name: googleUser.name,
      profileImage: googleUser.picture,
      provider: 'google',
    });

    if (!user) {
      res.status(500).send({ message: '유저 생성 또는 조회에 실패했습니다.' });
      return;
    }

    const { accessToken, refreshToken } =
      authService.createTokenByUserData(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
      maxAge: 1000 * 60 * 60,
    });

    res.redirect('http://localhost:3000/auth/callback'); // 프론트로 이동
  } catch (e) {
    next(e);
  }
};

export default {
  googleLoginRedirect,
  googleCallback,
};
