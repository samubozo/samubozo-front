import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.scss';
import Logo from '../assets/samubozo-logo2.png';
import { NavLink } from 'react-router-dom';
import Chatbot from './Chatbot';
import axiosInstance from '../configs/axios-config';
import { API_BASE_URL, HR } from '../configs/host-config';
console.log(styles);

const Header = ({ showChatbot }) => {
  const [userName, setUserName] = useState('');
  const [userPosition, setUserPosition] = useState('');
  const [userDepartment, setUserDepartment] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${HR}/users/detail`,
        );
        const userInfo = res.data.result;
        console.log(userInfo);

        sessionStorage.setItem('USER_NAME', userInfo.userName || '');
        sessionStorage.setItem(
          'USER_DEPARTMENT',
          userInfo.departmentName || '',
        );
        sessionStorage.setItem('USER_POSITION', userInfo.positionName || '');
        sessionStorage.setItem('USER_EMPLOYEE_NO', userInfo.employeeNo || '');
        setUserName(userInfo.userName || '');
        setUserDepartment(userInfo.departmentName || '');
        setUserPosition(userInfo.positionName || '');
      } catch (e) {
        console.error('유저 상세정보 조회 실패:', e);
      }
    };
    fetchUserInfo();
  }, []);

  const userInfoText =
    userName && userPosition && userDepartment
      ? `${userName} ${userPosition}(${userDepartment})`
      : '로그인 필요';

  // 드롭다운(모달) 상태
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // 로그아웃 핸들러
  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = '/';
  };

  // 관리자 전환 핸들러(예시)
  const handleSwitchAdmin = () => {
    alert('관리자 전환 기능은 추후 구현 예정입니다.');
    setShowDropdown(false);
  };

  return (
    <header className={styles.headerWrap}>
      <div className={styles.headerFixedLeft}>
        <span className={styles.gmt}>GMT+09:00</span>
        <span className={styles.userInfo}>{userInfoText}</span>
        <span className={styles.adminCheckbox}>
          <input type='checkbox' />
          <span>관리자</span>
        </span>
      </div>

      <div className={styles.headerMainRow}>
        <div className={styles.headerMainLeft}></div>
        <div className={styles.headerLogoRow}>
          <NavLink to='/dashboard'>
            <img
              src={Logo}
              alt='로고'
              className={styles.headerLogo}
              style={{ cursor: 'pointer' }}
            />
          </NavLink>
        </div>
        {showChatbot && (
          <div className={styles.headerMainRight}>
            <Chatbot inHeader />
          </div>
        )}
        <div className={styles.headerRight}>
          <NavLink to='/' className={styles.headerLink}>
            홈
          </NavLink>
          <span className={styles.headerDivider}>|</span>
          <NavLink to='/orgchart' className={styles.headerLink}>
            조직도
          </NavLink>
          <span className={styles.headerDivider}>|</span>
          <NavLink to='/approval' className={styles.headerLink}>
            전자결재
          </NavLink>
          <div className={styles.headerIcons} style={{ position: 'relative' }}>
            <button
              className={styles.icon}
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              👤
            </button>
            {showDropdown && (
              <div
                ref={dropdownRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  zIndex: 100,
                  minWidth: 160,
                  marginTop: 8,
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <button
                  style={{
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: 4,
                    padding: '10px 0',
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
                <button
                  style={{
                    background: '#e6f7e6',
                    border: 'none',
                    borderRadius: 4,
                    padding: '10px 0',
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                  onClick={handleSwitchAdmin}
                >
                  사용자/관리자 전환
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className={styles.headerNav}>
        <ul className={styles.headerNavList}>
          <li>
            <NavLink
              to='/dashboard'
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              메인
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/employee'
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              인사관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/attendance'
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              근태관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/payroll'
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              급여관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/schedule'
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              일정관리
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/message'
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              쪽지함
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
