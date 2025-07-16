import React, { useEffect, useRef, useState, useContext } from 'react';
import styles from './Dashboard.module.scss'; // styles import
import { attendanceService } from '../../services/attendanceService';
import AuthContext from '../../context/UserContext';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// 통계 데이터를 정의합니다. 실제 애플리케이션에서는 API를 통해 가져올 수 있습니다.
const stats = [
  { label: '출근', count: 70, percent: 58.3, total: 261, color: '#66be80' },
  { label: '지각', count: 5, percent: 12, total: 261, color: '#f7b731' },
  { label: '외출', count: 12, percent: 30.6, total: 261, color: '#eb3b5a' },
  { label: '반차', count: 4, percent: 42, total: 261, color: '#4b7bec' },
  { label: '연차', count: 2, percent: 3, total: 261, color: '#8854d0' },
];

// 대시보드 왼쪽 영역: 통계 현황을 보여주는 컴포넌트
function DashboardStats() {
  const barRefs = useRef([]);
  const countRefs = useRef([]);

  useEffect(() => {
    // 게이지 애니메이션
    stats.forEach((s, idx) => {
      const bar = barRefs.current[idx];
      if (bar) {
        let start = 0;
        const end = s.percent;
        const duration = 1200;
        const frameRate = 1000 / 60;
        const totalFrames = Math.round(duration / frameRate);
        let frame = 0;
        function animate() {
          frame++;
          const progress = Math.min(frame / totalFrames, 1);
          const current = start + (end - start) * progress;
          bar.style.width = current + '%';
          bar.style.background = s.color;
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        }
        bar.style.width = '0%';
        requestAnimationFrame(animate);
      }
    });
    // 카운트 애니메이션
    stats.forEach((s, idx) => {
      const countEl = countRefs.current[idx];
      if (countEl) {
        let start = 0;
        const end = s.count;
        const duration = 1000;
        const frameRate = 1000 / 60;
        const totalFrames = Math.round(duration / frameRate);
        let frame = 0;
        function animateCount() {
          frame++;
          const progress = Math.min(frame / totalFrames, 1);
          const current = Math.round(start + (end - start) * progress);
          countEl.textContent = current;
          if (progress < 1) {
            requestAnimationFrame(animateCount);
          }
        }
        countEl.textContent = '0';
        requestAnimationFrame(animateCount);
      }
    });
  }, []);

  return (
    <div className={styles.dashboardStats}>
      <div className={styles.statCircles}>
        {stats.map((s, idx) => (
          <div className={styles.statCircle} key={s.label}>
            <div
              className={styles.statCount}
              ref={(el) => (countRefs.current[idx] = el)}
              style={{ background: s.color }}
            >
              0
            </div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className={styles.statBars}>
        {stats.map((s, idx) => (
          <div className={styles.statBarRow} key={s.label}>
            <div className={styles.statBarHead}>
              <span className={styles.statBarLabel}>{s.label}현황</span>
              <span className={styles.statBarValue}>
                {s.percent}% ({s.count}/{s.total}일)
              </span>
            </div>
            <div className={styles.statBarBg}>
              <div
                className={styles.statBarFg}
                ref={(el) => (barRefs.current[idx] = el)}
                style={{ width: 0, background: s.color }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 대시보드 오른쪽 영역: 사용자 프로필 및 출근표를 보여주는 컴포넌트
function DashboardProfile() {
  const { user } = useContext(AuthContext);
  const [attendanceData, setAttendanceData] = useState({
    checkInTime: null,
    checkOutTime: null,
    goOutTime: null,
    returnTime: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  // 현재 시각/날짜 상태
  const [now, setNow] = useState(() => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}시 ${d.getMinutes().toString().padStart(2, '0')}분 ${d.getSeconds().toString().padStart(2, '0')}초`;
  });
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNow(
        `${d.getHours().toString().padStart(2, '0')}시 ${d.getMinutes().toString().padStart(2, '0')}분 ${d.getSeconds().toString().padStart(2, '0')}초`,
      );
      setDate(
        `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`,
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 오늘의 출근 데이터 가져오기
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      setIsLoading(true);
      try {
        // 백엔드에서 오늘의 출근 데이터 가져오기
        const response = await attendanceService.getTodayAttendance();

        if (response.success && response.result) {
          setAttendanceData({
            checkInTime: response.result.checkInTime,
            checkOutTime: response.result.checkOutTime,
            goOutTime: response.result.goOutTime,
            returnTime: response.result.returnTime,
          });
        }
      } catch (error) {
        console.error('오늘의 출근 데이터 조회 실패:', error);
        // 에러 시 sessionStorage에서 가져오기 (fallback)
        const todayCheckIn = sessionStorage.getItem('TODAY_CHECK_IN');
        const todayCheckOut = sessionStorage.getItem('TODAY_CHECK_OUT');
        const todayGoOut = sessionStorage.getItem('TODAY_GO_OUT');
        const todayReturn = sessionStorage.getItem('TODAY_RETURN');

        setAttendanceData({
          checkInTime: todayCheckIn,
          checkOutTime: todayCheckOut,
          goOutTime: todayGoOut,
          returnTime: todayReturn,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayAttendance();
  }, []);

  // 시간 포맷팅 함수
  const formatTime = (time) => {
    if (!time) return '00:00';

    // Date 객체인 경우
    if (time instanceof Date) {
      return time.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }

    // 문자열인 경우 (ISO 형식 등)
    if (typeof time === 'string') {
      try {
        const date = new Date(time);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        }
        // 이미 HH:mm 형식인 경우
        if (time.match(/^\d{2}:\d{2}$/)) {
          return time;
        }
      } catch (e) {
        // 파싱 실패 시 원본 반환
        return time;
      }
    }

    return '00:00';
  };

  // 출근 상태에 따른 상태 텍스트 반환
  const getAttendanceStatus = () => {
    if (attendanceData.checkOutTime) {
      return { text: '퇴근완료', color: '#ccc' };
    } else if (attendanceData.returnTime) {
      return { text: '복귀완료', color: '#66be80' };
    } else if (attendanceData.goOutTime) {
      return { text: '외출중', color: '#f7b731' };
    } else if (attendanceData.checkInTime) {
      return { text: '출근중', color: '#4b7bec' };
    } else {
      return { text: '미출근', color: '#eb3b5a' };
    }
  };

  const statusInfo = getAttendanceStatus();

  return (
    <div className={styles.dashboardProfile}>
      <div className={styles.profileUpper}>
        {/* 프로필 이미지 영역 */}
        <div className={styles.profileImgbox}>
          {user?.profileImage ? (
            <img
              className={styles.profileImg}
              src={user.profileImage}
              alt='프로필'
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '10px',
                display: 'block',
              }}
            />
          ) : (
            <div className={styles.profileImg}></div>
          )}
        </div>
        {/* 프로필 정보 영역 */}
        <div className={styles.profileInfo}>
          <div className={styles.profileTitle}>
            {user?.userName || '-'} {user?.positionName || ''}
            <span className={styles.profileTeam}>
              ({user?.department || ''})
            </span>
          </div>
          <hr /> {/* 구분선 */}
          <ul>
            <li>
              <span className={styles.profilePin} />
              입사일
              <span className={styles.profileValue}>
                {user?.hireDate || '-'}
              </span>
            </li>
            <li>
              <span className={styles.profilePin} />
              연차 수<span className={styles.profileValue}>0개</span>
            </li>
            <li>
              <span className={styles.profilePin} />
              연차 요청수
              <span className={styles.profileValue}>0개</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 현재 연월일/시각 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 0 32px 0',
          width: '100%',
          gap: 32,
        }}
      >
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#25663b',
            letterSpacing: 1,
            fontFamily: 'inherit',
            textAlign: 'center',
            minWidth: 140,
          }}
        >
          {date}
        </span>
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#25663b',
            letterSpacing: 1,
            fontFamily: 'inherit',
            textAlign: 'center',
            minWidth: 180,
          }}
        >
          {now}
        </span>
      </div>

      {/* 출근 상태 표시 박스 완전 삭제! */}

      {/* 출근표 테이블 영역 */}
      <div className={styles.profileTable}>
        <div className={styles.profileTableRow}>
          <div
            className={`${styles.profileTableCell} ${styles.cellHead} ${styles.cellGreen}`}
          >
            출근
          </div>
          <div className={styles.profileTableCell}>
            {formatTime(attendanceData.checkInTime)}
          </div>
          <div className={`${styles.profileTableCell} ${styles.cellHead}`}>
            퇴근
          </div>
          <div className={styles.profileTableCell}>
            {formatTime(attendanceData.checkOutTime)}
          </div>
        </div>
        <div className={styles.profileTableRow}>
          <div className={`${styles.profileTableCell} ${styles.cellHead}`}>
            외출
          </div>
          <div className={styles.profileTableCell}>
            {formatTime(attendanceData.goOutTime)}
          </div>
          <div
            className={`${styles.profileTableCell} ${styles.cellHead} ${styles.cellGreen}`}
          >
            복귀
          </div>
          <div className={styles.profileTableCell}>
            {formatTime(attendanceData.returnTime)}
          </div>
        </div>
      </div>
    </div>
  );
}

// 메인 대시보드 컨테이너: DashboardStats와 DashboardProfile을 나란히 배치
export default function Dashboard() {
  return (
    <div className={styles.dashboardMain}>
      <DashboardStats />
      <DashboardProfile />
    </div>
  );
}
