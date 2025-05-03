import express from 'express';

import auth from '../../controllers/auth.controller';
import googleAuth from '../../controllers/google.controller';
import kakaoAuth from '../../controllers/kakao.controller';
import naverAuth from '../../controllers/naver.controller';
import {
  validateSignIn,
  validateSignUp,
} from '../../validations/auth.validation';

const authRouter = express.Router();

authRouter.post('/log-in', validateSignIn, auth.logInController);
authRouter.post('/sign-up', validateSignUp, auth.signUpController);
authRouter.post('/refresh-token', auth.refreshTokenController);
authRouter.delete('/log-out', auth.logOutController);

// 구글 로그인용 라우트 추가(조형민)
authRouter.get('/google', googleAuth.googleLoginRedirect);
authRouter.get('/google/callback', googleAuth.googleCallback);

// 카카오 로그인용 라우트 추가(조형민)
authRouter.get('/kakao', kakaoAuth.kakaoLoginRedirect);
authRouter.get('/kakao/callback', kakaoAuth.kakaoCallback);

// 네이버 로그인용 라우트 추가(조형민)
authRouter.get('/naver', naverAuth.naverLoginRedirect);
authRouter.get('/naver/callback', naverAuth.naverCallback);

export default authRouter;
