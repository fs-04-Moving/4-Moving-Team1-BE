import { RequestHandler } from 'express';
import authService from '../services/auth.service';
import {
  exchangeCodeForToken,
  getKakaoAuthURL,
  getKakaoUser,
} from '../services/kakao.service';
import { decodeState, encodeState } from '../utils/oauth/oauthState';

const kakaoLoginRedirect: RequestHandler = (req, res) => {
  const { role } = req.query;
  const state = encodeState({ role });
  const url = getKakaoAuthURL(state);
  res.redirect(url);
};

const kakaoCallback: RequestHandler = async (req, res) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string;
    const { role } = decodeState(state);

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

    res.redirect('http://localhost:3000/auth/callback');
  } catch (e) {
    const message =
      e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
    res.redirect(
      `http://localhost:3000/auth/callback?error=${encodeURIComponent(message)}`
    );
  }
};

export default { kakaoLoginRedirect, kakaoCallback };
