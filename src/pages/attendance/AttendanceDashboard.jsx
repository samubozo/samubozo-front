import React, { useState, useEffect } from 'react';
import styles from './AttendanceDashboard.module.scss';
import VacationRequest from './VacationRequest';

function pad(num) {
  return num.toString().padStart(2, '0');
}
function getTimeStr(date) {
  // Date 객체 -> "hh:mm" 문자열
  if (!date) return '00:00';
  return pad(date.getHours()) + ':' + pad(date.getMinutes());
}

function getMonthDays(year, month) {
  // month: 1~12
  const last = new Date(year, month, 0).getDate();
  return Array.from({ length: last }, (_, i) => i + 1);
}
function getDayName(date) {
  // 요일 한글로 변환
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}
function getDayColor(dayIdx) {
  if (dayIdx === 0) return styles.sunday;
  if (dayIdx === 6) return styles.saturday;
  return '';
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.modalClose} onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default function AttendanceDashboard() {
  const today = new Date(2025, 5, 20); // 2025-06-20 (금)
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [showVacation, setShowVacation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 2025년 6월 달력 데이터
  const year = 2025,
    month = 6;
  const days = getMonthDays(year, month);

  const handleCheckIn = () => setCheckIn(new Date());
  const handleCheckOut = () => setCheckOut(new Date());
  const handleVacation = () => setShowVacation(true);
  const closeModal = () => setShowVacation(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  function getTimeStrWithSec(date) {
    if (!date) return '00:00:00';
    return (
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds())
    );
  }

  return (
    <div className={styles.attendanceDashboard}>
      {/* 상단 헤더: 이미지처럼 3단 테이블로 배치 */}
      <div className={styles.dashboardHeaderTable}>
        {/* 왼쪽: 원형 그래프+연차 정보 (가로 배치) */}

        <div className={styles.leftFlexBox}>
          <div className={styles.circleGraphBox}>
            <svg width='154' height='154' className={styles.circleGraph}>
              <circle
                cx='77'
                cy='77'
                r='68'
                fill='none'
                stroke='#e0e0e0'
                strokeWidth='8'
              />
              <circle
                cx='77'
                cy='77'
                r='68'
                fill='none'
                stroke='#4caf50'
                strokeWidth='8'
                strokeDasharray='428'
                strokeDashoffset='117'
              />
            </svg>
            <div className={styles.percentText}>73%</div>
            <div className={styles.usageLabel}>사용률</div>
          </div>
          <table className={styles.leaveTable}>
            <tbody>
              <tr>
                <td>남은 연차</td>
                <td>4.5</td>
              </tr>
              <tr>
                <td>사용 연차</td>
                <td>7.5</td>
              </tr>
              <tr>
                <td>총 연차</td>
                <td>12</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 가운데: 내 근무 시간 (세로 가운데 정렬) */}
        <div className={styles.workTimeBox}>
          <table className={styles.workTimeTable}>
            <thead>
              <tr>
                <th colSpan={2}>내 근무 시간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>남은 근무 시간</td>
                <td>-</td>
              </tr>
              <tr>
                <td>근무한 시간</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 오른쪽: 출근/퇴근/휴가신청 (세로 가운데 정렬) */}
        <div className={styles.rightCell}>
          <div className={styles.rightFlexBox}>
            <div className={styles.rightTableWrap}>
              <table className={styles.rightTable}>
                <thead>
                  <tr>
                    <th colSpan={6} className={styles.todayTitle}>
                      <b>2025.06.20 금요일</b>
                    </th>
                  </tr>
                  <tr>
                    <th colSpan={6} className={styles.centerTime}>
                      현재 시각: {getTimeStrWithSec(currentTime)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>출근</td>
                    <td>{getTimeStr(checkIn)}</td>
                    <td>퇴근</td>
                    <td>{getTimeStr(checkOut)}</td>
                    <td rowSpan={2}>
                      <button className={styles.btnSub}>부재 등록</button>
                    </td>
                    <td rowSpan={2}>
                      <button
                        className={styles.btnSub}
                        onClick={handleVacation}
                      >
                        휴가 신청
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={1}>
                      <button
                        className={styles.btnMain}
                        onClick={handleCheckIn}
                      >
                        출근하기
                      </button>
                    </td>
                    <td colSpan={1}>
                      <label className={styles.chkLabel}>
                        <input type='checkbox' /> 전일
                      </label>
                      <label className={styles.chkLabel}>
                        <input type='checkbox' /> 반일
                      </label>
                    </td>
                    <td colSpan={1}>
                      <button
                        className={styles.btnMain}
                        onClick={handleCheckOut}
                      >
                        퇴근하기
                      </button>
                    </td>
                    <td colSpan={1}>
                      <label className={styles.chkLabel}>
                        <input type='checkbox' /> 전일
                      </label>
                      <label className={styles.chkLabel}>
                        <input type='checkbox' /> 반일
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 근태 테이블 */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <button className={styles.btnNav}>{'<'}</button>
          <span className={styles.monthTitle}>
            {year}년 {month}월
          </span>
          <button className={styles.btnNav}>{'>'}</button>
          <button className={styles.btnToday}>오늘</button>
        </div>
        <table className={styles.attendanceTable}>
          <thead>
            <tr>
              <th>날짜</th>
              <th>출근</th>
              <th>퇴근</th>
              <th>부재</th>
              <th>합계</th>
              <th>정상</th>
              <th>연장</th>
              <th>심야</th>
              <th>날짜</th>
              <th>출근</th>
              <th>퇴근</th>
              <th>부재</th>
              <th>합계</th>
              <th>정상</th>
              <th>연장</th>
              <th>심야</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 15 }).map((_, i) => {
              const d1 = new Date(year, month - 1, i + 1);
              const d2 = new Date(year, month - 1, i + 16);
              return (
                <tr key={i}>
                  <td className={getDayColor(d1.getDay())}>
                    {i + 1}({getDayName(d1)})
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className={getDayColor(d2.getDay())}>
                    {i + 16}({getDayName(d2)})
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 휴가신청 모달 */}
      <Modal open={showVacation} onClose={closeModal}>
        <VacationRequest />
      </Modal>
    </div>
  );
}
