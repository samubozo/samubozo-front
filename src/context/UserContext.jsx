import React, { useEffect, useState } from 'react';

const AuthContext = React.createContext({
  isLoggedIn: false,
  onLogin: () => {},
  onLogout: () => {},
  userRole: '',
  isInit: false,
});

// 위에서 생성한 Context를 제공하는 Provider 선언.
// 이 Provider를 통해 자식 컴포넌트(Consumer)에게 인증 상태와 관련된 값, 함수를 전달할 수 있음.
export const AuthContextProvider = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isInit, setIsInit] = useState(false); // 초기화 완료 상태 추가

  // 로그인 시 실행할 핸들러
  const loginHandler = (loginData) => {
    console.log(loginData);

    // 백엔드가 응답한 JSON 인증 정보를 클라이언트쪽에 보관하자.
    sessionStorage.setItem('ACCESS_TOKEN', loginData.token);
    sessionStorage.setItem('USER_ID', loginData.id);
    sessionStorage.setItem('USER_ROLE', loginData.role);
    if (loginData.provider) {
      sessionStorage.setItem('PROVIDER', loginData.provider);
    }

    setIsLoggedIn(true);
    setUserRole(loginData.role);
  };

  // 로그아웃 핸들러
  const logoutHandler = () => {
    sessionStorage.clear(); // 세션스토리지 전체 삭제
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

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        onLogin: loginHandler,
        onLogout: logoutHandler,
        userRole,
        isInit,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
