import React, { useContext } from 'react';
import AuthContext from '../context/UserContext';
import { Navigate } from 'react-router-dom';

// 라우터 쪽에서 로그인 여부나 권한을 검사하는 기능을 담당하는 PrivateRouter 생성.
const PrivateRouter = ({ element, requiredRole }) => {
  const { isLoggedIn, userRole, isInit } = useContext(AuthContext);
  const token = sessionStorage.getItem('ACCESS_TOKEN');

  console.log('PrivateRouter 디버깅:', {
    isInit,
    isLoggedIn,
    userRole,
    hasToken: !!token,
    token,
  });

  // Context 데이터가 초기화되지 않았다면 로딩 페이지 먼저 리턴
  if (!isInit) {
    console.log('Context 초기화 중...');
    return <div>Loading...</div>;
  }

  // 토큰이 없으면 무조건 로그인 페이지로
  if (!token) {
    console.log('토큰 없음 - 로그인 페이지로 리다이렉트');
    alert('로그인 정보가 없습니다, 로그인 화면으로 이동합니다!');
    return <Navigate to='/' replace />;
  }

  // Context의 로그인 상태도 확인
  if (!isLoggedIn) {
    console.log('Context에서 로그인 안됨 - 로그인 페이지로 리다이렉트');
    alert('로그인 정보가 없습니다, 로그인 화면으로 이동합니다!');
    return <Navigate to='/' replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log('권한 없음 - 로그인 페이지로 리다이렉트');
    alert('권한 없음!');
    return <Navigate to='/' replace />;
  }

  console.log('인증 성공 - 컴포넌트 렌더링');
  // 로그인도 했고, 권한에도 문제가 없다면 원래 렌더링 하고자 했던 컴포넌트를 렌더링.
  return element;
};

export default PrivateRouter;
