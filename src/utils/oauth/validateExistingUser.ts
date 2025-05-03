import { ROLE, User } from '@prisma/client';

/**
 * 기존 사용자 유효성 검사 */
export function validateExistingUser(
  user: User,
  provider: 'google' | 'kakao' | 'naver',
  requestedRole: ROLE
) {
  // 이메일 회원가입 여부
  const isLocal = !user.provider || user.provider === 'local';

  // provider가 다르면
  if (user.provider !== provider) {
    // );
    throw {
      errorCode: 'PROVIDER_MISMATCH',
      data: {
        existingProvider: isLocal ? 'local' : user.provider,
        role: user.role,
      },
    };
  }

  // provider는 같지만 role이 다르면
  if (user.role !== requestedRole) {
    throw {
      errorCode: 'ROLE_MISMATCH',
      data: {
        provider,
        existingRole: user.role,
        requestedRole,
      },
    };
  }
}
