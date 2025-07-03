import React, { useEffect, useState } from 'react';
import styles from './Login.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/samubozo-logo.png';
import axios from 'axios';
import { API_BASE_URL, AUTH } from '../../configs/host-config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 이메일 localStorage에서 복원
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 이메일 저장 처리
    if (remember) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    try {
      const res = await axios.post(`${API_BASE_URL}${AUTH}/login`, {
        email,
        password,
      });
      console.log('로그인 응답 결과:', res.data);
      alert('로그인 성공!');
      navigate('/dashboard');
    } catch (e) {
      if (e.response?.status === 403) {
        alert('정지된 계정입니다. 관리자에게 문의하세요.');
      } else {
        console.log(e);
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
            <span
              style={{ cursor: 'pointer', color: '#1785f2' }}
              onClick={() =>
                window.alert(
                  `가입 이메일은 인사팀에게 문의하세요.\n\n(연락처: 02-0000-1111)`,
                )
              }
            >
              ID 찾기
            </span>
            {' | '}
            <Link to={'/passwordFind'}>PW 찾기</Link> |{' '}
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
