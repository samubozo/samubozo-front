import React, { useState, useRef, useEffect, useContext } from 'react';
import styles from './Header.module.scss';
import Logo from '../assets/samubozo-logo2.png';
import sunflowerImg from '../assets/Gemini_Generated_Image_8m3t3l8m3t3l8m3t2.png';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/UserContext';
import { useWeather } from '../context/WeatherContext';
import Chatbot from './Chatbot';
import ToastNotification from './ToastNotification';
import axiosInstance from '../configs/axios-config';
import {
  API_BASE_URL,
  HR,
  MESSAGE,
  NOTIFICATION,
} from '../configs/host-config';
import WeatherWidget from './WeatherWidget';

const Header = ({ showChatbot }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useContext(AuthContext);
  const { todayWeatherState } = useWeather();
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
  const [notificationTab, setNotificationTab] = useState('unread'); // 'unread' | 'all'

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
      const response = await axiosInstance.get(
        `${API_BASE_URL}${NOTIFICATION}`,
      );

      // 각 알림의 읽음 상태 확인
      response.data.forEach((notification, index) => {});

      setNotifications(response.data);

      // 알림 목록 업데이트 후 읽지 않은 개수 계산
      const unreadCount = response.data.filter((n) => !n.isRead).length;

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
      if (!notificationId) {
        console.error('알림 ID가 없습니다');
        return;
      }

      const response = await axiosInstance.patch(
        `${API_BASE_URL}${NOTIFICATION}/${notificationId}/read`,
      );
      // 읽음 처리 후 목록 다시 조회 (개수는 목록에서 계산됨)
      await fetchNotifications();
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      // 403 에러인 경우에도 UI 업데이트를 위해 로컬 상태 업데이트
      if (error.response?.status === 403) {
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

  const sseRetryDelayRef = useRef(10000); // 최초 10초 (더 길게)
  const SSE_MAX_RETRY_DELAY = 60000; // 최대 1분
  const sseRetryCountRef = useRef(0); // 재연결 횟수 추적
  const SSE_MAX_RETRY_COUNT = 5; // 최대 재연결 횟수 줄임
  const isRefreshingTokenRef = useRef(false); // 토큰 갱신 중 플래그

  // SSE 구독 설정
  const setupSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // JWT 토큰에서 사용자 정보 추출
    const accessToken = sessionStorage.getItem('ACCESS_TOKEN');
    const payload = parseJwt(accessToken);
    const employeeNo = payload.employeeNo;
    const userEmail = payload.userEmail || payload.sub || '';
    const userRole = payload.userRole || payload.role || '';

    // 디버깅: SSE 연결 파라미터 로그

    // 토큰이 만료되었으면 갱신 시도
    if (payload.exp * 1000 < Date.now()) {
      // 이미 갱신 중이면 중복 시도 방지
      if (isRefreshingTokenRef.current) {
        return;
      }

      isRefreshingTokenRef.current = true;
      const refreshToken = localStorage.getItem('REFRESH_TOKEN');
      if (refreshToken) {
        axiosInstance
          .post(
            `${API_BASE_URL}/auth-service/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } },
          )
          .then((res) => {
            const newAccessToken =
              res.data.accessToken || res.data.result?.accessToken;
            if (newAccessToken) {
              sessionStorage.setItem('ACCESS_TOKEN', newAccessToken);
              isRefreshingTokenRef.current = false;
              // 무한 재귀 방지: 1초 후에 재연결
              setTimeout(() => {
                setupSSE();
              }, 1000);
              return;
            }
          })
          .catch((e) => {
            console.error('토큰 갱신 실패:', e);
            isRefreshingTokenRef.current = false;
            sessionStorage.clear();
            localStorage.removeItem('REFRESH_TOKEN');
            window.location.href = '/';
            return;
          });
      } else {
        console.error('리프레시 토큰 없음 - 로그인 페이지로 이동');
        isRefreshingTokenRef.current = false;
        sessionStorage.clear();
        window.location.href = '/';
        return;
      }
    }

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

    eventSource.onerror = async (error) => {
      console.error('SSE 연결 오류:', error);

      // 500 에러나 서버 오류일 때는 재연결 중단
      if (eventSource.readyState === EventSource.CLOSED) {
        // 최대 재연결 횟수 초과 시 중단
        if (sseRetryCountRef.current >= SSE_MAX_RETRY_COUNT) {
          console.error('SSE 최대 재연결 횟수 초과 - 재연결 중단');
          setSseConnectionStatus('error');
          return;
        }

        const refreshToken = localStorage.getItem('REFRESH_TOKEN');
        if (refreshToken) {
          try {
            const res = await axiosInstance.post(
              `${API_BASE_URL}/auth-service/auth/refresh`,
              { refreshToken },
              { headers: { 'Content-Type': 'application/json' } },
            );
            const newAccessToken =
              res.data.accessToken || res.data.result?.accessToken;
            if (newAccessToken) {
              sessionStorage.setItem('ACCESS_TOKEN', newAccessToken);
              // 토큰 갱신 성공해도 서버가 꺼져있으면 의미없으므로 더 긴 간격으로 재연결
              setTimeout(() => {
                setupSSE();
                sseRetryDelayRef.current = Math.min(
                  sseRetryDelayRef.current * 2,
                  SSE_MAX_RETRY_DELAY,
                );
              }, sseRetryDelayRef.current);
              return;
            }
          } catch (e) {
            console.error('토큰 갱신 실패 - 재연결 중단');
            sessionStorage.clear();
            localStorage.removeItem('REFRESH_TOKEN');
            window.location.href = '/';
            return;
          }
        } else {
          console.error('리프레시 토큰 없음 - 재연결 중단');
          sessionStorage.clear();
          localStorage.removeItem('REFRESH_TOKEN');
          window.location.href = '/';
          return;
        }
      }

      // 일반적인 네트워크 오류가 아닌 경우 재연결 중단
      setSseConnectionStatus('disconnected');
    };

    eventSource.onopen = () => {
      // 연결 성공 시 딜레이 초기화
      sseRetryDelayRef.current = 10000; // 10초로 초기화
      sseRetryCountRef.current = 0; // 재연결 횟수 초기화
      setSseConnectionStatus('connected');
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
        sessionStorage.setItem('HR_ROLE', userInfo.hrRole || '');

        setUserName(userInfo.userName || '');
        setUserDepartment(departmentName);
        setUserPosition(userInfo.positionName || '');
      } catch (e) {
        console.error('유저 상세정보 조회 실패:', e);
      }
    };
    fetchUserInfo();
  }, []);

  // 랜덤 인사말 생성 함수
  const getRandomGreeting = () => {
    const greetings = [
      '어서오세요!',
      '안녕하세요!',
      '반갑습니다!',
      '환영합니다!',
      '좋은 하루 되세요!',
      '오늘도 화이팅!',
      '수고하세요!',
      '건강하세요!',
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const userInfoText =
    userName && userPosition && userDepartment
      ? `${getRandomGreeting()} ${userName} ${userPosition}(${userDepartment}) 님`
      : sessionStorage.getItem('USER_NAME')
        ? `${getRandomGreeting()} ${sessionStorage.getItem('USER_NAME')} ${sessionStorage.getItem('USER_POSITION') || ''}(${sessionStorage.getItem('USER_DEPARTMENT') || ''}) 님`
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

    // 저장된 이메일 배열 보존
    const rememberedEmails = localStorage.getItem('rememberedEmails');

    // 모든 스토리지 클리어
    sessionStorage.clear();
    localStorage.clear();

    // 저장된 이메일 배열 복원
    if (rememberedEmails) {
      localStorage.setItem('rememberedEmails', rememberedEmails);
    }

    window.location.href = '/';
  };

  // 알림 읽음 처리
  const handleNotificationRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      if (unreadNotifications.length === 0) {
        return;
      }

      // API 호출 시도
      try {
        await Promise.all(
          unreadNotifications.map((notification) => {
            const notificationId =
              notification.notificationId || notification.messageId;
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

  // HR 권한 확인
  const isHR = user?.hrRole === 'Y';

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
  const NotificationDropdown = () => {
    // 현재 탭에 따라 표시할 알림 필터링
    const filteredNotifications =
      notificationTab === 'unread'
        ? notifications.filter((n) => !n.isRead)
        : notifications;

    return (
      <div
        className={styles.notificationDropdown}
        ref={notificationDropdownRef}
      >
        <div className={styles.notificationHeader}>
          <div className={styles.notificationTabs}>
            <button
              className={`${styles.notificationTab} ${notificationTab === 'unread' ? styles.active : ''}`}
              onClick={() => setNotificationTab('unread')}
            >
              읽지 않은 알림 {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              className={`${styles.notificationTab} ${notificationTab === 'all' ? styles.active : ''}`}
              onClick={() => setNotificationTab('all')}
            >
              모든 알림 ({notifications.length})
            </button>
          </div>
        </div>
        {filteredNotifications.length === 0 ? (
          <div className={styles.noNotification}>
            {notificationTab === 'unread'
              ? '📭 읽지 않은 알림이 없습니다'
              : '📭 알림이 없습니다'}
          </div>
        ) : (
          <div className={styles.notificationList}>
            {filteredNotifications.map((n) => (
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
        {unreadCount > 0 && notificationTab === 'unread' && (
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
  };

  // 날씨 아이콘 결정 함수
  function getWeatherIcon(sky, pty) {
    if (pty === '1' || pty === 1) return '🌧️'; // 비
    if (pty === '2' || pty === 2) return '🌨️'; // 비/눈
    if (pty === '3' || pty === 3) return '❄️'; // 눈
    if (pty === '4' || pty === 4) return '🌦️'; // 소나기
    if (sky === '1' || sky === 1) return '☀️'; // 맑음
    if (sky === '3' || sky === 3) return '⛅'; // 구름많음
    if (sky === '4' || sky === 4) return '☁️'; // 흐림
    return '🌈'; // 기타/알수없음
  }

  // 날씨 테스트용 상태 (dev only)
  const [testWeather, setTestWeather] = useState(null); // {sky, pty} or null

  // SSE 연결 상태 관리
  const [sseConnectionStatus, setSseConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'disconnected', 'error'

  // 수동 SSE 재연결 함수
  const manualReconnectSSE = () => {
    sseRetryCountRef.current = 0; // 카운터 초기화
    sseRetryDelayRef.current = 10000; // 딜레이 초기화
    setSseConnectionStatus('connecting');
    setupSSE();
  };

  // JWT 토큰에서 hrRole 파싱
  let hrRole = 'N';
  const token = sessionStorage.getItem('ACCESS_TOKEN');
  if (token) {
    const payload = parseJwt(token);
    hrRole = payload.hrRole || payload.role || 'N';
  }

  return (
    <>
      <header className={styles.headerWrap}>
        <div className={styles.headerFixedLeft}>
          {/* 날씨 테스트 버튼: 유저정보 위로 이동 */}
          <WeatherWidget
            testWeather={testWeather}
            setTestWeather={setTestWeather}
            onlyButtons
          />
        </div>
        <div className={styles.headerMainRow}>
          <div className={styles.headerMainLeft}></div>
          <div className={styles.headerLogoRow}>
            <div
              className={styles.logoWeatherWrap}
              style={{ position: 'relative', display: 'inline-block' }}
            >
              <WeatherWidget
                testWeather={testWeather}
                setTestWeather={setTestWeather}
                onlyAnimation
              />
              <img
                src={Logo}
                alt='로고'
                className={styles.headerLogo}
                style={{ cursor: 'pointer', position: 'relative', zIndex: 1 }}
              />

              {/* 맑음일 때만 해바라기 표시 (로고에 겹치게) */}
              {(() => {
                // 테스트 날씨인 경우
                if (
                  testWeather &&
                  testWeather.sky === '1' &&
                  testWeather.pty === '0'
                ) {
                  return true;
                }

                // 실제 날씨인 경우 - 더 정확한 조건 체크
                if (!testWeather && todayWeatherState) {
                  // SKY가 1이거나 SKY_KR이 '맑음'인 경우
                  const isSunny =
                    todayWeatherState.SKY === '1' ||
                    todayWeatherState.SKY === 1 ||
                    todayWeatherState.SKY_KR === '맑음';
                  // PTY가 0이거나 PTY_KR이 '없음'인 경우
                  const noPrecipitation =
                    todayWeatherState.PTY === '0' ||
                    todayWeatherState.PTY === 0 ||
                    todayWeatherState.PTY_KR === '없음';

                  return isSunny && noPrecipitation;
                }

                return false;
              })() && (
                <img
                  src={sunflowerImg}
                  alt='해바라기'
                  className={styles.sunflowerAppear}
                  style={{
                    width: '50px',
                    height: '50px',
                    position: 'absolute',
                    left: '245px',
                    top: '5px',
                    margin: 0,
                    padding: 0,
                    background: 'none',
                    objectFit: 'contain',
                    zIndex: 10, // 더 높은 z-index로 설정
                    pointerEvents: 'none', // 클릭 이벤트 방지
                  }}
                />
              )}
            </div>
          </div>
          {showChatbot && (
            <span className={styles.userInfo + ' ' + styles.userInfoBottomLeft}>
              <Chatbot inHeader />
            </span>
          )}
          <div className={styles.headerMainRight}>
            {userInfoText}
            {isHR && (
              <span
                style={{
                  background: '#48b96c',
                  color: '#fff',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  marginLeft: '8px',
                  fontWeight: '600',
                }}
              >
                HR
              </span>
            )}
          </div>
          <div className={styles.headerRight}>
            {/* 홈 버튼: 로그인 상태면 /dashboard, 아니면 / */}
            <button
              className={styles.headerLink}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
              onClick={() => {
                if (isLoggedIn || sessionStorage.getItem('ACCESS_TOKEN')) {
                  navigate('/dashboard');
                } else {
                  navigate('/');
                }
              }}
            >
              홈
            </button>
            <span className={styles.headerDivider}>|</span>
            <NavLink to='/orgchart' className={styles.headerLink}>
              조직도
            </NavLink>
            <span className={styles.headerDivider}>|</span>
            <NavLink to='/approval' className={styles.headerLink}>
              전자결재
            </NavLink>

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
            {/* 인사관리 NavLink 부분 */}
            {isLoggedIn && hrRole === 'Y' && (
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
            )}
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
