// 소셜 로그인 시 state로 전달하는 state(role, csrfToken)정보를 안전하게 encode/decode하기 위한 유틸 함수
export function encodeState({
  role,
  csrfToken,
}: {
  role: string;
  csrfToken: string;
}) {
  return Buffer.from(JSON.stringify({ role, csrfToken })).toString('base64');
}

export function decodeState(state: string): {
  role: string;
  csrfToken: string;
} {
  const decoded = Buffer.from(state, 'base64').toString();
  return JSON.parse(decoded);
}
