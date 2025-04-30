import express from 'express';

import auth from '../../controllers/auth.controller';
import googleAuth from '../../controllers/google.controller';
import {
  validateSignIn,
  validateSignUp,
} from '../../validations/auth.validation';

const authRouter = express.Router();

authRouter.post('/log-in', validateSignIn, auth.logInController);
authRouter.post('/sign-up', validateSignUp, auth.signUpController);
authRouter.post('/refresh-token', auth.refreshTokenController);
authRouter.delete('/log-out', auth.logOutController);

// 소셜 로그인용 라우터 추가(조형민)
authRouter.get('/google', googleAuth.googleLoginRedirect);
authRouter.get('/google/callback', googleAuth.googleCallback);

export default authRouter;
