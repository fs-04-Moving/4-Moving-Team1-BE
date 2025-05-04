import { RequestHandler } from 'express';
import {
  exchangeCodeForToken,
  getGoogleAuthURL,
  getGoogleUser,
} from '../services/google.service';
import {
  handleOAuthCallback,
  handleOAuthRedirect,
} from '../services/oauth.service';

const googleLoginRedirect: RequestHandler = (req, res) => {
  const state = req.query.state as string; // csrfToken, role 포함
  handleOAuthRedirect(state, getGoogleAuthURL, res);
};

const googleCallback: RequestHandler = async (req, res) => {
  await handleOAuthCallback(req, res, {
    name: 'google',
    exchangeCodeForToken,
    getUserInfo: ({ id_token, access_token }) =>
      getGoogleUser(id_token, access_token),
    mapUser: (user) => ({
      email: user.email,
      name: user.name,
      profileImage: user.picture,
    }),
  });
};

export default {
  googleLoginRedirect,
  googleCallback,
};
