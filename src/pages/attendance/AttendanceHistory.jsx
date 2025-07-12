import React, { useState } from 'react';
import styles from './AttendanceHistory.module.scss';

const AttendanceHistory = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getFullYear() +
      '-' +
      String(new Date().getMonth() + 1).padStart(2, '0'),
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 샘플 데이터
  const attendanceData = [
    {
      date: '2024-01-01',
      dayOfWeek: '월',
      checkIn: '09:00',
      checkOut: '18:00',
      workHours: 9,
      status: '정상',
      overtime: 1,
    },
    {
      date: '2024-01-02',
      dayOfWeek: '화',
      checkIn: '08:45',
      checkOut: '18:30',
      workHours: 9.75,
      status: '정상',
      overtime: 1.75,
    },
    {
      date: '2024-01-03',
      dayOfWeek: '수',
      checkIn: '09:15',
      checkOut: '18:00',
      workHours: 8.75,
      status: '지각',
      overtime: 0.75,
    },
    {
      date: '2024-01-04',
      dayOfWeek: '목',
      checkIn: '09:00',
      checkOut: '17:30',
      workHours: 8.5,
      status: '정상',
      overtime: 0.5,
    },
    {
      date: '2024-01-05',
      dayOfWeek: '금',
      checkIn: '08:30',
      checkOut: '18:00',
      workHours: 9.5,
      status: '정상',
      overtime: 1.5,
    },
  ];

  const monthlyStats = {
    totalWorkDays: 22,
    totalWorkHours: 176,
    averageWorkHours: 8,
    lateDays: 2,
    overtimeHours: 12,
    vacationDays: 1,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '정상':
        return 'statusNormal';
      case '지각':
        return 'statusLate';
      case '결근':
        return 'statusAbsent';
      case '휴가':
        return 'statusVacation';
      default:
        return 'statusNormal';
    }
  };

  return (
    <div className={styles.attendanceHistory}>
      <div className={styles.historyHeader}>
        <h1>근태 기록 조회</h1>
        <div className={styles.filterControls}>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={styles.yearSelect}
          >
            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() - i,
            ).map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={styles.monthSelect}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={String(month).padStart(2, '0')}>
                {month}월
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 월간 통계 카드 */}
      <div className={styles.monthlyStats}>
        <div className={styles.statsCard}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{monthlyStats.totalWorkDays}</div>
            <div className={styles.statLabel}>총 근무일</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              {monthlyStats.totalWorkHours}
            </div>
            <div className={styles.statLabel}>총 근무시간</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              {monthlyStats.averageWorkHours}
            </div>
            <div className={styles.statLabel}>평균 근무시간</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{monthlyStats.lateDays}</div>
            <div className={styles.statLabel}>지각일</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{monthlyStats.overtimeHours}</div>
            <div className={styles.statLabel}>초과근무시간</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{monthlyStats.vacationDays}</div>
            <div className={styles.statLabel}>휴가일</div>
          </div>
        </div>
      </div>

      {/* 근태 기록 테이블 */}
      <div className={styles.attendanceTableContainer}>
        <div className={styles.tableHeader}>
          <h2>
            {selectedYear}년 {selectedMonth}월 근태 기록
          </h2>
          <button className={styles.btnExport}>엑셀 다운로드</button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.attendanceTable}>
            <thead>
              <tr>
                <th>날짜</th>
                <th>요일</th>
                <th>출근시간</th>
                <th>퇴근시간</th>
                <th>근무시간</th>
                <th>초과근무</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td>
                  <td>{record.dayOfWeek}</td>
                  <td>{record.checkIn}</td>
                  <td>{record.checkOut}</td>
                  <td>{record.workHours}시간</td>
                  <td>{record.overtime}시간</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${styles[getStatusColor(record.status)]}`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className={styles.pagination}>
        <button className={styles.btnPrev}>이전</button>
        <div className={styles.pageNumbers}>
          <span className={`${styles.pageNumber} ${styles.active}`}>1</span>
          <span className={styles.pageNumber}>2</span>
          <span className={styles.pageNumber}>3</span>
        </div>
        <button className={styles.btnNext}>다음</button>
      </div>
    </div>
  );
};

export default AttendanceHistory;
