// 여기에서 axios 인스턴스를 생성하고,
// interceptor 기능을 활용하여, access token이 만료되었을 때 refresh token을 사용하여
// 새로운 access token을 발급받는 비동기 방식의 요청을 모듈화. (fetch는 interceptor 기능 x)
// axios 인스턴스는 token이 필요한 모든 요청에 활용 될 것입니다.

import axios from 'axios';
import { API_BASE_URL, AUTH } from './host-config';

// Axios 인스턴스 생성
// 이제부터 토큰이 필요한 요청은 그냥 axios가 아니라 지금 만드는 이 인스턴스로 보내겠다.
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
Axios Interceptor는 요청 또는 응답이 처리되기 전에 실행되는 코드입니다.
요청을 수정하거나, 응답에 대한 결과 처리를 수행할 수 있습니다.
*/

// 요청용 인터셉터
// 인터셉터의 use함수는 매개값 두 개 받습니다. 둘 다 콜백 함수 형식입니다.
// 1번째 콜백에는 정상 동작 로직, 2번째 콜백에는 과정 중 에러 발생 시 실행할 함수
axiosInstance.interceptors.request.use(
  (config) => {
    // 요청 보내기 전에 항상 처리해야 할 내용을 콜백으로 전달.
    const token = sessionStorage.getItem('ACCESS_TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('요청 헤더 설정:', {
        url: config.url,
        method: config.method,
        authorization: config.headers.Authorization ? 'Bearer ***' : '없음',
      });
    }

    // multipart/form-data 요청인 경우 Content-Type을 덮어쓰지 않음
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; // 브라우저가 자동으로 설정하도록 함
    }

    return config;
  },
  (error) => {
    console.log(error);
    Promise.reject(error); // reject가 호출되면 비동기 함수가 취소됨.
  },
);

// 응답용 인터셉터 설정
axiosInstance.interceptors.response.use(
  (response) => response, // 응답에 문제가 없다면 그대로 응답 객체 리턴.
  async (error) => {
    console.log('response interceptor 동작함! 응답에 문제가 발생!');
    console.log('에러 상세:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      statusMessage: error.response?.data?.statusMessage,
    });

    // NO_LOGIN 에러 처리
    if (error.response?.data?.message === 'NO_LOGIN') {
      console.log('아예 로그인을 하지 않아서 재발급 요청 들어갈 수 없음!');
      return Promise.reject(error);
    }

    // EXPIRED_RT 에러 처리 (리프레시 토큰 만료)
    if (error.response?.data?.statusMessage === 'EXPIRED_RT') {
      console.log('리프레시 토큰이 만료되었습니다. 재로그인이 필요합니다.');
      sessionStorage.clear();
      localStorage.removeItem('REFRESH_TOKEN');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 원래의 요청 정보를 기억해 놓자 -> 새 토큰 발급 받아서 다시 시도할 거니깐.
    const originalRequest = error.config;

    // 토큰 재발급 로직 작성
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지
      console.log('응답상태 401 발생! 토큰 재발급 필요!');

      try {
        const employeeNo = sessionStorage.getItem('USER_EMPLOYEE_NO');
        const refreshToken = localStorage.getItem('REFRESH_TOKEN');

        if (!employeeNo || !refreshToken) {
          console.log(
            '리프레시 토큰 또는 employeeNo가 없습니다. 재로그인이 필요합니다.',
          );
          sessionStorage.clear();
          localStorage.removeItem('REFRESH_TOKEN');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        console.log('리프레시 토큰으로 새로운 액세스 토큰 요청 중...');

        // refreshToken으로 accessToken 재발급
        const res = await axios.post(
          `${API_BASE_URL}${AUTH}/refresh`,
          {
            refreshToken,
            employeeNo,
          },
          { headers: { 'Content-Type': 'application/json' } },
        );

        console.log('리프레시 응답:', res.data);

        // 응답 구조 안전 체크 (서버는 { accessToken: ... } 형태)
        const newAccessToken =
          res?.data?.accessToken || res?.data?.result?.accessToken;
        if (!newAccessToken) {
          console.error('리프레시 응답에 accessToken 없음:', res.data);
          sessionStorage.clear();
          localStorage.removeItem('REFRESH_TOKEN');
          window.location.href = '/login';
          return Promise.reject(new Error('리프레시 응답에 accessToken 없음'));
        }

        console.log('새로운 액세스 토큰 발급 성공');
        sessionStorage.setItem('ACCESS_TOKEN', newAccessToken);

        // 실패한 원본 요청 정보에서 Authorization의 값을 새 토큰으로 갈아 끼우자 (headers가 undefined일 수 있으니 복사)
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        console.log('원본 요청 재시도 중...');
        // axiosInstance를 사용하여 다시한번 원본 요청을 보내고, 응답은 원래 호출한 곳으로 리턴
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('리프레시 토큰 갱신 실패:', refreshError);

        // 리프레시 토큰 갱신 실패 시 로그아웃 처리
        sessionStorage.clear();
        localStorage.removeItem('REFRESH_TOKEN');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 401이 아닌 다른 에러들(403, 404, 500 등)은 그대로 reject
    return Promise.reject(error);
  },
);

export default axiosInstance;
