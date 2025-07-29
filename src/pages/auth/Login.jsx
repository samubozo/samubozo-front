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
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);
  const emailInputRef = useRef(null);
  const dropdownRef = useRef(null);

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
        !emailInputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // 이메일 필터링
    const rememberedEmails = JSON.parse(
      localStorage.getItem('rememberedEmails') || '[]',
    );
    const filtered = rememberedEmails.filter((savedEmail) =>
      savedEmail.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredEmails(filtered);
    setSelectedIndex(-1);
    if (filtered.length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredEmails.length - 1 ? prev + 1 : 0,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredEmails.length - 1,
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredEmails[selectedIndex]) {
          handleEmailSelect(filteredEmails[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleEmailSelect = (selectedEmail) => {
    setEmail(selectedEmail);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setFilteredEmails([]);
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
        const employeeNo = res.data.result.employeeNo;
        const role = res.data.result.role;
        const provider = res.data.result.provider;
        console.log('로그인 응답 accessToken:', accessToken);
        console.log('로그인 응답 refreshToken:', refreshToken);
        console.log('로그인 응답 id:', id);
        console.log('로그인 응답 employeeNo:', employeeNo);
        console.log('로그인 응답 role:', role);
        console.log('로그인 응답 provider:', provider);
        console.log('전체 로그인 응답 result:', res.data.result);
        if (typeof onLogin === 'function') {
          await onLogin({ accessToken, refreshToken, id, role, provider });
        }
        // 실제 저장되는 토큰 값도 출력
        console.log('sessionStorage에 저장할 ACCESS_TOKEN:', accessToken);
        sessionStorage.setItem('ACCESS_TOKEN', accessToken);
        localStorage.setItem('REFRESH_TOKEN', refreshToken);

        // 로그인 성공 시에만 이메일 저장
        if (remember) {
          updateRememberedEmails(email, true);
        }
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

  const clearSavedEmails = () => {
    localStorage.removeItem('rememberedEmails');
    setFilteredEmails([]);
    setShowDropdown(false);
  };

  const removeEmail = (emailToRemove, e) => {
    e.stopPropagation();
    let rememberedEmails = JSON.parse(
      localStorage.getItem('rememberedEmails') || '[]',
    );
    rememberedEmails = rememberedEmails.filter(
      (email) => email !== emailToRemove,
    );
    localStorage.setItem('rememberedEmails', JSON.stringify(rememberedEmails));

    // 현재 필터링된 목록도 업데이트
    const filtered = rememberedEmails.filter((savedEmail) =>
      savedEmail.toLowerCase().includes(email.toLowerCase()),
    );
    setFilteredEmails(filtered);

    if (filtered.length === 0) {
      setShowDropdown(false);
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
              onFocus={() => {
                const rememberedEmails = JSON.parse(
                  localStorage.getItem('rememberedEmails') || '[]',
                );
                const filtered = rememberedEmails.filter((savedEmail) =>
                  savedEmail.toLowerCase().includes(email.toLowerCase()),
                );
                setFilteredEmails(filtered);
                if (filtered.length > 0) {
                  setShowDropdown(true);
                }
              }}
              onKeyDown={handleKeyDown}
              autoComplete='username'
              name='email'
              id='email'
              required
              spellCheck='false'
            />
            {showDropdown && (
              <ul className={styles.emailDropdown} ref={dropdownRef}>
                {filteredEmails.length > 0 && (
                  <li className={styles.dropdownHeader}>
                    <span>저장된 이메일</span>
                    <button
                      className={styles.clearAllButton}
                      onClick={clearSavedEmails}
                      title='모든 이메일 삭제'
                    >
                      모두 삭제
                    </button>
                  </li>
                )}
                {filteredEmails.map((savedEmail, index) => (
                  <li
                    key={index}
                    onClick={() => handleEmailSelect(savedEmail)}
                    className={`${styles.emailOption} ${selectedIndex === index ? styles.selected : ''}`}
                  >
                    <span className={styles.emailText}>{savedEmail}</span>
                    <button
                      className={styles.removeButton}
                      onClick={(e) => removeEmail(savedEmail, e)}
                      title='이 이메일 삭제'
                    >
                      ×
                    </button>
                  </li>
                ))}
                {filteredEmails.length === 0 && email && (
                  <li className={styles.noResults}>
                    일치하는 이메일이 없습니다.
                  </li>
                )}
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
