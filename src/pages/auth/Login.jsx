import React, { useEffect, useState, useRef } from 'react';
import styles from './Login.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/samubozo-logo.png';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, AUTH, HR } from '../../configs/host-config';
import AuthContext from '../../context/UserContext';
import { useContext } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);
  const emailInputRef = useRef(null);

  useEffect(() => {
    const rememberedEmails = JSON.parse(
      localStorage.getItem('rememberedEmails') || '[]',
    );
    if (rememberedEmails.length > 0) {
      setEmail(rememberedEmails[0]);
      setRemember(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emailInputRef.current &&
        !emailInputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleEmailSelect = (selectedEmail) => {
    setEmail(selectedEmail);
    setShowDropdown(false);
  };

  const updateRememberedEmails = (email, checked) => {
    let rememberedEmails = JSON.parse(
      localStorage.getItem('rememberedEmails') || '[]',
    );
    if (checked) {
      rememberedEmails = [
        email,
        ...rememberedEmails.filter((e) => e !== email),
      ];
    } else {
      rememberedEmails = rememberedEmails.filter((e) => e !== email);
    }
    localStorage.setItem('rememberedEmails', JSON.stringify(rememberedEmails));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    updateRememberedEmails(email, remember);

    try {
      console.log('로그인 시도', email, password);
      const res = await axiosInstance.post(`${API_BASE_URL}${AUTH}/login`, {
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
        console.log('onLogin 호출', {
          accessToken,
          refreshToken,
          id,
          role,
          provider,
        });
        if (typeof onLogin === 'function') {
          await onLogin({ accessToken, refreshToken, id, role, provider });
        }
        sessionStorage.setItem('ACCESS_TOKEN', accessToken);
        localStorage.setItem('REFRESH_TOKEN', refreshToken);
      } else {
        console.log('로그인 응답에 토큰 없음:', res.data);
      }
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
        {/* 보안을 위한 숨겨진 필드 추가 */}
        <input
          type='text'
          style={{ display: 'none' }}
          autoComplete='username'
          tabIndex='-1'
        />
        <input
          type='password'
          style={{ display: 'none' }}
          autoComplete='current-password'
          tabIndex='-1'
        />
        <input
          type='text'
          style={{ display: 'none' }}
          name='fakeusernameremembered'
        />
        <input
          type='password'
          style={{ display: 'none' }}
          name='fakepasswordremembered'
        />
        <form onSubmit={handleSubmit} autoComplete='new-password' method='post'>
          <div
            style={{ position: 'relative', width: '100%' }}
            ref={emailInputRef}
          >
            <input
              className={styles.emailInput}
              type='email'
              placeholder='Email'
              value={email}
              onChange={handleEmailChange}
              onFocus={() => setShowDropdown(true)}
              autoComplete='username'
              name='email'
              id='email'
              required
              spellCheck='false'
            />
            {showDropdown && (
              <ul className={styles.emailDropdown}>
                {JSON.parse(localStorage.getItem('rememberedEmails') || '[]')
                  .filter((savedEmail) =>
                    savedEmail.toLowerCase().includes(email.toLowerCase()),
                  )
                  .map((savedEmail, index) => (
                    <li
                      key={index}
                      onClick={() => handleEmailSelect(savedEmail)}
                      className={styles.emailOption}
                    >
                      {savedEmail}
                    </li>
                  ))}
              </ul>
            )}
            {/* 이메일 자동완성 드롭다운(ul) 완전 제거 */}
          </div>
          <input
            className={styles.passwordInput}
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete='new-password'
            name='password'
            id='password'
            required
            spellCheck='false'
            style={{ width: '100%' }}
          />
          <div className={styles.rememberSection}>
            <input
              type='checkbox'
              id='remember'
              checked={remember}
              onChange={() => {
                setRemember(!remember);
                if (!remember) updateRememberedEmails(email, true);
                else updateRememberedEmails(email, false);
              }}
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
              이메일 찾기
            </a>{' '}
            | <Link to={'/passwordFind'}>비밀번호 찾기</Link>
          </span>
        </div>
        <div className={styles.topLinks}>
          <span>
            <Link to={'/passwordFind'}>비밀번호 찾기</Link>
          </span>
          <span className={styles.icon}>👤</span>
        </div>
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
