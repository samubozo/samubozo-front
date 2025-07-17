export const handleAxiosError = (error, onLogout, navigate) => {
  console.log('HandleAxiosError 호출됨:', {
    status: error.response?.status,
    message: error.response?.data?.message,
    statusMessage: error.response?.data?.statusMessage,
  });

  // 리프레시 토큰 만료
  if (error.response?.data?.statusMessage === 'EXPIRED_RT') {
    console.log('리프레시 토큰이 만료되었습니다.');
    alert('시간이 경과하여 재 로그인이 필요합니다.');

    // 저장된 이메일 배열 보존
    const rememberedEmails = localStorage.getItem('rememberedEmails');
    if (onLogout) onLogout();
    if (navigate) navigate('/login');
    return;
  }

  // 액세스 토큰 만료 (이미 interceptor에서 처리됨)
  if (error.response?.status === 401) {
    console.log('액세스 토큰 만료 - interceptor에서 처리됨');
    return;
  }

  // 권한 없음
  if (error.response?.status === 403) {
    console.log('권한이 없습니다.');
    alert('해당 기능에 대한 권한이 없습니다.');
    return;
  }

  // 서버 오류
  if (error.response?.status >= 500) {
    console.log('서버 오류 발생');
    alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  // 기타 에러
  console.log('기타 에러 발생:', error);
  alert('오류가 발생했습니다. 다시 시도해주세요.');
  throw error;
};
