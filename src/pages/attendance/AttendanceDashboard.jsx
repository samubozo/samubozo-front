import React, { useState, useEffect } from 'react';
import styles from './AttendanceDashboard.module.scss';
import { getKoreaToday } from '../../utils/dateUtils';
import VacationRequest from './VacationRequest';
import AbsenceRegistrationModal from './AbsenceRegistrationModal';
import AbsenceEditModal from './AbsenceEditModal';
import SuccessModal from '../../components/SuccessModal';
import CheckoutConfirmModal from '../../components/CheckoutConfirmModal';
import { attendanceService } from '../../services/attendanceService';
import { approvalService } from '../../services/approvalService';

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

// 안전한 로컬 날짜 문자열 생성 함수 추가
function getDateStrLocal(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function AttendanceDashboard() {
  const today = new Date();
  // 근태 관련 state는 attendanceData만 사용
  const [attendanceData, setAttendanceData] = useState({
    checkInTime: null,
    checkOutTime: null,
    goOutTime: null,
    returnTime: null,
    isLate: false, // 지각 여부 추가
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
  const [showSuccessModal, setShowSuccessModal] = useState(false); // 성공 메시지 모달
  const [successMessage, setSuccessMessage] = useState(''); // 성공 메시지 내용
  const [todayHighlight, setTodayHighlight] = useState(false);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false); // 퇴근 확인 모달

  // 1. 월별 근태 데이터 상태 추가
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);

  // 2. 월별 근태 데이터 불러오기
  useEffect(() => {
    attendanceService.getMonthlyAttendance(year, month).then((res) => {
      setMonthlyAttendance(res.result || res.data?.result || []);
    });
  }, [year, month]);

  // 3. 날짜별 데이터 찾기 함수
  // 날짜 매칭 보완
  const getAttendanceByDate = (dateStr) => {
    const found = monthlyAttendance.find((a) => {
      return a.attendanceDate?.slice(0, 10) === dateStr;
    });
    return found;
  };

  // 4. 시간 포맷팅 함수 (ISO, HH:mm:ss 모두 지원)
  const formatTime = (time) => {
    if (!time) return '';
    if (typeof time === 'string' && time.includes('T')) {
      // ISO 형식: '2025-07-22T11:34:44.37815'
      const t = time.split('T')[1];
      return t ? t.slice(0, 5) : '';
    }
    if (typeof time === 'string' && time.match(/^\d{2}:\d{2}/)) {
      // '11:34:44.007' 등
      return time.slice(0, 5);
    }
    return '';
  };

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
    // 오늘이 휴가/부재일인지 체크
    // 한국 시간 기준 오늘 날짜
    const todayStr = getKoreaToday();
    const isVacation = absences.some(
      (a) =>
        a.startDate <= todayStr &&
        a.endDate >= todayStr &&
        (a.type === '연차' || a.type === 'ANNUAL_LEAVE'),
    );
    if (step === '출근' && isVacation) {
      setSuccessMessage(
        '오늘은 승인된 연차(휴가)일입니다. 출근할 수 없습니다.',
      );
      setShowSuccessModal(true);
      return;
    }
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
      // 월별 근태 데이터도 새로 불러오기
      attendanceService.getMonthlyAttendance(year, month).then((res) => {
        setMonthlyAttendance(res.result || res.data?.result || []);
      });
    } catch (error) {
      // 출근 시 승인된 휴가/반차로 인한 400 에러 메시지 표시
      if (
        step === '출근' &&
        error.response &&
        error.response.status === 400 &&
        error.response.data &&
        error.response.data.message
      ) {
        setSuccessMessage(error.response.data.message);
        setShowSuccessModal(true);
      } else {
        setError(`${step} 처리 중 오류가 발생했습니다.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 퇴근 확인 모달 열기
  const handleCheckOutClick = () => {
    setShowCheckoutConfirm(true);
  };

  // 퇴근 확인 후 실제 퇴근 처리
  const handleCheckOutConfirm = async () => {
    setShowCheckoutConfirm(false);
    setLoading(true);
    setError(null);
    try {
      await attendanceService.checkOut();
      await fetchTodayAttendance();
      // 퇴근 후 월별 데이터도 새로 불러오기
      attendanceService.getMonthlyAttendance(year, month).then((res) => {
        setMonthlyAttendance(res.result || res.data?.result || []);
      });
      setSuccessMessage('퇴근이 완료되었습니다.');
      setShowSuccessModal(true);
    } catch (error) {
      setError('퇴근 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 퇴근 확인 모달 취소
  const handleCheckOutCancel = () => {
    setShowCheckoutConfirm(false);
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
        isLate: result.isLate, // isLate 필드 추가
      });
    } catch (e) {
      setAttendanceData({
        checkInTime: null,
        checkOutTime: null,
        goOutTime: null,
        returnTime: null,
        isLate: false, // isLate 필드 추가
      });
    }
  };

  // 컴포넌트 마운트 시 오늘 근태 정보 불러오기
  useEffect(() => {
    fetchTodayAttendance();
    // eslint-disable-next-line
  }, []);

  // 부재 목록 불러오기
  const fetchAbsences = async () => {
    try {
      const userId = sessionStorage.getItem('USER_EMPLOYEE_NO');
      const response = await attendanceService.getAbsences({
        userId: userId,
        year: year,
        month: month,
      });
      // 응답 구조에 따라 absences 할당
      if (Array.isArray(response)) {
        setAbsences(response);
      } else if (response.result && Array.isArray(response.result)) {
        setAbsences(response.result);
      } else if (response.data && Array.isArray(response.data)) {
        setAbsences(response.data);
      } else {
        setAbsences([]);
      }
    } catch (error) {
      console.error('부재 목록 불러오기 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 부재 목록 불러오기
  useEffect(() => {
    fetchAbsences();
  }, [year, month]);

  const handleVacation = () => setShowVacation(true);
  const closeModal = () => setShowVacation(false);
  const handleAbsence = () => setShowAbsence(true);
  const closeAbsenceModal = () => setShowAbsence(false);
  // 부재 신청 (WorkStatusRegisterRequestDto 구조에 맞게)
  const handleAbsenceSubmit = async (absence) => {
    try {
      // absence: { type(Enum), urgency, startDate, endDate, startTime, endTime, reason }
      const apiData = {
        type: absence.type, // 이미 Enum 값으로 전달됨
        startDate: absence.startDate,
        endDate: absence.endDate,
        startTime: absence.startTime || null, // 명시적으로 null 처리
        endTime: absence.endTime || null, // 명시적으로 null 처리
        reason: absence.reason,
      };

      // 1. 부재 등록
      await attendanceService.registerAbsence(apiData);

      // 2. 부재 결재 요청 생성
      try {
        // 부재 타입에 따른 긴급도 설정 (모달에서 선택한 값 우선, 없으면 자동 설정)
        const getUrgencyByType = (type) => {
          switch (type) {
            case 'SICK_LEAVE':
            case 'OFFICIAL_LEAVE':
              return 'URGENT'; // 병가, 공가는 긴급
            case 'ANNUAL_LEAVE':
            case 'HALF_DAY_LEAVE':
              return 'NORMAL'; // 연차, 반차는 일반
            default:
              return 'NORMAL'; // 기본값
          }
        };

        const approvalData = {
          absenceType: absence.type,
          urgency: absence.urgency || getUrgencyByType(absence.type),
          startDate: absence.startDate,
          endDate: absence.endDate,
          startTime: absence.startTime || null, // 명시적으로 null 처리
          endTime: absence.endTime || null, // 명시적으로 null 처리
          reason: absence.reason,
        };

        await approvalService.requestAbsenceApproval(approvalData);
        setSuccessMessage('부재 신청이 완료되었습니다.');
      } catch (approvalError) {
        console.error('부재 결재 요청 생성 실패:', approvalError);
        // 결재 요청 실패 시 실패 메시지 표시
        setSuccessMessage('부재 신청을 실패했습니다.');
      }

      await fetchAbsences();
      setShowAbsence(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error('부재 신청 실패:', error);
      setSuccessMessage('부재 신청 중 오류가 발생했습니다.');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    }
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
  // 부재 신청 수정 (WorkStatusUpdateRequestDto 구조에 맞게)
  const handleUpdateAbsence = async (updated) => {
    try {
      // updated: { type(Enum), urgency, ... }
      const apiData = {
        type: updated.type, // 이미 Enum 값으로 전달됨
        startDate: updated.startDate,
        endDate: updated.endDate,
        startTime: updated.startTime,
        endTime: updated.endTime,
        reason: updated.reason,
      };

      // 1. 부재 수정
      await attendanceService.updateAbsence(editAbsence.id, apiData);

      // 2. 부재 결재 요청 업데이트 (기존 결재 요청이 있는 경우)
      try {
        // 부재 타입에 따른 긴급도 설정
        const getUrgencyByType = (type) => {
          switch (type) {
            case 'SICK_LEAVE':
            case 'OFFICIAL_LEAVE':
              return 'URGENT';
            case 'ANNUAL_LEAVE':
            case 'HALF_DAY_LEAVE':
              return 'NORMAL';
            default:
              return 'NORMAL';
          }
        };

        const approvalData = {
          absenceType: updated.type,
          urgency: updated.urgency || getUrgencyByType(updated.type),
          startDate: updated.startDate,
          endDate: updated.endDate,
          startTime: updated.startTime,
          endTime: updated.endTime,
          reason: updated.reason,
        };

        // 기존 결재 요청이 있는지 확인하고 업데이트
        // (실제로는 absence-service에서 처리하거나 별도 API 필요)
        setSuccessMessage('부재 신청 수정이 완료되었습니다.');
      } catch (approvalError) {
        console.error('부재 결재 요청 업데이트 실패:', approvalError);
        setSuccessMessage(
          '부재 신청 수정은 완료되었으나, 결재 요청 업데이트에 실패했습니다.',
        );
      }

      await fetchAbsences();
      closeEditAbsence();
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error('부재 신청 수정 실패:', error);
      setSuccessMessage('부재 신청 수정 중 오류가 발생했습니다.');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    }
  };

  const handleDeleteAbsence = async (absenceId) => {
    try {
      setEditAbsence(null); // 삭제 확인 시 바로 모달 닫기

      // 1. 부재 삭제
      await attendanceService.deleteAbsence(absenceId);

      // 2. 부재 결재 요청 삭제 (기존 결재 요청이 있는 경우)
      try {
        // 기존 결재 요청이 있는지 확인하고 삭제
        // (실제로는 absence-service에서 처리하거나 별도 API 필요)
        setSuccessMessage('부재 신청이 삭제되었습니다.');
      } catch (approvalError) {
        console.error('부재 결재 요청 삭제 실패:', approvalError);
        setSuccessMessage(
          '부재 신청은 삭제되었으나, 결재 요청 삭제에 실패했습니다.',
        );
      }

      await fetchAbsences();
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error('부재 신청 삭제 실패:', error);
      setSuccessMessage('부재 신청 삭제 중 오류가 발생했습니다.');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    }
  };

  const handleToday = () => {
    // 토글 방식: todayHighlight가 true면 해제, false면 오늘로 이동 및 강조
    if (
      year === today.getFullYear() &&
      month === today.getMonth() + 1 &&
      todayRowIdx === today.getDate() - 1 &&
      todayHighlight
    ) {
      setTodayHighlight(false);
    } else {
      setYear(today.getFullYear());
      setMonth(today.getMonth() + 1);
      setTodayRowIdx(today.getDate() - 1);
      setTodayHighlight(true);
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
        if (isMounted && response.data && response.data.result) {
          setVacationBalance(response.data.result);
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

  // 한글 → ENUM 변환 맵
  const typeMap = {
    출장: 'BUSINESS_TRIP',
    연수: 'TRAINING',
    연차: 'ANNUAL_LEAVE',
    반차: 'HALF_DAY_LEAVE',
    외출: 'SHORT_LEAVE',
    기타: 'ETC',
  };
  // ENUM → 한글 변환 맵
  const typeToKorean = {
    BUSINESS_TRIP: '출장',
    TRAINING: '연수',
    ANNUAL_LEAVE: '연차',
    HALF_DAY_LEAVE: '반차',
    SHORT_LEAVE: '외출',
    ETC: '기타',
  };

  // === 툴팁 상태 추가 ===
  const [hoveredAbsence, setHoveredAbsence] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // renderAttendanceDashboard 함수로 분리
  function renderAttendanceDashboard() {
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
                    {step === '복귀완료' &&
                      getTimeStr(attendanceData.returnTime)}
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
                    onClick={handleCheckOutClick}
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
                      <span className={styles.leaveLabel}>총 연차</span>
                      <span className={styles.leaveValue}>
                        {vacationBalance.totalGranted}
                      </span>
                    </div>
                    <div className={styles.leaveRow}>
                      <span className={styles.leaveLabel}>사용 연차</span>
                      <span className={styles.leaveValue}>
                        {vacationBalance.usedDays}
                      </span>
                    </div>
                    <div className={styles.leaveRow}>
                      <span className={styles.leaveLabel}>남은 연차</span>
                      <span className={styles.leaveValue}>
                        {vacationBalance.remainingDays}
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
                <button
                  className={styles.cardButtonSub}
                  onClick={handleAbsence}
                >
                  부재 신청
                </button>
                <button
                  className={styles.cardButtonSub}
                  onClick={handleVacation}
                >
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
              {Array.from({ length: Math.ceil(days.length / 2) }).map(
                (_, i) => {
                  // 왼쪽(1~15일)
                  const d1 = new Date(year, month - 1, i + 1);
                  const d1str = getDateStrLocal(d1);
                  const att1 = getAttendanceByDate(d1str);
                  const absence1 = absences.find(
                    (a) => a.startDate <= d1str && a.endDate >= d1str,
                  );
                  // 오른쪽(16~말일)
                  const d2 = new Date(
                    year,
                    month - 1,
                    i + Math.ceil(days.length / 2) + 1,
                  );
                  const d2str = getDateStrLocal(d2);
                  const att2 = getAttendanceByDate(d2str);
                  const absence2 = absences.find(
                    (a) => a.startDate <= d2str && a.endDate >= d2str,
                  );
                  return (
                    <tr key={i}>
                      {/* 날짜/출근/퇴근/부재 */}
                      <td
                        className={
                          year === today.getFullYear() &&
                          month === today.getMonth() + 1 &&
                          today.getDate() === i + 1 &&
                          todayHighlight
                            ? styles.todayRow
                            : getDayColor(d1.getDay())
                        }
                      >
                        {i + 1}({getDayName(d1)})
                      </td>
                      <td>
                        {formatTime(
                          att1?.checkInTime || att1?.workStatus?.checkInTime,
                        )}
                      </td>
                      <td>
                        {formatTime(
                          att1?.checkOutTime || att1?.workStatus?.checkOutTime,
                        )}
                      </td>
                      <td>
                        {absence1 && (
                          <span
                            className={styles.absenceBtn}
                            style={{
                              cursor: 'pointer',
                              display: 'inline-block',
                              position: 'relative',
                            }}
                            onClick={() => handleEditAbsence(absence1)}
                            title='수정'
                            onMouseEnter={(e) => {
                              setHoveredAbsence(absence1);
                              const rect = e.target.getBoundingClientRect();
                              setTooltipPos({
                                x: rect.right + window.scrollX,
                                y: rect.top + window.scrollY,
                              });
                            }}
                            onMouseLeave={() => setHoveredAbsence(null)}
                          >
                            {typeToKorean[absence1.type] || absence1.type}
                          </span>
                        )}
                      </td>
                      {/* 합계/정상/연장/심야 */}
                      <td>{att1?.totalWorkTime || ''}</td>
                      <td>{att1?.normalWorkTime || ''}</td>
                      <td>{att1?.overtimeWorkTime || ''}</td>
                      <td>{att1?.nightWorkTime || ''}</td>
                      {/* 오른쪽 날짜/출근/퇴근/부재 */}
                      <td
                        className={
                          year === today.getFullYear() &&
                          month === today.getMonth() + 1 &&
                          today.getDate() ===
                            i + Math.ceil(days.length / 2) + 1 &&
                          todayHighlight
                            ? styles.todayRow
                            : getDayColor(d2.getDay())
                        }
                      >
                        {i + Math.ceil(days.length / 2) + 1 <= days.length
                          ? `${i + Math.ceil(days.length / 2) + 1}(${getDayName(d2)})`
                          : ''}
                      </td>
                      <td>
                        {i + Math.ceil(days.length / 2) + 1 <= days.length
                          ? formatTime(
                              att2?.checkInTime ||
                                att2?.workStatus?.checkInTime,
                            )
                          : ''}
                      </td>
                      <td>
                        {i + Math.ceil(days.length / 2) + 1 <= days.length
                          ? formatTime(
                              att2?.checkOutTime ||
                                att2?.workStatus?.checkOutTime,
                            )
                          : ''}
                      </td>
                      <td>
                        {i + Math.ceil(days.length / 2) + 1 <= days.length &&
                          absence2 && (
                            <span
                              className={styles.absenceBtn}
                              style={{
                                cursor: 'pointer',
                                display: 'inline-block',
                                position: 'relative',
                              }}
                              onClick={() => handleEditAbsence(absence2)}
                              title='수정'
                              onMouseEnter={(e) => {
                                setHoveredAbsence(absence2);
                                const rect = e.target.getBoundingClientRect();
                                setTooltipPos({
                                  x: rect.right + window.scrollX,
                                  y: rect.top + window.scrollY,
                                });
                              }}
                              onMouseLeave={() => setHoveredAbsence(null)}
                            >
                              {typeToKorean[absence2.type] || absence2.type}
                            </span>
                          )}
                      </td>
                      {/* 합계/정상/연장/심야 */}
                      <td>
                        {i + Math.ceil(days.length / 2) + 1 <= days.length
                          ? att2?.totalWorkTime || ''
                          : ''}
                      </td>
                      <td>
                        {i + Math.ceil(days.length / 2) + 1 <= days.length
                          ? att2?.normalWorkTime || ''
                          : ''}
                      </td>
                      <td>
                        {i + Math.ceil(days.length / 2) + 1 <= days.length
                          ? att2?.overtimeWorkTime || ''
                          : ''}
                      </td>
                      <td>
                        {i + Math.ceil(days.length / 2) + 1 <= days.length
                          ? att2?.nightWorkTime || ''
                          : ''}
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
          {/* === 부재 툴팁 === */}
          {hoveredAbsence && (
            <div
              style={{
                position: 'absolute',
                left: tooltipPos.x + 8,
                top: tooltipPos.y,
                background: '#fff',
                border: '1px solid #bbb',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                padding: '12px 16px',
                zIndex: 9999,
                minWidth: 180,
                fontSize: 14,
                color: '#222',
                pointerEvents: 'none',
                whiteSpace: 'pre-line',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                {typeToKorean[hoveredAbsence.type] || hoveredAbsence.type}
              </div>
              <div>
                날짜: {hoveredAbsence.startDate} ~ {hoveredAbsence.endDate}
              </div>
              {(hoveredAbsence.startTime || hoveredAbsence.endTime) && (
                <div>
                  시간: {hoveredAbsence.startTime || ''}
                  {hoveredAbsence.endTime ? ' ~ ' + hoveredAbsence.endTime : ''}
                </div>
              )}
              {hoveredAbsence.reason && (
                <div>사유: {hoveredAbsence.reason}</div>
              )}
            </div>
          )}
        </div>

        {/* 휴가신청 모달 */}
        {showVacation && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <button className={styles.modalClose} onClick={closeModal}>
                ×
              </button>
              <VacationRequest
                onClose={closeModal}
                vacationBalance={vacationBalance}
              />
            </div>
          </div>
        )}
        {/* 부재신청 모달 */}
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
          onDelete={handleDeleteAbsence}
        />
        {/* 성공 메시지 모달 */}
        {showSuccessModal && (
          <SuccessModal
            message={successMessage}
            onClose={() => setShowSuccessModal(false)}
            autoClose={true}
            autoCloseDelay={3000}
          />
        )}
        {/* 퇴근 확인 모달 */}
        <CheckoutConfirmModal
          isOpen={showCheckoutConfirm}
          onConfirm={handleCheckOutConfirm}
          onCancel={handleCheckOutCancel}
          currentTime={getTimeStrWithSec(currentTime)}
        />
      </div>
    );
  }

  // 기존 return을 renderAttendanceDashboard 함수 호출로 변경
  return renderAttendanceDashboard();
}
