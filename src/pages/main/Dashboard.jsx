import React from 'react';
import styles from './Dashboard.module.scss'; // styles import

// 통계 데이터를 정의합니다. 실제 애플리케이션에서는 API를 통해 가져올 수 있습니다.
const stats = [
  { label: '출근', count: 70, percent: 58.3, total: 261 },
  { label: '지각', count: 5, percent: 12, total: 261 },
  { label: '외출', count: 12, percent: 30.6, total: 261 },
  { label: '반차', count: 4, percent: 42, total: 261 },
  { label: '연차', count: 2, percent: 3, total: 261 },
];

// 대시보드 왼쪽 영역: 통계 현황을 보여주는 컴포넌트
function DashboardStats() {
  return (
    <div className={styles.dashboardStats}>
      {/* 동그라미 형태로 각 통계의 카운트를 보여줍니다. */}
      <div className={styles.statCircles}>
        {stats.map((s) => (
          <div className={styles.statCircle} key={s.label}>
            <div className={styles.statCount}>{s.count}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* 막대 그래프 형태로 각 통계의 현황을 보여줍니다. */}
      <div className={styles.statBars}>
        {stats.map((s) => (
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
                style={{ width: `${s.percent}%` }} // percent 값에 따라 막대 너비 조절
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
