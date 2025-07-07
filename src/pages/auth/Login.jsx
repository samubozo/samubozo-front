import React, { useEffect, useState } from 'react';
import styles from './Login.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/samubozo-logo.png';
import axios from 'axios';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, AUTH, HR } from '../../configs/host-config';
import AuthContext from '../../context/UserContext';
import { useContext } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);

  // 컴포넌트 마운트 시 이메일 sessionStorage에서 복원
  useEffect(() => {
    const rememberedEmail = sessionStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 이메일 저장 처리
    if (remember) {
      sessionStorage.setItem('rememberedEmail', email);
    } else {
      sessionStorage.removeItem('rememberedEmail');
    }

    try {
      console.log('로그인 시도', email, password);
      const res = await axios.post(`${API_BASE_URL}${AUTH}/login`, {
        email,
        password,
      });
      console.log('로그인 응답:', res.data);

      if (
        res.data &&
        res.data.result &&
        (res.data.result.accessToken || res.data.result.token) &&
        res.data.result.refreshToken
      ) {
        const accessToken =
          res.data.result.accessToken || res.data.result.token;
        const refreshToken = res.data.result.refreshToken;
        const id = res.data.result.id;
        const role = res.data.result.role;
        const provider = res.data.result.provider;
        // UserContext의 loginHandler에 명확히 넘김
        console.log('onLogin 호출', {
          accessToken,
          refreshToken,
          id,
          role,
          provider,
        });
        if (typeof onLogin === 'function') {
          onLogin({ accessToken, refreshToken, id, role, provider });
        }
        sessionStorage.setItem('ACCESS_TOKEN', accessToken);
        localStorage.setItem('REFRESH_TOKEN', refreshToken);
      } else {
        console.log('로그인 응답에 토큰 없음:', res.data);
      }
      alert('로그인 성공!');
      navigate('/dashboard');
    } catch (e) {
      console.log('로그인 에러', e);
      if (e.response?.status === 403) {
        alert('정지된 계정입니다. 관리자에게 문의하세요.');
      } else {
        alert('로그인 실패입니다. 아이디 또는 비밀번호를 확인하세요!');
      }
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginBox}>
        <div className={styles.logoSection}>
          <img src={Logo} alt='사무보조 로고' />
        </div>
        <form onSubmit={handleSubmit}>
          <input
            className={styles.emailInput}
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={styles.passwordInput}
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className={styles.rememberSection}>
            <input
              type='checkbox'
              id='remember'
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <label htmlFor='remember'>이메일 저장</label>
          </div>
          <button type='submit'>로그인</button>
        </form>
        <div className={styles.links}>
          <span>
            <a
              href='#'
              onClick={(e) => {
                e.preventDefault();
                setShowModal(true);
              }}
            >
              ID 찾기
            </a>{' '}
            |<Link to={'/passwordFind'}>PW 찾기</Link>|
            <Link to={'/signup'}>회원가입 하기</Link>
          </span>
        </div>
        <div className={styles.topLinks}>
          <span>
            <Link to={'/signup'}>회원가입</Link> |{' '}
            <Link to={'/passwordFind'}>비밀번호 찾기</Link>
          </span>
          <span className={styles.icon}>👤</span>
        </div>
        {/* 커스텀 안내 모달 */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.18)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 6px 32px rgba(40,80,80,0.13)',
                padding: '38px 38px 28px 38px',
                minWidth: 320,
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 12 }}>📞</div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#25663b',
                  marginBottom: 10,
                }}
              >
                인사팀에 문의해주세요
              </div>
              <div style={{ fontSize: 18, color: '#444', marginBottom: 18 }}>
                연락처:{' '}
                <span style={{ fontWeight: 600, color: '#1fa366' }}>
                  010-1234-5678
                </span>
              </div>
              <button
                style={{
                  background: '#1fa366',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 17,
                  fontWeight: 600,
                  padding: '10px 32px',
                  cursor: 'pointer',
                  marginTop: 8,
                }}
                onClick={() => setShowModal(false)}
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
