// 소셜 로그인 시 state로 전달하는 role정보를 안전하게 encode/decode하기 위한 유틸 함수
export const encodeState = (data: any): string =>
  Buffer.from(JSON.stringify(data)).toString('base64url');

export const decodeState = (state: string): any =>
  JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
