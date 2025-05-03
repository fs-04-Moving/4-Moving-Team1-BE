import { ROLE } from '@prisma/client';
import { RequestHandler } from 'express';
import authService from '../services/auth.service';
import {
  exchangeCodeForToken,
  getNaverAuthURL,
  getNaverUser,
} from '../services/naver.service';

const naverLoginRedirect: RequestHandler = (req, res) => {
  const state = req.query.state as string; // csrfToken, role 포함
  const [csrfToken] = state.split('|');

  res.cookie('oauth_csrf_token', csrfToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 5 * 60 * 1000,
  });

  const url = getNaverAuthURL(state);
  res.redirect(url);
};

const naverCallback: RequestHandler = async (req, res) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string;
    const [csrfTokenFromState, roleFromState] = state.split('|');
    const csrfTokenStored = req.cookies['oauth_csrf_token'];

    if (!csrfTokenFromState || csrfTokenFromState !== csrfTokenStored) {
      return res.redirect(
        'http://localhost:3000/auth/callback?errorCode=INVALID_OAUTH_STATE'
      );
    }

    const { access_token } = await exchangeCodeForToken(code, state);
    const naverUser = await getNaverUser(access_token);

    const user = await authService.findOrCreateOAuthUser({
      email: naverUser.email,
      name: naverUser.name,
      profileImage: naverUser.profile_image,
      provider: 'naver',
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
  naverLoginRedirect,
  naverCallback,
};
