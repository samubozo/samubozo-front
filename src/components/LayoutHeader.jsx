import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import AuthContext from '../context/UserContext';
import { WeatherProvider } from '../context/WeatherContext';

const LayoutHeader = () => {
  const { isLoggedIn, isInit } = useContext(AuthContext);
  const token = sessionStorage.getItem('ACCESS_TOKEN');

  // 더 엄격한 인증 체크 - Context 초기화 대기
  if (!isInit) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#666',
        }}
      >
        로딩 중...
      </div>
    );
  }

  // 토큰 존재 여부를 우선 체크 (더 빠른 체크)
  if (!token) {
    console.log('LayoutHeader: 토큰 없음 - 즉시 리다이렉트');
    return <Navigate to='/' replace />;
  }

  // Context 로그인 상태 체크 (추가 보안)
  if (!isLoggedIn) {
    console.log('LayoutHeader: Context에서 로그인 안됨 - 리다이렉트');
    return <Navigate to='/' replace />;
  }

  // 모든 인증 통과 - 헤더와 컨텐츠 렌더링
  console.log('LayoutHeader: 인증 성공 - 헤더 렌더링');
  return (
    <WeatherProvider>
      <div>
        <Header showChatbot />
        <Outlet />
      </div>
    </WeatherProvider>
  );
};

export default LayoutHeader;
