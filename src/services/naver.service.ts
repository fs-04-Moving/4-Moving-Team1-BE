import axios from 'axios';
import qs from 'querystring';

const clientId = process.env.NAVER_CLIENT_ID!;
const clientSecret = process.env.NAVER_CLIENT_SECRET!;
const redirectUri = process.env.NAVER_REDIRECT_URI!;

export const getNaverAuthURL = (state?: string) => {
  const rootUrl = 'https://nid.naver.com/oauth2.0/authorize';
  const options = {
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  };

  return `${rootUrl}?${qs.stringify(options)}`;
};

export const exchangeCodeForToken = async (code: string, state: string) => {
  const url = 'https://nid.naver.com/oauth2.0/token';
  const values = {
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
    state,
    redirect_uri: redirectUri,
  };

  const res = await axios.post(`${url}?${qs.stringify(values)}`, null, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return res.data; // access_token 포함
};

export const getNaverUser = async (access_token: string) => {
  const res = await axios.get('https://openapi.naver.com/v1/nid/me', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  return res.data.response; // { id, name, email, profile_image }
};
