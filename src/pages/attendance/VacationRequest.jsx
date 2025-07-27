import React, { useState, useContext, useEffect } from 'react';
import styles from './VacationRequest.module.scss';
import { approvalService } from '../../services/approvalService';
import AuthContext from '../../context/UserContext';
import SuccessModal from '../../components/SuccessModal';

// 한국 시간으로 오늘 날짜 가져오기
const today = new Date();
const todayStr =
  today.getFullYear() +
  '-' +
  String(today.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(today.getDate()).padStart(2, '0');

// 날짜 차이 계산 함수
function getDateDiff(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${y}.${m}.${d}`;
}

function toInputDate(str) {
  // yyyy.MM.dd -> yyyy-MM-dd
  if (!str) return '';
  return str.replace(/\./g, '-');
}

const VacationRequest = ({ onClose, editData = null, vacationBalance }) => {
  const [requestDate, setRequestDate] = useState(todayStr);
  // 휴가 유형을 Enum 값으로 관리
  const [vacationType, setVacationType] = useState(
    editData?.vacationType || 'ANNUAL_LEAVE',
  );
  const [startDate, setStartDate] = useState(editData?.startDate || todayStr);
  const [endDate, setEndDate] = useState(editData?.endDate || todayStr);

  // 휴가 유형 변경 핸들러
  const handleVacationTypeChange = (e) => {
    setVacationType(e.target.value);
  };
  const [reason, setReason] = useState(editData?.reason || '');
  const [loading, setLoading] = useState(false);
  const [reasonError, setReasonError] = useState('');
  const [overlapError, setOverlapError] = useState('');
  const [myVacations, setMyVacations] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 내 휴가 목록 불러오기
  useEffect(() => {
    async function fetchMyVacations() {
      try {
        const res = await approvalService.getMyVacationRequests();
        console.log('getMyVacationRequests 응답:', res);
        const vacations = res.result || res.data || res || [];
        vacations.forEach((v, i) => {
          console.log(
            `휴가[${i}] id=${v.id}, vacationStatus=${v.vacationStatus}, startDate=${v.startDate}, endDate=${v.endDate}`,
          );
        });
        // 승인/처리중 상태만 필터링 (다양한 필드명 시도)
        const filtered = vacations.filter((v) => {
          const status = v.vacationStatus || v.status || v.approvalStatus;
          return ['PENDING', 'APPROVED', 'PROCESSING'].includes(status);
        });
        setMyVacations(filtered);
      } catch (e) {
        setMyVacations([]);
      }
    }
    fetchMyVacations();
  }, []);

  // 날짜 겹침 검사 함수
  useEffect(() => {
    if (!myVacations.length) {
      setOverlapError('');
      return;
    }
    // 신청하려는 기간 계산
    let reqStart = startDate;
    let reqEnd = endDate;
    if (vacationType === 'AM_HALF_DAY' || vacationType === 'PM_HALF_DAY') {
      reqEnd = reqStart;
    }
    const reqStartDate = new Date(reqStart);
    const reqEndDate = new Date(reqEnd);
    // 본인 수정모드일 때는 자기 자신 제외
    const filteredVacations = editData
      ? myVacations.filter((v) => v.id !== editData.id)
      : myVacations;
    // 겹치는 휴가가 있는지 검사
    const overlap = filteredVacations.find((v) => {
      const vStart = new Date(v.startDate);
      const vEnd = new Date(v.endDate);
      // 기간이 겹치면 true
      return reqStartDate <= vEnd && reqEndDate >= vStart;
    });
    if (overlap) {
      setOverlapError('이미 해당 기간에 신청된 휴가가 있습니다.');
    } else {
      setOverlapError('');
    }
  }, [startDate, endDate, vacationType, myVacations, editData]);

  const authCtx = useContext(AuthContext);
  const applicantId = authCtx?.user?.employeeNo || null;

  // 신청 일수 계산
  let days = 0;
  if (vacationType === 'AM_HALF_DAY' || vacationType === 'PM_HALF_DAY') {
    days = 0.5;
  } else if (startDate && endDate) {
    days = getDateDiff(startDate, endDate);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('=== 휴가 신청 제출 시작 ===');
    console.log('현재 myVacations:', myVacations);
    console.log('신청하려는 기간:', startDate, '~', endDate);
    console.log('휴가 유형:', vacationType);

    // 날짜 겹침 유효성 검사
    if (overlapError) {
      console.log('overlapError가 있음:', overlapError);
      alert(overlapError);
      return;
    }

    // 추가 중복 검사 - 현재 신청하려는 기간과 겹치는 휴가가 있는지 다시 확인
    const currentRequestStart = new Date(startDate);
    const currentRequestEnd = new Date(
      vacationType === 'AM_HALF_DAY' || vacationType === 'PM_HALF_DAY'
        ? startDate
        : endDate,
    );

    console.log('검사할 기간:', currentRequestStart, '~', currentRequestEnd);

    const hasOverlap = myVacations.some((vacation) => {
      // 수정 모드일 때는 자기 자신 제외
      if (editData && vacation.id === editData.id) {
        console.log('수정 모드 - 자기 자신 제외:', vacation.id);
        return false;
      }

      const vacationStart = new Date(vacation.startDate);
      const vacationEnd = new Date(vacation.endDate);
      const vacationStatus =
        vacation.vacationStatus || vacation.status || vacation.approvalStatus;

      console.log('검사 중인 휴가:', {
        id: vacation.id,
        startDate: vacation.startDate,
        endDate: vacation.endDate,
        status: vacationStatus,
        vacationStart,
        vacationEnd,
      });

      // 기간이 겹치고, 승인/처리중 상태인 경우
      const isOverlapping =
        currentRequestStart <= vacationEnd &&
        currentRequestEnd >= vacationStart;
      const isActiveStatus = ['PENDING', 'APPROVED', 'PROCESSING'].includes(
        vacationStatus,
      );

      console.log('겹침 여부:', isOverlapping, '활성 상태:', isActiveStatus);

      return isOverlapping && isActiveStatus;
    });

    console.log('최종 중복 여부:', hasOverlap);

    if (hasOverlap) {
      setSuccessMessage('이미 처리 중인 휴가 신청이 있습니다.');
      setShowSuccessModal(true);
      return;
    }

    // 사유 유효성 검사
    if (!reason.trim()) {
      setReasonError('휴가 사유를 입력해주세요.');
      return;
    }

    // 잔여 연차 유효성 검사 (연차만 적용)
    if (
      vacationType === 'ANNUAL_LEAVE' &&
      vacationBalance &&
      days > vacationBalance.remainingDays
    ) {
      setSuccessMessage(
        `보유 연차(${vacationBalance.remainingDays}일)보다 많이 신청할 수 없습니다.`,
      );
      setShowSuccessModal(true);
      return;
    }

    setReasonError('');
    setLoading(true);

    try {
      // API 호출 전에 최신 휴가 데이터를 다시 가져와서 중복 검사
      console.log('최신 휴가 데이터 확인 중...');
      const latestRes = await approvalService.getMyVacationRequests();
      const latestVacations =
        latestRes.result || latestRes.data || latestRes || [];
      console.log('최신 휴가 데이터:', latestVacations);

      // 휴가 데이터 구조 확인
      console.log('첫 번째 휴가 데이터 구조:', latestVacations[0]);

      // 승인/처리중 상태만 필터링 (다양한 필드명 시도)
      const activeVacations = latestVacations.filter((v) => {
        const status = v.vacationStatus || v.status || v.approvalStatus;
        console.log('휴가 ID:', v.id, '상태:', status);
        return ['PENDING', 'APPROVED', 'PROCESSING'].includes(status);
      });
      console.log('활성 휴가:', activeVacations);

      // 최신 데이터로 중복 검사
      const currentRequestStart = new Date(startDate);
      const currentRequestEnd = new Date(
        vacationType === 'AM_HALF_DAY' || vacationType === 'PM_HALF_DAY'
          ? startDate
          : endDate,
      );

      const hasLatestOverlap = activeVacations.some((vacation) => {
        if (editData && vacation.id === editData.id) return false;

        const vacationStart = new Date(vacation.startDate);
        const vacationEnd = new Date(vacation.endDate);

        const isOverlapping =
          currentRequestStart <= vacationEnd &&
          currentRequestEnd >= vacationStart;
        console.log('최신 검사 - 휴가:', vacation.id, '겹침:', isOverlapping);

        return isOverlapping;
      });

      if (hasLatestOverlap) {
        console.log('최신 데이터에서 중복 발견');
        setSuccessMessage('이미 처리 중인 휴가 신청이 있습니다.');
        setShowSuccessModal(true);
        setLoading(false);
        return;
      }

      // 반차는 startDate, endDate 동일하게
      const reqStart =
        vacationType === 'AM_HALF_DAY' || vacationType === 'PM_HALF_DAY'
          ? startDate
          : startDate;
      const reqEnd =
        vacationType === 'AM_HALF_DAY' || vacationType === 'PM_HALF_DAY'
          ? startDate
          : endDate;

      if (editData) {
        // 수정 모드
        await approvalService.updateVacation(editData.id, {
          vacationType,
          startDate: reqStart,
          endDate: reqEnd,
          reason,
        });
        setSuccessMessage('휴가 신청이 수정되었습니다.');
        setShowSuccessModal(true);
      } else {
        // 신규 신청 모드 - 백엔드 변경사항에 맞게 수정
        await approvalService.requestVacation({
          vacationType,
          startDate: reqStart,
          endDate: reqEnd,
          reason,
          requested_at: new Date(requestDate + 'T00:00:00').toISOString(), // 신청일자 추가
        });
        setSuccessMessage('휴가 신청이 완료되었습니다.');
        setShowSuccessModal(true);
      }

      if (onClose) onClose();
    } catch (err) {
      console.error('휴가 신청 에러:', err);
      console.error('에러 전체 객체:', JSON.stringify(err, null, 2));
      console.error('에러 메시지:', err.message);
      console.error('에러 응답:', err.response);
      console.error('에러 응답 데이터:', err.response?.data);

      if (err.response && err.response.status === 400) {
        // 400 에러의 경우 중복 신청일 가능성이 높음
        const errorMessage = err.response.data;
        console.log('백엔드 에러 메시지:', errorMessage);
        console.log('에러 메시지 타입:', typeof errorMessage);
        console.log(
          '에러 메시지 길이:',
          errorMessage ? errorMessage.length : 'null',
        );
        console.log(
          '에러 메시지 포함 여부:',
          errorMessage
            ? errorMessage.includes('결재 서비스 통신 중 오류가 발생했습니다')
            : 'null',
        );

        // 백엔드에서 오는 "결재 서비스 통신 중 오류가 발생했습니다" 메시지를 사용자 친화적으로 변경
        const errorText =
          typeof errorMessage === 'string'
            ? errorMessage
            : JSON.stringify(errorMessage);
        console.log('처리할 에러 텍스트:', errorText);

        if (
          errorText &&
          errorText.includes('결재 서비스 통신 중 오류가 발생했습니다')
        ) {
          setSuccessMessage('이미 처리 중인 휴가 신청이 있습니다.');
          setShowSuccessModal(true);
        } else if (
          errorText &&
          (errorText.includes('이미') ||
            errorText.includes('중복') ||
            errorText.includes('처리 중') ||
            errorText.includes('신청된'))
        ) {
          setSuccessMessage(errorText);
          setShowSuccessModal(true);
        } else {
          // 400 에러인 경우 모두 중복으로 간주하고 명확한 메시지 표시
          setSuccessMessage('이미 처리 중인 휴가 신청이 있습니다.');
          setShowSuccessModal(true);
        }
      } else {
        setSuccessMessage(
          err.message ||
            (editData
              ? '휴가 신청 수정에 실패했습니다.'
              : '휴가 신청에 실패했습니다.'),
        );
        setShowSuccessModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.vacationRequest}>
      <h2>{editData ? '휴가 신청 수정' : '휴가 신청'}</h2>
      <form onSubmit={handleSubmit}>
        {/* 휴가 신청일 */}
        <div className={styles.row}>
          <label>휴가 신청일</label>
          <input
            type='date'
            min={todayStr}
            value={requestDate}
            onChange={(e) => setRequestDate(e.target.value)}
            required
          />
        </div>
        {/* 휴가 유형 */}
        <div className={styles.row}>
          <label>휴가 유형</label>
          <select value={vacationType} onChange={handleVacationTypeChange}>
            <option value='ANNUAL_LEAVE'>연차</option>
            <option value='AM_HALF_DAY'>반차(오전)</option>
            <option value='PM_HALF_DAY'>반차(오후)</option>
          </select>
        </div>
        {/* 휴가 기간 */}
        <div className={styles.row}>
          <label>휴가 기간</label>
          <input
            type='date'
            className={styles.periodInput}
            min={todayStr}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          {vacationType === 'ANNUAL_LEAVE' && (
            <>
              <span className={styles.periodTilde}>~</span>
              <input
                type='date'
                className={styles.periodInput}
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </>
          )}
          <span
            className={styles.daysInfo}
            style={{ marginLeft: 8, fontWeight: 600, color: '#388e3c' }}
          >
            {days > 0 && `${days}일 신청`}
          </span>
        </div>
        {/* 날짜 겹침 에러 메시지 */}
        {overlapError && (
          <div style={{ color: 'red', fontWeight: 600, marginBottom: 8 }}>
            {overlapError}
          </div>
        )}
        {/* 사유 */}
        <div className={styles.row}>
          <label>사유</label>
          <input
            type='text'
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) {
                setReasonError('');
              }
            }}
            required
            className={reasonError ? styles.errorInput : ''}
          />
          {reasonError && (
            <span className={styles.errorMessage}>{reasonError}</span>
          )}
        </div>
        {/* 버튼 */}
        <div className={styles['button-row']}>
          <button
            type='submit'
            className={styles['confirm-btn']}
            disabled={loading || !!overlapError}
          >
            {loading
              ? editData
                ? '수정 중...'
                : '신청 중...'
              : editData
                ? '수정'
                : '등록'}
          </button>
          <button
            type='button'
            onClick={onClose}
            className={styles['cancel-btn']}
            disabled={loading}
          >
            취소
          </button>
        </div>
      </form>

      {/* 성공 모달 */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessMessage('');
            if (onClose) onClose();
          }}
        />
      )}
    </div>
  );
};

export default VacationRequest;
