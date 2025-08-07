import React, { useState, useContext, useEffect } from 'react';
import styles from './VacationRequest.module.scss';
import { approvalService } from '../../services/approvalService';
import { attendanceService } from '../../services/attendanceService';
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

const VacationRequest = ({
  onClose,
  editData = null,
  vacationBalance,
  onSuccess,
}) => {
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
  const [myAbsences, setMyAbsences] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 내 휴가 및 부재 목록 불러오기
  useEffect(() => {
    async function fetchMyData() {
      try {
        // 휴가 목록 불러오기 (페이징 처리된 응답)
        const vacationRes = await approvalService.getMyVacationRequests(
          0,
          100,
          'startDate,desc',
        );
        // Page 객체에서 content 필드에 접근
        const vacations =
          vacationRes.data?.content ||
          vacationRes.content ||
          vacationRes.result ||
          vacationRes.data ||
          vacationRes ||
          [];
        // 승인/처리중 상태만 필터링 (다양한 필드명 시도)
        const filteredVacations = vacations.filter((v) => {
          const status = v.vacationStatus || v.status || v.approvalStatus;
          const isIncluded = [
            'PENDING',
            'APPROVED',
            'PROCESSING',
            'PENDING_APPROVAL',
          ].includes(status);
          return isIncluded;
        });
        setMyVacations(filteredVacations);

        // 부재 목록 불러오기
        const absenceRes = await attendanceService.getAbsences();
        const absences =
          absenceRes.result || absenceRes.data || absenceRes || [];
        // 승인/처리중 상태만 필터링
        const filteredAbsences = absences.filter((a) => {
          const status = a.absenceStatus || a.status || a.approvalStatus;
          const isIncluded = ['PENDING', 'APPROVED', 'PROCESSING'].includes(
            status,
          );
          return isIncluded;
        });
        setMyAbsences(filteredAbsences);

        setDataLoaded(true);
      } catch (e) {
        console.error('휴가 신청 모달 - 데이터 로딩 실패:', e);
        setMyVacations([]);
        setMyAbsences([]);
        setDataLoaded(true);
      }
    }
    fetchMyData();
  }, []);

  // 날짜 겹침 검사 함수 (휴가 + 부재)
  useEffect(() => {
    // 데이터가 로드되지 않았으면 검사하지 않음
    if (!dataLoaded) {
      return;
    }

    if (!myVacations.length && !myAbsences.length) {
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

    // 해당 기간에 겹치는 휴가가 있는지 검사
    const vacationOverlap = filteredVacations.find((v) => {
      const vStart = new Date(v.startDate);
      const vEnd = new Date(v.endDate);
      const isOverlap = reqStartDate <= vEnd && reqEndDate >= vStart;
      return isOverlap;
    });

    // 해당 기간에 겹치는 부재가 있는지 검사
    const absenceOverlap = myAbsences.find((a) => {
      const aStart = new Date(a.startDate);
      const aEnd = new Date(a.endDate);
      const isOverlap = reqStartDate <= aEnd && reqEndDate >= aStart;
      return isOverlap;
    });

    if (vacationOverlap) {
      setOverlapError('이미 해당 기간에 신청된 휴가가 있습니다.');
    } else if (absenceOverlap) {
      setOverlapError('해당 기간에 이미 신청한 부재가 있습니다.');
    } else {
      setOverlapError('');
    }
  }, [
    startDate,
    endDate,
    vacationType,
    myVacations,
    myAbsences,
    editData,
    dataLoaded,
  ]);

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

    // 날짜 겹침 유효성 검사 (UI에서 이미 처리됨)
    if (overlapError) {
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

        // 성공 시 부모 컴포넌트에 알림
        if (onSuccess) {
          onSuccess();
        }
      }

      // 성공 시 모달은 SuccessModal에서 처리하도록 onClose() 호출 제거
    } catch (error) {
      console.error('휴가 신청 에러:', error);
      console.error('에러 응답:', error.response);
      console.error('에러 상태:', error.response?.status);
      console.error('에러 데이터:', error.response?.data);

      // 409 CONFLICT 에러 처리
      if (error.response && error.response.status === 409) {
        let errorMessage = '해당 기간에 이미 신청된 휴가가 있습니다.';

        // 다양한 에러 응답 구조 시도
        if (error.response.data?.statusMessage) {
          errorMessage = error.response.data.statusMessage;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data) {
          errorMessage = JSON.stringify(error.response.data);
        }

        console.log('최종 에러 메시지:', errorMessage);
        setSuccessMessage(errorMessage);
      } else {
        // 500 에러 시 중복 신청 가능성 고려
        let errorMessage = '휴가 신청 중 오류가 발생했습니다.';

        if (error.response?.status === 500) {
          errorMessage =
            '해당 기간에 이미 신청된 휴가가 있거나, 중복 신청으로 인한 오류가 발생했습니다.';
        } else {
          errorMessage =
            error.response?.data?.statusMessage ||
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            '휴가 신청 중 오류가 발생했습니다.';
        }

        console.log('백엔드 에러 메시지:', errorMessage);
        console.log('에러 메시지 타입:', typeof errorMessage);
        console.log(
          '백엔드 에러 메시지가 문자열인지 확인:',
          typeof errorMessage === 'string',
        );
        console.log(
          '백엔드 에러 메시지가 객체인지 확인:',
          typeof errorMessage === 'object',
        );

        let errorText = errorMessage;

        // 백엔드에서 객체로 오는 경우 처리
        if (typeof errorMessage === 'object' && errorMessage !== null) {
          errorText = JSON.stringify(errorMessage);
        }

        console.log('처리할 에러 텍스트:', errorText);

        setSuccessMessage(errorText);
      }

      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.vacationOverlay}>
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
          {/* 사유 */}
          <div className={styles.row}>
            <label>사유</label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.trim()) {
                  setReasonError('');
                }
              }}
              required
              className={reasonError ? styles.errorInput : ''}
              style={{
                width: '100%',
                height: '120px',
                resize: 'vertical',
                border: '1px solid #b7d7c2',
                borderRadius: '4px',
                padding: '0.5rem 0.7rem',
                fontSize: '1rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                flex: '1',
              }}
            />
            {reasonError && (
              <span className={styles.errorMessage}>{reasonError}</span>
            )}
          </div>
          {/* 날짜 겹침 에러 메시지 */}
          {overlapError && (
            <div
              style={{
                marginLeft: '105px',
                marginTop: '4px',
                color: '#e74c3c',
                fontSize: '14px',
                fontWeight: 400,
              }}
            >
              {overlapError}
            </div>
          )}
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
                  : '신청'}
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
            autoClose={true}
            autoCloseDelay={2000}
          />
        )}
      </div>
    </div>
  );
};

export default VacationRequest;
