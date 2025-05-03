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

export default { kakaoLoginRedirect, kakaoCallback };
