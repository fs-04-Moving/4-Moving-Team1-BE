import { ROLE } from "@prisma/client";
import { Request, Response } from "express";
import authService from "./auth.service";
import { CLIENT_URL } from "../app";

interface OAuthProvider {
  name: "google" | "kakao" | "naver";
  exchangeCodeForToken: (code: string, state: string) => Promise<any>;
  getUserInfo: (tokens: any) => Promise<any>;
  mapUser: (raw: any) => {
    email: string;
    name: string;
    profileImage: string;
  };
}

/**
 * OAuth 콜백 공통 처리 함수
 */
export async function handleOAuthCallback(
  req: Request,
  res: Response,
  provider: OAuthProvider
) {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string; // csrfToken, role 포함
    console.log("콜백:", state);
    const [csrfTokenFromState, roleFromState] = state.split("|");
    console.log("cookie:", req.cookies);
    const csrfTokenStored = req.cookies["oauth_csrf_token"];
    console.log("stored:", csrfTokenStored);
    // CSRF 토큰 검증 실패 시 쿠키 제거 후 리다이렉트
    if (!csrfTokenFromState || csrfTokenFromState !== csrfTokenStored) {
      res.clearCookie("oauth_csrf_token", { path: "/" }); // 검증 실패 시에도 삭제
      return res.redirect(
        `${CLIENT_URL}/auth/callback?errorCode=INVALID_OAUTH_STATE`
      );
    }

    // OAuth 토큰 교환 및 사용자 정보 조회
    const tokens = await provider.exchangeCodeForToken(code, state);
    const rawUser = await provider.getUserInfo(tokens);
    const { email, name, profileImage } = provider.mapUser(rawUser);

    // 사용자 생성 또는 조회
    const user = await authService.findOrCreateOAuthUser({
      email,
      name,
      profileImage,
      provider: provider.name,
      role: roleFromState as ROLE,
    });

    // 액세스/리프레시 토큰 발급 및 쿠키 저장
    const { accessToken, refreshToken } =
      authService.createTokenByUserData(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
    });

    res.clearCookie("oauth_csrf_token", { path: "/" }); // 성공 후에도 삭제
    res.redirect(`${CLIENT_URL}/auth/callback`); // 프론트로 이동
  } catch (e) {
    // 에러 발생 시 프론트로 errorCode와 provider, role 등 전달
    if (typeof e === "object" && e && "errorCode" in e) {
      const { errorCode, data } = e as {
        errorCode: string;
        data?: Record<string, string>;
      };
      const query = new URLSearchParams({ errorCode, ...data }).toString();
      return res.redirect(`${CLIENT_URL}/auth/callback?${query}`);
    }
    // 예상치 못한 에러
    return res.redirect(`${CLIENT_URL}/auth/callback?errorCode=UNKNOWN_ERROR`);
  }
}

/**
 * OAuth 리다이렉트 URL 생성 및 쿠키 설정 공통 처리 함수
 */
export function handleOAuthRedirect(
  state: string,
  getAuthURL: (state: string) => string,
  res: Response
) {
  const [csrfToken] = state.split("|");

  // 백엔드 도메인 기준 쿠키 저장 (콜백에서 검증용)
  res.cookie("oauth_csrf_token", csrfToken, {
    httpOnly: true,
    secure: false, // http 환경에서는 false, https 환경에선 true
    sameSite: "lax", // 외부 리다이렉트 흐름에서도 쿠키 전송 허용
    path: "/",
    maxAge: 5 * 60 * 1000,
  });

  const url = getAuthURL(state); // 소셜 로그인 URL 생성
  res.redirect(url);
}
