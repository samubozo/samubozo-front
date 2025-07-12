import React, { useState, useEffect } from 'react';
import styles from './AttendanceDashboard.module.scss';
import VacationRequest from './VacationRequest';
import AbsenceRegistrationModal from './AbsenceRegistrationModal';
import AbsenceEditModal from './AbsenceEditModal';
import { attendanceService } from '../../services/attendanceService';

function pad(num) {
  return num.toString().padStart(2, '0');
}
function getTimeStr(date) {
  // Date 객체 또는 시간 문자열 -> "hh:mm" 문자열
  if (!date) return '00:00';

  // 문자열인 경우 Date 객체로 변환
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // 유효한 Date 객체인지 확인
  if (isNaN(dateObj.getTime())) {
    return '00:00';
  }

  return pad(dateObj.getHours()) + ':' + pad(dateObj.getMinutes());
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
  const today = new Date();
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [goOut, setGoOut] = useState(null);
  const [returnFromOut, setReturnFromOut] = useState(null);
  const [currentAction, setCurrentAction] = useState('출근하기'); // 출근하기 -> 외출하기 -> 복귀하기
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVacation, setShowVacation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const days = getMonthDays(year, month);
  const [showAbsence, setShowAbsence] = useState(false);
  const [absences, setAbsences] = useState([]); // [{date, type, reason, ...}]
  const [editAbsence, setEditAbsence] = useState(null);
  const [todayRowIdx, setTodayRowIdx] = useState(today.getDate() - 1);

  const handleAttendanceAction = async () => {
    const userId = sessionStorage.getItem('USER_EMPLOYEE_NO');
    if (!userId) {
      setError('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (currentAction === '출근하기') {
        // 출근 처리
        const response = await attendanceService.checkIn();
        if (response.data.result) {
          setCheckIn(response.data.result.checkInTime);
          sessionStorage.setItem(
            'TODAY_CHECK_IN',
            response.data.result.checkInTime,
          );
          sessionStorage.setItem('IS_CHECKED_IN', 'true');
          setCurrentAction('외출하기');
        }
      } else if (currentAction === '외출하기') {
        // 외출 처리
        const response = await attendanceService.goOut();
        if (response.data.result) {
          setGoOut(response.data.result.goOutTime);
          sessionStorage.setItem(
            'TODAY_GO_OUT',
            response.data.result.goOutTime,
          );
          sessionStorage.setItem('IS_OUT', 'true');
          setCurrentAction('복귀하기');
        }
      } else if (currentAction === '복귀하기') {
        // 복귀 처리
        const response = await attendanceService.returnFromOut();
        if (response.data.result) {
          setReturnFromOut(response.data.result.returnTime);
          sessionStorage.setItem(
            'TODAY_RETURN',
            response.data.result.returnTime,
          );
          sessionStorage.setItem('IS_OUT', 'false');
          setCurrentAction('복귀완료');
        }
      }
    } catch (error) {
      setError(`${currentAction} 처리 중 오류가 발생했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    const userId = sessionStorage.getItem('USER_EMPLOYEE_NO');
    if (!userId) {
      setError('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await attendanceService.checkOut();
      if (response.data.result) {
        setCheckOut(response.data.result.checkOutTime);
        sessionStorage.setItem(
          'TODAY_CHECK_OUT',
          response.data.result.checkOutTime,
        );
        sessionStorage.setItem('IS_CHECKED_IN', 'false');
      }
    } catch (error) {
      setError('퇴근 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 오늘 출근 상태 확인
  useEffect(() => {
    const todayCheckIn = sessionStorage.getItem('TODAY_CHECK_IN');
    const todayCheckOut = sessionStorage.getItem('TODAY_CHECK_OUT');
    const todayGoOut = sessionStorage.getItem('TODAY_GO_OUT');
    const todayReturn = sessionStorage.getItem('TODAY_RETURN');

    if (todayCheckIn) {
      setCheckIn(todayCheckIn);
    }
    if (todayCheckOut) {
      setCheckOut(todayCheckOut);
    }
    if (todayGoOut) {
      setGoOut(todayGoOut);
    }
    if (todayReturn) {
      setReturnFromOut(todayReturn);
    }

    // 현재 액션 상태 결정
    if (!todayCheckIn) {
      setCurrentAction('출근하기');
    } else if (todayGoOut && !todayReturn) {
      setCurrentAction('복귀하기');
    } else if (todayReturn) {
      setCurrentAction('복귀완료');
    } else {
      setCurrentAction('외출하기');
    }
  }, []);
  const handleVacation = () => setShowVacation(true);
  const closeModal = () => setShowVacation(false);
  const handleAbsence = () => setShowAbsence(true);
  const closeAbsenceModal = () => setShowAbsence(false);
  const handleAbsenceSubmit = (absence) => {
    setAbsences((prev) => [...prev, absence]);
    setShowAbsence(false);
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const handleNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

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

  const handleEditAbsence = (absence) => {
    setEditAbsence(absence);
  };
  const closeEditAbsence = () => setEditAbsence(null);
  const handleUpdateAbsence = (updated) => {
    setAbsences((prev) => prev.map((a) => (a === editAbsence ? updated : a)));
    closeEditAbsence();
  };

  const handleToday = () => {
    // 이미 오늘 강조 상태면 해제, 아니면 오늘로 이동 및 강조
    if (
      year === today.getFullYear() &&
      month === today.getMonth() + 1 &&
      todayRowIdx === today.getDate() - 1
    ) {
      setTodayRowIdx(null);
    } else {
      setYear(today.getFullYear());
      setMonth(today.getMonth() + 1);
      setTodayRowIdx(today.getDate() - 1);
    }
  };

  return (
    <div className={styles.attendanceDashboard}>
      {/* 에러 메시지 표시 */}
      {error && <div className={styles.errorMessage}>{error}</div>}

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
                      <b>{`${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')} ${getDayName(today)}요일`}</b>
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
                    <td>
                      {(() => {
                        if (!checkIn) return '출근';
                        if (goOut && !returnFromOut) return '외출';
                        if (returnFromOut && !checkOut) return '복귀';
                        if (checkOut) return '출근';
                        return '출근';
                      })()}
                    </td>
                    <td>
                      {(() => {
                        if (!checkIn) return getTimeStr(checkIn);
                        if (goOut && !returnFromOut) return getTimeStr(goOut);
                        if (returnFromOut && !checkOut)
                          return getTimeStr(returnFromOut);
                        if (checkOut) return getTimeStr(checkIn);
                        return getTimeStr(checkIn);
                      })()}
                    </td>
                    <td>퇴근</td>
                    <td>{getTimeStr(checkOut)}</td>
                    <td rowSpan={3}>
                      <button className={styles.btnSub} onClick={handleAbsence}>
                        부재 등록
                      </button>
                    </td>
                    <td rowSpan={3}>
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
                        onClick={handleAttendanceAction}
                        disabled={loading || checkOut}
                      >
                        {loading ? '처리중...' : currentAction}
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
                        disabled={loading || !checkIn || checkOut}
                      >
                        {loading
                          ? '처리중...'
                          : checkOut
                            ? '퇴근완료'
                            : '퇴근하기'}
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
          <button className={styles.btnNav} onClick={handlePrevMonth}>
            {'<'}
          </button>
          <span className={styles.monthTitle}>
            {year}년 {month}월
          </span>
          <button className={styles.btnNav} onClick={handleNextMonth}>
            {'>'}
          </button>
          <button className={styles.btnToday} onClick={handleToday}>
            오늘
          </button>
        </div>
        <table className={styles.attendanceTable}>
          <thead>
            <tr>
              <th rowSpan={2}>날짜</th>
              <th rowSpan={2}>출근</th>
              <th rowSpan={2}>퇴근</th>
              <th rowSpan={2}>부재</th>
              <th colSpan={4}>근무시간</th>
              <th rowSpan={2}>날짜</th>
              <th rowSpan={2}>출근</th>
              <th rowSpan={2}>퇴근</th>
              <th rowSpan={2}>부재</th>
              <th colSpan={4}>근무시간</th>
            </tr>
            <tr>
              <th>합계</th>
              <th>정상</th>
              <th>연장</th>
              <th>심야</th>
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
              const d1str = d1.toISOString().slice(0, 10);
              const d2str = d2.toISOString().slice(0, 10);
              const absence1 = absences.find(
                (a) => a.startDate <= d1str && a.endDate >= d1str,
              );
              const absence2 = absences.find(
                (a) => a.startDate <= d2str && a.endDate >= d2str,
              );
              return (
                <tr key={i}>
                  <td
                    className={
                      year === today.getFullYear() &&
                      month === today.getMonth() + 1 &&
                      todayRowIdx === i &&
                      today.getDate() <= 15
                        ? styles.todayRow
                        : getDayColor(d1.getDay())
                    }
                  >
                    {i + 1}({getDayName(d1)})
                  </td>
                  <td></td>
                  <td></td>
                  <td>
                    {absence1 && (
                      <span
                        className={styles.absenceBtn}
                        style={{ cursor: 'pointer', display: 'inline-block' }}
                        onClick={() => handleEditAbsence(absence1)}
                        title='수정'
                      >
                        {absence1.type}
                      </span>
                    )}
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td
                    className={
                      year === today.getFullYear() &&
                      month === today.getMonth() + 1 &&
                      todayRowIdx === i &&
                      today.getDate() > 15
                        ? styles.todayRow
                        : getDayColor(d2.getDay())
                    }
                  >
                    {i + 16}({getDayName(d2)})
                  </td>
                  <td></td>
                  <td></td>
                  <td>
                    {absence2 && (
                      <span
                        className={styles.absenceBtn}
                        style={{ cursor: 'pointer', display: 'inline-block' }}
                        onClick={() => handleEditAbsence(absence2)}
                        title='수정'
                      >
                        {absence2.type}
                      </span>
                    )}
                  </td>
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
        <VacationRequest onClose={closeModal} />
      </Modal>
      {/* 부재등록 모달 */}
      <AbsenceRegistrationModal
        open={showAbsence}
        onClose={closeAbsenceModal}
        onSubmit={handleAbsenceSubmit}
      />
      <AbsenceEditModal
        open={!!editAbsence}
        onClose={closeEditAbsence}
        absence={editAbsence}
        onSubmit={handleUpdateAbsence}
      />
    </div>
  );
}
