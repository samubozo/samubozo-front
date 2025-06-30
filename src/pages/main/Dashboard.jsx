import React from 'react';
import './Dashboard.scss';

const stats = [
  { label: "출근", count: 70, percent: 58.3, total: 261 },
  { label: "지각", count: 5, percent: 12, total: 261 },
  { label: "외출", count: 12, percent: 30.6, total: 261 },
  { label: "반차", count: 4, percent: 42, total: 261 },
  { label: "연차", count: 2, percent: 3, total: 261 },
];

function DashboardStats() {
  return (
    <div className="dashboard-stats">
      {/* 동그라미 카운터 */}
      <div className="stat-circles">
        {stats.map((s) => (
          <div className="stat-circle" key={s.label}>
            <div className="stat-count">{s.count}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      {/* 현황 그래프 */}
      <div className="stat-bars">
        {stats.map((s) => (
          <div className="stat-bar-row" key={s.label}>
            <div className="stat-bar-head">
              <span className="stat-bar-label">{s.label}현황</span>
              <span className="stat-bar-value">
                {s.percent}% ({s.count}/{s.total}일)
              </span>
            </div>
            <div className="stat-bar-bg">
              <div
                className="stat-bar-fg"
                style={{ width: `${s.percent}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// 오른쪽: 프로필/출근표
function DashboardProfile() {
  return (
    <div className='dashboard-profile'>
      <div className='profile-upper'>
        <div className='profile-imgbox'>
          <div className='profile-img-label'>Profile</div>
          <div className='profile-img'></div>
        </div>
        <div className='profile-info'>
          <div className='profile-title'>
            신현국 팀장<span className='profile-team'>(경영지원)</span>
          </div>
          <hr />
          <ul>
            <li>
              <span className='profile-pin' />
              입사일
              <span className='profile-value'>2025-06-20</span>
            </li>
            <li>
              <span className='profile-pin' />
              출근 시간
              <span className='profile-value'>08:50</span>
            </li>
            <li>
              <span className='profile-pin' />
              연차 수<span className='profile-value'>10개</span>
            </li>
            <li>
              <span className='profile-pin' />
              연차 요청수
              <span className='profile-value'>1개</span>
            </li>
          </ul>
        </div>
      </div>
      <div className='profile-table'>
        <div className='profile-table-row'>
          <div className='profile-table-cell cell-head cell-green'>출근</div>
          <div className='profile-table-cell'>08:50</div>
          <div className='profile-table-cell cell-head'>복귀</div>
          <div className='profile-table-cell'>00:00</div>
        </div>
        <div className='profile-table-row'>
          <div className='profile-table-cell cell-head'>외출</div>
          <div className='profile-table-cell'>00:00</div>
          <div className='profile-table-cell cell-head cell-green'>퇴근</div>
          <div className='profile-table-cell'>18:01</div>
        </div>
      </div>
    </div>
  );
}

// 메인 컨테이너: 왼쪽/오른쪽 나란히
export default function Dashboard() {
  return (
    <div className='dashboard-main'>
      <DashboardStats />
      <DashboardProfile />
    </div>
  );
}
