import React, { useEffect, useRef, useState } from 'react';
import styles from './Dashboard.module.scss'; // styles import
import { attendanceService } from '../../services/attendanceService';

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

// 대시보드 왼쪽 영역: 통계 현황을 보여주는 컴포넌트
function DashboardStats({ refresh }) {
  const barRefs = useRef([]);
  const countRefs = useRef([]);
  const [stats, setStats] = useState([
    { label: '출근', count: 0, percent: 0, total: 0, color: '#66be80' },
    { label: '지각', count: 0, percent: 0, total: 0, color: '#f7b731' },
    { label: '외출', count: 0, percent: 0, total: 0, color: '#eb3b5a' },
    { label: '반차', count: 0, percent: 0, total: 0, color: '#4b7bec' },
    { label: '연차', count: 0, percent: 0, total: 0, color: '#8854d0' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      try {
        const res = await attendanceService.getPersonalStats(year, month);
        const d = res.result;
        console.log('API result:', d); // ← 실제 값 확인
        // total은 모든 카운트의 합
        const total =
          (d.attendanceCount || 0) +
          (d.lateCount || 0) +
          (d.goOutCount || 0) +
          (d.halfDayVacationCount || 0) +
          (d.fullDayVacationCount || 0);
        setStats([
          {
            label: '출근',
            count: d.attendanceCount || 0,
            percent: total
              ? (((d.attendanceCount || 0) / total) * 100).toFixed(1)
              : 0,
            total,
            color: '#66be80',
          },
          {
            label: '지각',
            count: d.lateCount || 0,
            percent: total
              ? (((d.lateCount || 0) / total) * 100).toFixed(1)
              : 0,
            total,
            color: '#f7b731',
          },
          {
            label: '외출',
            count: d.goOutCount || 0,
            percent: total
              ? (((d.goOutCount || 0) / total) * 100).toFixed(1)
              : 0,
            total,
            color: '#eb3b5a',
          },
          {
            label: '반차',
            count: d.halfDayVacationCount || 0,
            percent: total
              ? (((d.halfDayVacationCount || 0) / total) * 100).toFixed(1)
              : 0,
            total,
            color: '#4b7bec',
          },
          {
            label: '연차',
            count: d.fullDayVacationCount || 0,
            percent: total
              ? (((d.fullDayVacationCount || 0) / total) * 100).toFixed(1)
              : 0,
            total,
            color: '#8854d0',
          },
        ]);
        console.log('setStats:', [
          d.attendanceCount || 0,
          d.lateCount || 0,
          d.goOutCount || 0,
          d.halfDayVacationCount || 0,
          d.fullDayVacationCount || 0,
        ]);
      } catch (e) {
        setStats([
          { label: '출근', count: 0, percent: 0, total: 0, color: '#66be80' },
          { label: '지각', count: 0, percent: 0, total: 0, color: '#f7b731' },
          { label: '외출', count: 0, percent: 0, total: 0, color: '#eb3b5a' },
          { label: '반차', count: 0, percent: 0, total: 0, color: '#4b7bec' },
          { label: '연차', count: 0, percent: 0, total: 0, color: '#8854d0' },
        ]);
      }
    };
    fetchStats();
  }, [refresh]);

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
  }, [stats]);

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
function DashboardProfile({ onAttendanceChange }) {
  // 1. 안전한 초기값
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

  // 2. useEffect에서 오늘 근태 기록만으로 상태 갱신
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      const response = await attendanceService.getTodayAttendance();
      setAttendanceData({
        checkInTime: response.checkInTime,
        checkOutTime: response.checkOutTime,
        goOutTime: response.goOutTime,
        returnTime: response.returnTime,
      });
    };
    fetchTodayAttendance();
  }, []);

  // 3. 근태 관련 버튼 클릭 시 핸들러 예시 (실제 버튼에 연결 필요)
  const handleCheckIn = async () => {
    await attendanceService.checkIn();
    await fetchTodayAttendance();
    if (onAttendanceChange) onAttendanceChange();
  };
  const handleGoOut = async () => {
    await attendanceService.goOut();
    const today = await attendanceService.getTodayAttendance();
    setAttendanceData({
      checkInTime: today.checkInTime,
      checkOutTime: today.checkOutTime,
      goOutTime: today.goOutTime,
      returnTime: today.returnTime,
    });
    if (onAttendanceChange) onAttendanceChange();
  };
  const handleReturn = async () => {
    await attendanceService.returnFromOut();
    const today = await attendanceService.getTodayAttendance();
    setAttendanceData({
      checkInTime: today.checkInTime,
      checkOutTime: today.checkOutTime,
      goOutTime: today.goOutTime,
      returnTime: today.returnTime,
    });
    if (onAttendanceChange) onAttendanceChange();
  };
  const handleCheckOut = async () => {
    await attendanceService.checkOut();
    const today = await attendanceService.getTodayAttendance();
    setAttendanceData({
      checkInTime: today.checkInTime,
      checkOutTime: today.checkOutTime,
      goOutTime: today.goOutTime,
      returnTime: today.returnTime,
    });
    if (onAttendanceChange) onAttendanceChange();
  };

  // 시간 포맷팅 함수
  const formatTime = (time) => {
    if (!time) return '00:00';
    // ISO 문자열(2025-07-15T00:25:53.616548 등) → 'HH:mm'으로 변환
    if (typeof time === 'string' && time.includes('T')) {
      const date = new Date(time);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      }
    }
    // 이미 HH:mm 형식이면 그대로 반환
    if (typeof time === 'string' && time.match(/^\d{2}:\d{2}$/)) {
      return time;
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

  // 렌더링 직전 attendanceData 값 로그
  console.log('attendanceData:', attendanceData);

  return (
    <div className={styles.dashboardProfile}>
      <div className={styles.profileUpper}>
        {/* 프로필 이미지 영역 */}
        <div className={styles.profileImgbox}>
          <div className={styles.profileImgLabel}>Profile</div>
          <div className={styles.profileImg}></div>{' '}
          {/* 실제 이미지 삽입 가능 */}
        </div>
        {/* 프로필 정보 영역 */}
        <div className={styles.profileInfo}>
          <div className={styles.profileTitle}>
            신현국 팀장<span className={styles.profileTeam}>(경영지원)</span>
          </div>
          <hr /> {/* 구분선 */}
          <ul>
            <li>
              <span className={styles.profilePin} />
              입사일
              <span className={styles.profileValue}>2025-06-20</span>
            </li>
            <li>
              <span className={styles.profilePin} />
              연차 수<span className={styles.profileValue}>10개</span>
            </li>
            <li>
              <span className={styles.profilePin} />
              연차 요청수
              <span className={styles.profileValue}>1개</span>
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
  const [refreshStats, setRefreshStats] = useState(0);
  return (
    <div className={styles.dashboardMain}>
      <DashboardStats refresh={refreshStats} />
      <DashboardProfile
        onAttendanceChange={() => setRefreshStats((v) => v + 1)}
      />
    </div>
  );
}
