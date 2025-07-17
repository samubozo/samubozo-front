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
  // 근태 관련 state는 attendanceData만 사용
  const [attendanceData, setAttendanceData] = useState({
    checkInTime: null,
    checkOutTime: null,
    goOutTime: null,
    returnTime: null,
  });
  const [step, setStep] = useState('출근'); // 출근, 외출, 복귀, 복귀완료
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
  const [memo, setMemo] = useState(localStorage.getItem('todayMemo') || '');
  const [remainingWorkTime, setRemainingWorkTime] = useState('00:00');
  const [workedHours, setWorkedHours] = useState('00:00');

  // 근태 상태를 attendanceData로부터 계산
  useEffect(() => {
    if (!attendanceData.checkInTime) {
      setStep('출근');
    } else if (attendanceData.checkInTime && !attendanceData.goOutTime) {
      setStep('외출');
    } else if (attendanceData.goOutTime && !attendanceData.returnTime) {
      setStep('복귀');
    } else if (attendanceData.returnTime) {
      setStep('복귀완료');
    }
  }, [attendanceData]);

  const handleMemoChange = (e) => {
    setMemo(e.target.value);
    localStorage.setItem('todayMemo', e.target.value);
  };

  // 출근/외출/복귀 버튼
  const handleAttendanceAction = async () => {
    setLoading(true);
    setError(null);
    try {
      if (step === '출근') {
        await attendanceService.checkIn();
      } else if (step === '외출') {
        await attendanceService.goOut();
      } else if (step === '복귀') {
        await attendanceService.returnFromOut();
      }
      // 성공 시 최신 데이터 다시 불러오기
      await fetchTodayAttendance();
    } catch (error) {
      setError(`${step} 처리 중 오류가 발생했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  // 퇴근 버튼
  const handleCheckOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await attendanceService.checkOut();
      // 성공 시 최신 데이터 다시 불러오기
      await fetchTodayAttendance();
    } catch (error) {
      setError('퇴근 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 오늘 근태 정보 불러오기 함수
  const fetchTodayAttendance = async () => {
    try {
      const result = await attendanceService.getTodayAttendance();
      setAttendanceData({
        checkInTime: result.checkInTime,
        checkOutTime: result.checkOutTime,
        goOutTime: result.goOutTime,
        returnTime: result.returnTime,
      });
    } catch (e) {
      setAttendanceData({
        checkInTime: null,
        checkOutTime: null,
        goOutTime: null,
        returnTime: null,
      });
    }
  };

  // 컴포넌트 마운트 시 오늘 근태 정보 불러오기
  useEffect(() => {
    fetchTodayAttendance();
    // eslint-disable-next-line
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

  // 요일별 문구 생성 함수
  const getDayMessage = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ...
    const dayName = getDayName(today);

    const messages = {
      1: '월요팅~!\n새로운 한 주의 시작! ', // 월요일
      2: '화요일, 일주일의 4일 금방입니다! ', // 화요일
      3: '수요일, 일주일의 절반 지나갔어요! ', // 수요일
      4: '목요일, 곧 주말이에요! ', // 목요일
      5: '금요일! 주말까지 한 걸음! ', // 금요일
    };

    return messages[dayOfWeek] || '오늘도 힘내세요! 💪';
  };

  // 현재 시간 기반 메시지 추가
  const getTimeMessage = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 9) return '좋은 아침입니다! ☀️';
    if (hour < 12) return '오전 업무 화이팅! 💼';
    if (hour < 14) return '점심 시간이에요! 🍽️';
    if (hour < 17) return '오후 업무 집중! 📊';
    if (hour < 19) return '퇴근 준비하세요! 🏠';
    return '오늘 하루도 수고하셨어요! 🌙';
  };

  // 시간대별 건강팁 함수
  const getHealthTip = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 9)
      return {
        tip: '오전: 물 마시기 권장 ',
        detail: '하루를 시작하는 물 한 잔!',
      };
    if (hour < 12)
      return { tip: '오전: 적절한 휴식 필요 ', detail: '20분마다 20초 휴식' };
    if (hour < 14)
      return { tip: '점심: 건강한 식사 시간 ', detail: '천천히 씹어서 먹기' };
    if (hour < 17)
      return { tip: '오후: 스트레칭 시간! ', detail: '목과 어깨 스트레칭' };
    if (hour < 19)
      return { tip: '저녁: 퇴근 준비 ', detail: '오늘 하루도 수고하셨어요!' };
    return { tip: '저녁: 휴식 시간 ', detail: '충분한 휴식 취하세요' };
  };

  useEffect(() => {
    let isMounted = true;

    const fetchWorkTime = async () => {
      try {
        const response = await attendanceService.getRemainingWorkTime();
        if (isMounted && response.data && response.data.result) {
          setRemainingWorkTime(response.data.result.remainingHours || '00:00');
          setWorkedHours(response.data.result.workedHours || '00:00');
        }
      } catch (e) {
        if (isMounted) {
          setRemainingWorkTime('00:00');
          setWorkedHours('00:00');
        }
      }
    };
    fetchWorkTime();
    const interval = setInterval(fetchWorkTime, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [
    attendanceData.checkInTime,
    attendanceData.goOutTime,
    attendanceData.returnTime,
    attendanceData.checkOutTime,
  ]);

  // 연차 현황 상태 추가
  const [vacationBalance, setVacationBalance] = useState({
    totalGranted: 0,
    usedDays: 0,
    remainingDays: 0,
  });
  const [vacationLoading, setVacationLoading] = useState(true);
  const [vacationError, setVacationError] = useState(null);

  // 연차 현황 불러오기
  useEffect(() => {
    let isMounted = true;
    const fetchVacationBalance = async () => {
      setVacationLoading(true);
      setVacationError(null);
      try {
        const response = await attendanceService.getVacationBalance();
        console.log('vacation balance API response:', response.data.result);
        if (isMounted && response.data && response.data.result) {
          setVacationBalance(response.data.result);
          console.log('setVacationBalance:', response.data.result);
        }
      } catch (e) {
        if (isMounted) setVacationError('연차 현황을 불러오지 못했습니다.');
      } finally {
        if (isMounted) setVacationLoading(false);
      }
    };
    fetchVacationBalance();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={styles.attendanceDashboard}>
      {/* 에러 메시지 표시 */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* 상단 대시보드 그리드 */}
      <div className={styles.dashboardGrid}>
        {/* 메인 컨텐츠 */}
        <main className={styles.mainContent}>
          <div className={`${styles.card} ${styles.actionsCard}`}>
            <div className={styles.actionsGrid}>
              <div className={styles.actionItem}>
                <div className={styles.cardLabel}>
                  {step === '출근' || step === '외출'
                    ? '출근'
                    : step === '복귀'
                      ? '외출'
                      : '복귀'}
                </div>
                <div className={styles.cardValue}>
                  {step === '출근' && '00:00'}
                  {step === '외출' && getTimeStr(attendanceData.checkInTime)}
                  {step === '복귀' && getTimeStr(attendanceData.goOutTime)}
                  {step === '복귀완료' && getTimeStr(attendanceData.returnTime)}
                </div>
                <button
                  className={styles.cardButton}
                  onClick={handleAttendanceAction}
                  disabled={
                    loading ||
                    attendanceData.checkOutTime ||
                    step === '복귀완료'
                  }
                >
                  {loading
                    ? '처리중...'
                    : step === '출근'
                      ? '출근하기'
                      : step === '외출'
                        ? '외출하기'
                        : step === '복귀'
                          ? '복귀하기'
                          : '복귀완료'}
                </button>
              </div>
              <div className={styles.actionItem}>
                <div className={styles.cardLabel}>퇴근</div>
                <div className={styles.cardValue}>
                  {getTimeStr(attendanceData.checkOutTime)}
                </div>
                <button
                  className={styles.cardButton}
                  onClick={handleCheckOut}
                  disabled={
                    loading ||
                    !attendanceData.checkInTime ||
                    attendanceData.checkOutTime
                  }
                >
                  {loading
                    ? '처리중...'
                    : attendanceData.checkOutTime
                      ? '퇴근완료'
                      : '퇴근하기'}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.horizontalCardContainer}>
            <div className={styles.verticalCardContainer}>
              <div className={`${styles.card} ${styles.workTimeCard}`}>
                <div className={styles.cardLabel}>내 근무 시간</div>
                <div className={styles.workTimeBody}>
                  <div className={styles.workTimeItem}>
                    <span>남은 근무 시간</span>
                    <span className={styles.timeValue}>
                      {remainingWorkTime}
                    </span>
                  </div>
                  <div className={styles.workTimeItem}>
                    <span>근무한 시간</span>
                    <span className={styles.timeValue}>{workedHours}</span>
                  </div>
                </div>
              </div>

              <div className={`${styles.card} ${styles.todayMessageCard}`}>
                <div className={styles.cardLabel}>오늘의 한마디</div>
                <div className={styles.mainMessage}>{getDayMessage()}</div>
                <div className={styles.cardSub}>
                  {getHealthTip().tip}
                  <br />
                  {getHealthTip().detail}
                </div>
              </div>
            </div>
            {/* New card for the graph */}
            <div className={`${styles.card} ${styles.graphCard}`}>
              <div className={styles.cardLabel}>연차 사용률</div>
              {vacationLoading && <div>연차 정보 불러오는 중...</div>}
              {vacationError && (
                <div style={{ color: 'red' }}>{vacationError}</div>
              )}
              <div className={styles.circleGraphBox}>
                <svg width='160' height='160' className={styles.circleGraph}>
                  <circle
                    cx='80'
                    cy='80'
                    r='70'
                    fill='none'
                    stroke='#e0e0e0'
                    strokeWidth='12'
                  />
                  <circle
                    cx='80'
                    cy='80'
                    r='70'
                    fill='none'
                    stroke='#4caf50'
                    strokeWidth='12'
                    strokeDasharray={2 * Math.PI * 70}
                    strokeDashoffset={
                      2 *
                      Math.PI *
                      70 *
                      (1 -
                        (vacationBalance.totalGranted > 0
                          ? vacationBalance.usedDays /
                            vacationBalance.totalGranted
                          : 0))
                    }
                    style={{ transition: 'stroke-dashoffset 0.6s' }}
                  />
                </svg>
                <div className={styles.graphCenter}>
                  <div className={styles.percentText}>
                    {vacationBalance.totalGranted > 0
                      ? `${Math.round(
                          (vacationBalance.usedDays /
                            vacationBalance.totalGranted) *
                            100,
                        )}%`
                      : '0%'}
                  </div>
                  <div className={styles.usageLabel}>사용률</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 사이드바 */}
        <aside className={styles.sidebar}>
          <div className={styles.dashboardDateTimeInfo}>
            {`${today.getFullYear()}.${String(today.getMonth() + 1).padStart(
              2,
              '0',
            )}.${String(today.getDate()).padStart(2, '0')} ${getDayName(
              today,
            )} / ${getTimeStrWithSec(currentTime)}`}
          </div>

          <div className={`${styles.card} ${styles.vacationCard}`}>
            <div className={styles.cardLabel}>연차 현황</div>
            {vacationLoading ? (
              <div>연차 정보 불러오는 중...</div>
            ) : vacationError ? (
              <div style={{ color: 'red' }}>{vacationError}</div>
            ) : (
              <div className={styles.vacationContent}>
                <div className={styles.leaveDetails}>
                  <div className={styles.leaveRow}>
                    <span className={styles.leaveLabel}>남은 연차</span>
                    <span className={styles.leaveValue}>
                      {vacationBalance.remainingDays}
                    </span>
                  </div>
                  <div className={styles.leaveRow}>
                    <span className={styles.leaveLabel}>사용 연차</span>
                    <span className={styles.leaveValue}>
                      {vacationBalance.usedDays}
                    </span>
                  </div>
                  <div className={styles.leaveRow}>
                    <span className={styles.leaveLabel}>총 연차</span>
                    <span className={styles.leaveValue}>
                      {vacationBalance.totalGranted}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {/* 연차 사용법 안내 */}
            <div
              style={{
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid #e9ecef',
                fontSize: '0.8em',
                color: '#666',
                lineHeight: '1.4',
              }}
            >
              <div
                style={{
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: '#388e3c',
                  fontSize: '0.9em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '0.8em' }}>📋</span>
                연차 사용법
              </div>
              <ul
                style={{
                  margin: '0',
                  padding: '0',
                  fontSize: '0.85em',
                  listStyle: 'none',
                }}
              >
                <li
                  style={{
                    marginBottom: '3px',
                    paddingLeft: '16px',
                    position: 'relative',
                    color: '#5a5a5a',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: '0',
                      color: '#4caf50',
                      fontSize: '0.7em',
                    }}
                  >
                    ●
                  </span>
                  연차는 1일 단위로 사용 가능합니다.
                </li>
                <li
                  style={{
                    marginBottom: '3px',
                    paddingLeft: '16px',
                    position: 'relative',
                    color: '#5a5a5a',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: '0',
                      color: '#4caf50',
                      fontSize: '0.7em',
                    }}
                  >
                    ●
                  </span>
                  반차는 오전/오후로 나누어 사용 가능합니다.
                </li>
                <li
                  style={{
                    marginBottom: '3px',
                    paddingLeft: '16px',
                    position: 'relative',
                    color: '#5a5a5a',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: '0',
                      color: '#4caf50',
                      fontSize: '0.7em',
                    }}
                  >
                    ●
                  </span>
                  연차 신청은 최소 1일 전에 해주세요.
                </li>
              </ul>
            </div>
          </div>

          <div className={`${styles.card} ${styles.requestCard}`}>
            <div className={styles.cardLabel}>부재/휴가</div>
            <div className={styles.cardButtonRow}>
              <button className={styles.cardButtonSub} onClick={handleAbsence}>
                부재 등록
              </button>
              <button className={styles.cardButtonSub} onClick={handleVacation}>
                휴가 신청
              </button>
            </div>
          </div>
        </aside>
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
      {showVacation && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.modalClose} onClick={closeModal}>
              ×
            </button>
            <VacationRequest onClose={closeModal} />
          </div>
        </div>
      )}
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
