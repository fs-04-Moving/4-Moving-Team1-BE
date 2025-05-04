import { RequestHandler } from 'express';
import {
  exchangeCodeForToken,
  getKakaoAuthURL,
  getKakaoUser,
} from '../services/kakao.service';
import {
  handleOAuthCallback,
  handleOAuthRedirect,
} from '../services/oauth.service';

const kakaoLoginRedirect: RequestHandler = (req, res) => {
  const state = req.query.state as string; // csrfToken, role 포함
  handleOAuthRedirect(state, getKakaoAuthURL, res);
};

const kakaoCallback: RequestHandler = async (req, res) => {
  await handleOAuthCallback(req, res, {
    name: 'kakao',
    exchangeCodeForToken,
    getUserInfo: ({ access_token }) => getKakaoUser(access_token),
    mapUser: (user) => ({
      email: user.kakao_account.email,
      name: user.kakao_account.profile.nickname,
      profileImage: user.kakao_account.profile.profile_image_url,
    }),
  });
};

export default {
  kakaoLoginRedirect,
  kakaoCallback,
};
