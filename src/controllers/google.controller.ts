// src/controllers/google.controller.ts
import { RequestHandler } from 'express';
import authService from '../services/auth.service';
import {
  exchangeCodeForToken,
  getGoogleAuthURL,
  getGoogleUser,
} from '../services/google.service';
import { decodeState, encodeState } from '../utils/oauth/oauthState';

const googleLoginRedirect: RequestHandler = (req, res) => {
  const { role } = req.query; // 회원 구분을 위한 role 추가
  const state = encodeState({ role }); // 안전하게 인코딩
  const url = getGoogleAuthURL(state);
  res.redirect(url);
};

const googleCallback: RequestHandler = async (req, res, next) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string;
    const { role } = decodeState(state); // role 정보를 받아서 디코딩
    const { id_token, access_token } = await exchangeCodeForToken(code);
    const googleUser = await getGoogleUser(id_token, access_token);

    const user = await authService.findOrCreateOAuthUser({
      email: googleUser.email,
      name: googleUser.name,
      profileImage: googleUser.picture,
      provider: 'google',
      role,
    });

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
    // 에러 발생 시 프론트로 메시지 전달
    if (typeof e === 'object' && e && 'errorCode' in e) {
      const { errorCode, data } = e as {
        errorCode: string;
        data?: Record<string, string>;
      };

      const query = new URLSearchParams({ errorCode, ...data }).toString();
      return res.redirect(`http://localhost:3000/auth/callback?${query}`);
    }

    // 예상치 못한 에러
    return res.redirect(
      `http://localhost:3000/auth/callback?errorCode=UNKNOWN_ERROR`
    );
  }
};

export default {
  googleLoginRedirect,
  googleCallback,
};
