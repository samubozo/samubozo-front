import React, { useEffect, useState } from 'react';
import { API_BASE_URL, HR } from '../configs/host-config';

const AuthContext = React.createContext({
  isLoggedIn: false,
  onLogin: () => {},
  onLogout: () => {},
  userRole: '',
  isInit: false,
});

// 위에서 생성한 Context를 제공하는 Provider 선언.
// 이 Provider를 통해 자식 컴포넌트(Consumer)에게 인증 상태와 관련된 값, 함수를 전달할 수 있음.
// JWT에서 role 파싱 함수
function getRoleFromToken() {
  const token = sessionStorage.getItem('ACCESS_TOKEN');
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role || null;
  } catch (e) {
    return null;
  }
}

export const AuthContextProvider = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isInit, setIsInit] = useState(false); // 초기화 완료 상태 추가

  // 앱 시작 시 JWT에서 role을 파싱해서 sessionStorage에 저장
  useEffect(() => {
    const role = getRoleFromToken();
    if (role) {
      sessionStorage.setItem('USER_ROLE', role);
    }
  }, []);

  // 로그인 시 실행할 핸들러
  const loginHandler = async (loginData) => {
    console.log(loginData);

    // accessToken, refreshToken 저장
    sessionStorage.setItem('ACCESS_TOKEN', loginData.accessToken);
    localStorage.setItem('REFRESH_TOKEN', loginData.refreshToken);
    sessionStorage.setItem('USER_ID', loginData.id);
    sessionStorage.setItem('USER_ROLE', loginData.role);
    if (loginData.provider) {
      sessionStorage.setItem('PROVIDER', loginData.provider);
    }

    // 로그인 후 유저 상세정보를 불러와서 sessionStorage에 저장
    try {
      const accessToken =
        loginData.accessToken || sessionStorage.getItem('ACCESS_TOKEN');
      const res = await fetch(`${API_BASE_URL}${HR}/users/detail`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const userInfo = data.result;

        console.log('🧾userInfo:', userInfo);

        sessionStorage.setItem('USER_EMAIL', userInfo.email || '');
        sessionStorage.setItem('USER_NAME', userInfo.userName || '');
        sessionStorage.setItem(
          'USER_DEPARTMENT',
          userInfo.department?.name || '',
        );
        sessionStorage.setItem(
          'USER_DEPARTMENT_ID',
          userInfo.department?.departmentId || '',
        );
        sessionStorage.setItem('USER_POSITION', userInfo.positionName || '');
        sessionStorage.setItem('USER_EMPLOYEE_NO', userInfo.employeeNo || '');
        sessionStorage.setItem(
          'USER_PROFILE_IMAGE',
          userInfo.profileImage || '',
        );
        sessionStorage.setItem('USER_HIRE_DATE', userInfo.hireDate || '');
        // 반드시 USER_ROLE(hrRole) 저장!
        sessionStorage.setItem('USER_ROLE', userInfo.hrRole || 'N');
      }
    } catch (e) {
      console.error('유저 상세정보 조회 실패:', e);
    }

    setIsLoggedIn(true);
    setUserRole(loginData.role);
  };

  // 로그아웃 핸들러
  const logoutHandler = () => {
    // 저장된 이메일 배열 보존
    const rememberedEmails = localStorage.getItem('rememberedEmails');

    // 세션스토리지 전체 삭제
    sessionStorage.clear();

    // 로컬스토리지 클리어 후 이메일 배열 복원
    localStorage.clear();
    if (rememberedEmails) {
      localStorage.setItem('rememberedEmails', rememberedEmails);
    }

    setIsLoggedIn(false);
    setUserRole('');
  };

  // 첫 렌더링 시에 이전 로그인 정보를 확인해서 로그인 상태 유지 시키기.
  useEffect(() => {
    if (sessionStorage.getItem('ACCESS_TOKEN')) {
      setIsLoggedIn(true);
      setUserRole(sessionStorage.getItem('USER_ROLE'));
    }
    setIsInit(true);
  }, []);

  // ACCESS_TOKEN이 삭제되면 자동 로그아웃 처리
  useEffect(() => {
    const checkToken = () => {
      if (!sessionStorage.getItem('ACCESS_TOKEN')) {
        setIsLoggedIn(false);
        setUserRole('');
      }
    };
    const interval = setInterval(checkToken, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        onLogin: loginHandler,
        onLogout: logoutHandler,
        userRole,
        isInit,
        user: {
          email: sessionStorage.getItem('USER_EMAIL'),
          employeeNo: sessionStorage.getItem('USER_EMPLOYEE_NO'),
          hrRole: sessionStorage.getItem('USER_ROLE'),
          userName: sessionStorage.getItem('USER_NAME'),
          department: sessionStorage.getItem('USER_DEPARTMENT'),
          departmentId: sessionStorage.getItem('USER_DEPARTMENT_ID'),
          positionName: sessionStorage.getItem('USER_POSITION'),
          profileImage: sessionStorage.getItem('USER_PROFILE_IMAGE'),
          hireDate: sessionStorage.getItem('USER_HIRE_DATE'),
        },
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
