import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.scss';
import Logo from '../assets/samubozo-logo2.png';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Chatbot from './Chatbot';
import ToastNotification from './ToastNotification';
import axiosInstance from '../configs/axios-config';
import {
  API_BASE_URL,
  HR,
  MESSAGE,
  NOTIFICATION,
} from '../configs/host-config';
console.log(styles);

const Header = ({ showChatbot }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userPosition, setUserPosition] = useState('');
  const [userDepartment, setUserDepartment] = useState('');

  // 알림 관련 상태
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationDropdownRef = useRef(null);
  const eventSourceRef = useRef(null);

  // 토스트 알림 관련 상태
  const [toastNotifications, setToastNotifications] = useState([]);

  // 테스트용 토스트 알림 추가
  const addTestToast = (notification) => {
    const id = Date.now() + Math.random();
    const toastNotification = {
      id,
      message: notification,
      type: notification.type || 'info',
    };

    setToastNotifications((prev) => [...prev, toastNotification]);
  };

  // 알림 목록 조회
  const fetchNotifications = async () => {
    try {
      console.log('알림 목록 조회 시작');
      const response = await axiosInstance.get(
        `${API_BASE_URL}${NOTIFICATION}`,
      );
      console.log('알림 목록 조회 성공:', response.data);
      console.log('알림 데이터 구조 확인:', response.data);

      // 각 알림의 읽음 상태 확인
      response.data.forEach((notification, index) => {
        console.log(`알림 ${index + 1}:`, {
          id: notification.notificationId || notification.messageId,
          type: notification.type,
          message: notification.message,
          isRead: notification.isRead,
          readAt: notification.readAt,
          createdAt: notification.createdAt,
        });
      });

      setNotifications(response.data);

      // 알림 목록 업데이트 후 읽지 않은 개수 계산
      const unreadCount = response.data.filter((n) => !n.isRead).length;
      console.log('=== 읽지 않은 알림 개수 계산 ===');
      console.log('전체 알림 개수:', response.data.length);
      console.log('읽지 않은 알림 개수:', unreadCount);
      console.log(
        '읽지 않은 알림들:',
        response.data.filter((n) => !n.isRead),
      );
      console.log(
        '읽은 알림들:',
        response.data.filter((n) => n.isRead),
      );
      console.log('=== 계산 완료 ===');
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('알림 목록 조회 실패:', error);
      // API 실패 시 알림 목록을 빈 배열로 처리
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // 알림 읽음 처리
  const markNotificationAsRead = async (notificationId) => {
    try {
      console.log('알림 읽음 처리 시작:', notificationId);

      if (!notificationId) {
        console.error('알림 ID가 없습니다');
        return;
      }

      const response = await axiosInstance.patch(
        `${API_BASE_URL}${NOTIFICATION}/${notificationId}/read`,
      );
      console.log('알림 읽음 처리 성공:', response.data);
      // 읽음 처리 후 목록 다시 조회 (개수는 목록에서 계산됨)
      await fetchNotifications();
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      // 403 에러인 경우에도 UI 업데이트를 위해 로컬 상태 업데이트
      if (error.response?.status === 403) {
        console.log('권한 없음 - 로컬 상태만 업데이트');
        setNotifications((prev) =>
          prev.map((notification) => {
            const currentId =
              notification.notificationId || notification.messageId;
            return currentId === notificationId
              ? { ...notification, isRead: true }
              : notification;
          }),
        );
        // 로컬 상태 업데이트 후 읽지 않은 개수 재계산
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  // 토스트 알림 추가
  const addToastNotification = (notification) => {
    const id = Date.now() + Math.random();
    const toastNotification = {
      id,
      message: notification,
      type: notification.type || 'info',
    };

    setToastNotifications((prev) => [...prev, toastNotification]);
  };

  // 토스트 알림 제거
  const removeToastNotification = (id) => {
    setToastNotifications((prev) => prev.filter((toast) => toast.id !== id));
  };

  // JWT 파싱 함수 (base64url → JSON)
  function parseJwt(token) {
    if (!token) return {};
    const base64Url = token.split('.')[1];
    if (!base64Url) return {};
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    try {
      return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
    } catch (e) {
      return {};
    }
  }

  // SSE 구독 설정
  const setupSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // JWT 토큰에서 사용자 정보 추출
    const accessToken = sessionStorage.getItem('ACCESS_TOKEN');
    const payload = parseJwt(accessToken);
    const employeeNo = payload.employeeNo;
    const userEmail = payload.userEmail;
    const userRole = payload.userRole;

    // 쿼리 파라미터로 토큰과 사용자 정보 전달
    const eventSource = new EventSource(
      `${API_BASE_URL}${NOTIFICATION}/subscribe?token=${encodeURIComponent(accessToken || '')}&employeeNo=${employeeNo || ''}&userEmail=${encodeURIComponent(userEmail || '')}&userRole=${userRole || ''}`,
    );
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'MESSAGE') {
          // 새로운 알림이 도착하면 목록과 개수 업데이트
          fetchNotifications();
          // 토스트 알림 표시
          addToastNotification(data);
        }
      } catch (error) {
        console.error('SSE 메시지 파싱 실패:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE 연결 오류:', error);
      // 연결이 끊어지면 3초 후 재연결 시도
      setTimeout(() => {
        setupSSE();
      }, 3000);
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  };

  useEffect(() => {
    // 초기 데이터 로드
    fetchNotifications();

    // SSE 구독 시작
    const cleanup = setupSSE();

    return cleanup;
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${HR}/users/detail`,
        );
        const userInfo = res.data.result;
        console.log(userInfo);

        // 불필요한 항목들 제거
        sessionStorage.removeItem('USER_ID');
        sessionStorage.removeItem('USER_ROLE');

        // 부서명 추출 로직 보완
        const departmentName =
          userInfo.departmentName ||
          (userInfo.department && userInfo.department.name) ||
          '';

        // 필요한 항목들만 sessionStorage에 저장
        sessionStorage.setItem('USER_NAME', userInfo.userName || '');
        sessionStorage.setItem('USER_DEPARTMENT', departmentName);
        sessionStorage.setItem('USER_POSITION', userInfo.positionName || '');
        sessionStorage.setItem('USER_EMPLOYEE_NO', userInfo.employeeNo || '');

        setUserName(userInfo.userName || '');
        setUserDepartment(departmentName);
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
      : sessionStorage.getItem('USER_NAME')
        ? `${sessionStorage.getItem('USER_NAME')} ${sessionStorage.getItem('USER_POSITION') || ''}(${sessionStorage.getItem('USER_DEPARTMENT') || ''})`
        : '로그인 정보 없음';

  // 드롭다운(모달) 상태
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(e.target)
      ) {
        setShowNotificationDropdown(false);
      }
    }
    if (showDropdown || showNotificationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, showNotificationDropdown]);

  // 로그아웃 핸들러
  const handleLogout = () => {
    // SSE 연결 종료
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    sessionStorage.clear();
    window.location.href = '/';
  };

  // 알림 읽음 처리
  const handleNotificationRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      console.log('모든 알림 읽음 처리 시작');
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      if (unreadNotifications.length === 0) {
        console.log('읽지 않은 알림이 없습니다');
        return;
      }

      // API 호출 시도
      try {
        await Promise.all(
          unreadNotifications.map((notification) => {
            const notificationId =
              notification.notificationId || notification.messageId;
            console.log('읽음 처리할 알림 ID:', notificationId);
            if (notificationId) {
              return markNotificationAsRead(notificationId);
            } else {
              console.error('알림 ID를 찾을 수 없습니다:', notification);
              return Promise.resolve();
            }
          }),
        );
      } catch (error) {
        console.error('API 호출 실패, 로컬 상태만 업데이트:', error);
        // API 실패 시 로컬 상태만 업데이트
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true })),
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
    }
  };

  // 알림 아이콘 렌더링
  const NotificationIcon = () => {
    console.log('=== NotificationIcon 렌더링 ===');
    console.log('현재 unreadCount:', unreadCount);
    console.log('unreadCount > 0:', unreadCount > 0);
    console.log('표시할 개수:', unreadCount > 99 ? '99+' : unreadCount);
    console.log('=== 렌더링 완료 ===');

    return (
      <div className={styles.notificationIcon}>
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          style={{ color: '#666' }}
        >
          <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'></path>
          <path d='M13.73 21a2 2 0 0 1-3.46 0'></path>
        </svg>
        {unreadCount > 0 && (
          <div className={styles.notificationIndicator}>
            <span className={styles.notificationBadge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}
      </div>
    );
  };

  // 현재 경로에 따른 활성 메뉴 확인
  const isActive = (path) => {
    return location.pathname === path;
  };

  // 알림 클릭 처리
  const handleNotificationClick = async (notification) => {
    try {
      await axiosInstance.patch(
        `${API_BASE_URL}${NOTIFICATION}/${notification.notificationId}/read`,
      );
      fetchNotifications();
      // 쪽지 알림이면 쪽지 상세로 이동
      if (notification.type === 'MESSAGE' && notification.messageId) {
        navigate(`/message?messageId=${notification.messageId}`);
      }
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
    setShowNotificationDropdown(false);
  };

  // 알림 드롭다운 UI
  const NotificationDropdown = () => (
    <div className={styles.notificationDropdown} ref={notificationDropdownRef}>
      <div className={styles.notificationHeader}>
        🔔 알림{' '}
        {unreadCount > 0 ? `(${unreadCount}개 읽지 않음)` : '(모두 읽음)'}
      </div>
      {notifications.length === 0 ? (
        <div className={styles.noNotification}>📭 알림이 없습니다</div>
      ) : (
        <div className={styles.notificationList}>
          {notifications.map((n) => (
            <div
              key={n.notificationId}
              className={n.isRead ? styles.read : styles.unread}
              onClick={() => handleNotificationClick(n)}
            >
              <div className={styles.message}>{n.message}</div>
              <div className={styles.time}>
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
      {unreadCount > 0 && (
        <div className={styles.notificationFooter}>
          <button
            className={styles.markAllReadBtn}
            onClick={handleMarkAllAsRead}
          >
            모든 알림 읽음 처리
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
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

            {/* 테스트 버튼들 */}
            <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
              <button
                onClick={() => addTestToast(testNotifications[0])}
                style={{
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                쪽지 테스트
              </button>
              <button
                onClick={() => addTestToast(testNotifications[1])}
                style={{
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                근태 테스트
              </button>
              <button
                onClick={() => addTestToast(testNotifications[2])}
                style={{
                  background: '#ff9800',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                전자결재 테스트
              </button>
            </div>

            {/* 알림함 버튼 */}
            <div
              className={styles.headerIcons}
              style={{ position: 'relative', marginLeft: '15px' }}
            >
              <button
                className={styles.icon}
                onClick={() => setShowNotificationDropdown((prev) => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = '#f5f5f5')
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = 'transparent')
                }
              >
                <NotificationIcon />
              </button>
              {showNotificationDropdown && <NotificationDropdown />}
            </div>

            <div
              className={styles.headerIcons}
              style={{ position: 'relative' }}
            >
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
                className={
                  isActive('/dashboard')
                    ? `${styles.navLink} ${styles.active}`
                    : styles.navLink
                }
              >
                메인
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/employee'
                className={
                  isActive('/employee')
                    ? `${styles.navLink} ${styles.active}`
                    : styles.navLink
                }
              >
                인사관리
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/attendance'
                className={
                  isActive('/attendance')
                    ? `${styles.navLink} ${styles.active}`
                    : styles.navLink
                }
              >
                근태관리
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/payroll'
                className={
                  isActive('/payroll')
                    ? `${styles.navLink} ${styles.active}`
                    : styles.navLink
                }
              >
                급여관리
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/schedule'
                className={
                  isActive('/schedule')
                    ? `${styles.navLink} ${styles.active}`
                    : styles.navLink
                }
              >
                일정관리
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/message'
                className={
                  isActive('/message')
                    ? `${styles.navLink} ${styles.active}`
                    : styles.navLink
                }
              >
                쪽지함
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>

      {/* 토스트 알림들 */}
      {toastNotifications.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            bottom: `${20 + index * 100}px`,
            right: '20px',
            zIndex: 10000 - index,
          }}
        >
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => removeToastNotification(toast.id)}
            duration={5000}
          />
        </div>
      ))}
    </>
  );
};

export default Header;
