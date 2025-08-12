// 네트워크 404 에러 조용히 처리
const originalFetch = window.fetch;

window.fetch = function (...args) {
  return originalFetch.apply(this, args).then((response) => {
    // 404 에러 처리
    if (response.status === 404) {
      const clientHostName = window.location.hostname;

      if (clientHostName === 'localhost') {
        // 개발 환경: 404 에러를 경고로 표시
      } else {
        // 프로덕션 환경: 404 에러를 조용히 처리
      }
    }
    return response;
  });
};

export default window.fetch;
