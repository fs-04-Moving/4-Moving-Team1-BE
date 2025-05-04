import { ROLE } from '@prisma/client';
import { RequestHandler } from 'express';
import authService from '../services/auth.service';
import {
  exchangeCodeForToken,
  getKakaoAuthURL,
  getKakaoUser,
} from '../services/kakao.service';

const kakaoLoginRedirect: RequestHandler = (req, res) => {
  const state = req.query.state as string; // csrfToken, role 포함
  const [csrfToken] = state.split('|');

  // 백엔드 도메인 기준 쿠키 저장 (콜백에서 검증용)
  res.cookie('oauth_csrf_token', csrfToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 5 * 60 * 1000,
  });

  const url = getKakaoAuthURL(state);
  res.redirect(url);
};

const kakaoCallback: RequestHandler = async (req, res) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string;
    const [csrfTokenFromState, roleFromState] = state.split('|');
    const csrfTokenStored = req.cookies['oauth_csrf_token'];

    if (!csrfTokenFromState || csrfTokenFromState !== csrfTokenStored) {
      res.clearCookie('oauth_csrf_token', { path: '/' }); // 검증 실패 시에도 삭제
      return res.redirect(
        'http://localhost:3000/auth/callback?errorCode=INVALID_OAUTH_STATE'
      );
    }

    const { access_token } = await exchangeCodeForToken(code);
    const kakaoProfile = await getKakaoUser(access_token);

    const kakaoAccount = kakaoProfile.kakao_account;
    const email = kakaoAccount.email;
    const name = kakaoAccount.profile.nickname;
    const profileImage = kakaoAccount.profile.profile_image_url;

    const user = await authService.findOrCreateOAuthUser({
      email,
      name,
      profileImage,
      provider: 'kakao',
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

    res.redirect('http://localhost:3000/auth/callback');
  } catch (e) {
    if (typeof e === 'object' && e && 'errorCode' in e) {
      const { errorCode, data } = e as {
        errorCode: string;
        data?: Record<string, string>;
      };

      const query = new URLSearchParams({ errorCode, ...data }).toString();
      return res.redirect(`http://localhost:3000/auth/callback?${query}`);
    }

    return res.redirect(
      `http://localhost:3000/auth/callback?errorCode=UNKNOWN_ERROR`
    );
  }
};

export default {
  kakaoLoginRedirect,
  kakaoCallback,
};
