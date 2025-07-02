import React, { useEffect, useRef, useState } from 'react';
import styles from './Dashboard.module.scss'; // styles import
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
              <span className={styles.profilePin} /> {/* 핀 아이콘 */}
              입사일
              <span className={styles.profileValue}>2025-06-20</span>
            </li>
            <li>
              <span className={styles.profilePin} />
              출근 시간
              <span className={styles.profileValue}>08:50</span>
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
      {/* 출근표 테이블 영역 */}
      <div className={styles.profileTable}>
        <div className={styles.profileTableRow}>
          <div
            className={`${styles.profileTableCell} ${styles.cellHead} ${styles.cellGreen}`}
          >
            출근
          </div>
          <div className={styles.profileTableCell}>08:50</div>
          <div className={`${styles.profileTableCell} ${styles.cellHead}`}>
            복귀
          </div>
          <div className={styles.profileTableCell}>00:00</div>
        </div>
        <div className={styles.profileTableRow}>
          <div className={`${styles.profileTableCell} ${styles.cellHead}`}>
            외출
          </div>
          <div className={styles.profileTableCell}>00:00</div>
          <div
            className={`${styles.profileTableCell} ${styles.cellHead} ${styles.cellGreen}`}
          >
            퇴근
          </div>
          <div className={styles.profileTableCell}>18:01</div>
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
