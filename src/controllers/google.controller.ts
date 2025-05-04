// src/controllers/google.controller.ts
import { ROLE } from '@prisma/client';
import { RequestHandler } from 'express';
import authService from '../services/auth.service';
import {
  exchangeCodeForToken,
  getGoogleAuthURL,
  getGoogleUser,
} from '../services/google.service';

const googleLoginRedirect: RequestHandler = (req, res) => {
  const state = req.query.state as string; // csrfToken, role포함
  const [csrfToken] = state.split('|');
  // 백엔드 도메인 기준 쿠키 저장(googleCallback에서 검증할 때 사용)
  res.cookie('oauth_csrf_token', csrfToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax', // !!! strict로 하면 실패했음(외부 리다이렉트 흐름에서는 안 붙는다고?!?!)
    path: '/',
    maxAge: 5 * 60 * 1000,
  });

  const url = getGoogleAuthURL(state); // 구글 로그인 URL로 그대로 전달
  res.redirect(url);
};

const googleCallback: RequestHandler = async (req, res, next) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string; // csrfToken, role포함
    const [csrfTokenFromState, roleFromState] = state.split('|');
    const csrfTokenStored = req.cookies['oauth_csrf_token'];

    if (!csrfTokenFromState || csrfTokenFromState !== csrfTokenStored) {
      res.clearCookie('oauth_csrf_token', { path: '/' }); // 검증 실패 시에도 삭제
      return res.redirect(
        'http://localhost:3000/auth/callback?errorCode=INVALID_OAUTH_STATE'
      );
    }
    const { id_token, access_token } = await exchangeCodeForToken(code);
    const googleUser = await getGoogleUser(id_token, access_token);

    const user = await authService.findOrCreateOAuthUser({
      email: googleUser.email,
      name: googleUser.name,
      profileImage: googleUser.picture,
      provider: 'google',
      role: roleFromState as ROLE,
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

    res.clearCookie('oauth_csrf_token', { path: '/' }); // 성공 후에도 삭제

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
