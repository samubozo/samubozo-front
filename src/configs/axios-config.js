// 여기에서 axios 인스턴스를 생성하고,
// interceptor 기능을 활용하여, access token이 만료되었을 때 refresh token을 사용하여
// 새로운 access token을 발급받는 비동기 방식의 요청을 모듈화. (fetch는 interceptor 기능 x)
// axios 인스턴스는 token이 필요한 모든 요청에 활용 될 것입니다.

import axios from 'axios';
import { API_BASE_URL, USER } from './host-config';

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
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    console.log(error);

    if (error.response.data.message === 'NO_LOGIN') {
      console.log('아예 로그인을 하지 않아서 재발급 요청 들어갈 수 없음!');
      return Promise.reject(error);
    }

    // 원래의 요청 정보를 기억해 놓자 -> 새 토큰 발급 받아서 다시 시도할 거니깐.
    const originalRequest = error.config;

    // 토큰 재발급 로직 작성
    if (error.response.status === 401) {
      console.log('응답상태 401 발생! 토큰 재발급 필요!');

      try {
        const id = localStorage.getItem('USER_ID');

        const res = await axios.post(`${API_BASE_URL}${USER}/refresh`, {
          id,
        });
        const newToken = res.data.result.token; // axios는 json() 안씁니다.
        localStorage.setItem('ACCESS_TOKEN', newToken); // 동일한 이름으로 토큰 담기 (덮어씀)

        // 실패한 원본 요청 정보에서 Authorization의 값을 새 토큰으로 갈아 끼우자
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // axios 인스턴스의 header Authorization도 새 토큰으로 갈아 끼우자.
        axiosInstance.defaults.headers.Authorization = `Bearer ${newToken}`;

        // axiosInstance를 사용하여 다시한번 원본 요청을 보내고, 응답은 원래 호출한 곳으로 리턴
        return axiosInstance(originalRequest);
      } catch (error) {
        console.log(error);
        // 백엔드에서 401을 보낸거 -> Refresh도 만료된 상황 (로그아웃처럼 처리해줘야 함.)
        localStorage.clear();
        // 재발급 요청도 거절당하면 인스턴스를 호출한 곳으로 에러 정보 리턴.
        return Promise.reject(error);
      }
    }
  },
);

export default axiosInstance;
