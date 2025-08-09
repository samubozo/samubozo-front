import React, { useContext } from 'react';
import AuthContext from '../context/UserContext';
import { Navigate } from 'react-router-dom';

// 라우터 쪽에서 로그인 여부나 권한을 검사하는 기능을 담당하는 PrivateRouter 생성.
const PrivateRouter = ({ element, requiredRole }) => {
  const { isLoggedIn, userRole, isInit } = useContext(AuthContext);
  const token = sessionStorage.getItem('ACCESS_TOKEN');

  // 1. Context 초기화 대기
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

  // 2. 토큰 존재 여부 체크 (가장 기본적인 인증)
  if (!token) {
    return <Navigate to='/' replace />;
  }

  // 3. Context 로그인 상태 체크 (추가 보안)
  if (!isLoggedIn) {
    return <Navigate to='/' replace />;
  }

  // 4. 권한 체크 (필요한 경우만)
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to='/' replace />;
  }

  // 5. 모든 인증 통과 - 컴포넌트 렌더링
  return element;
};

export default PrivateRouter;
