import { RequestHandler } from 'express';
import {
  exchangeCodeForToken,
  getNaverAuthURL,
  getNaverUser,
} from '../services/naver.service';
import {
  handleOAuthCallback,
  handleOAuthRedirect,
} from '../services/oauth.service';

export const naverLoginRedirect: RequestHandler = (req, res) => {
  const state = req.query.state as string;
  handleOAuthRedirect(state, getNaverAuthURL, res);
};

export const naverCallback: RequestHandler = (req, res) =>
  handleOAuthCallback(req, res, {
    name: 'naver',
    exchangeCodeForToken,
    getUserInfo: ({ access_token }) => getNaverUser(access_token),
    mapUser: (naverUser) => ({
      email: naverUser.email,
      name: naverUser.name,
      profileImage: naverUser.profile_image,
    }),
  });

export default { naverLoginRedirect, naverCallback };
