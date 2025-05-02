import axios from 'axios';
import qs from 'querystring';

const clientId = process.env.KAKAO_CLIENT_ID!;
const redirectUri = process.env.KAKAO_REDIRECT_URI!;

export const getKakaoAuthURL = (state?: string) => {
  const rootUrl = 'https://kauth.kakao.com/oauth/authorize';
  const options = {
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'profile_nickname profile_image account_email',
    state,
  };
  return `${rootUrl}?${qs.stringify(options)}`;
};

export const exchangeCodeForToken = async (code: string) => {
  const url = 'https://kauth.kakao.com/oauth/token';
  const values = {
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
  };

  const res = await axios.post(url, qs.stringify(values), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return res.data;
};

export const getKakaoUser = async (access_token: string) => {
  const res = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  return res.data;
};
