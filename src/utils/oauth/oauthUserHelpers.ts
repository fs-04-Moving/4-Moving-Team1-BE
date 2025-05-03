import { ROLE } from '@prisma/client';
import { attachJosa } from '../\battachJosa';

/**
 * provider 불일치 메시지
 */
export function getProviderMismatchMessage(
  existingProvider: 'local' | 'google' | 'kakao' | 'naver',
  role: ROLE
): string {
  const providerText = getProviderText(existingProvider);
  const roleText = getRoleText(role);
  return (
    `이미 ${attachJosa(`${providerText}`, '을를')} 이용해 ` +
    `${attachJosa(`${roleText}`, '으로')} 가입된 이메일입니다.\n` +
    `${attachJosa(`${providerText}`, '으로')} 로그인해 주세요.`
  );
}

/**
 * role 불일치 메시지
 */
export function getRoleMismatchMessage(
  provider: 'google' | 'kakao' | 'naver',
  existingRole: ROLE,
  requestedRole: ROLE
): string {
  const providerText = getProviderText(provider);
  const existingRoleText = getRoleText(existingRole);
  const requestedRoleText = getRoleText(requestedRole);
  return (
    `이미 ${attachJosa(`${providerText}`, '을를')} 이용해 ` +
    `${attachJosa(`${existingRoleText}`, '으로')} 가입된 이메일입니다.\n` +
    `"${existingRoleText} 로그인 페이지"에서 로그인하시거나\n` +
    `다른 계정을 통해 ${attachJosa(`${requestedRoleText}`, '으로')} 가입하세요.`
  );
}

/**
 * ROLE enum -> 한글
 */
export function getRoleText(role: ROLE): string {
  return role === 'customer' ? '고객' : '기사';
}

/**
 * provider명을 한글로 변경
 */
function getProviderText(
  provider: 'google' | 'kakao' | 'naver' | 'local'
): string {
  switch (provider) {
    case 'google':
      return '구글';
    case 'kakao':
      return '카카오';
    case 'naver':
      return '네이버';
    case 'local':
      return '이메일/패스워드';
  }
}
