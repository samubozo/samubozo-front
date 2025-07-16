import React, { useState, useContext } from 'react';
import styles from './VacationRequest.module.scss';
import { approvalService } from '../../services/approvalService';
import AuthContext from '../../context/UserContext';

const todayStr = new Date().toISOString().slice(0, 10);

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

const VacationRequest = ({ onClose }) => {
  const [requestDate, setRequestDate] = useState(todayStr);
  // 휴가 유형을 Enum 값으로 관리
  const [vacationType, setVacationType] = useState('ANNUAL_LEAVE');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

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
      const payload = {
        requestType: 'VACATION',
        applicantId: applicantId ? Number(applicantId) : null,
        reason,
        vacationsId: null,
        vacationType,
        certificatesId: null,
        startDate: reqStart,
        endDate: reqEnd,
      };
      console.log('휴가신청 payload', payload);
      await approvalService.requestVacation(payload);
      alert('휴가 신청이 완료되었습니다.');
      if (onClose) onClose();
    } catch (err) {
      alert(err.message || '휴가 신청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.vacationRequest}>
      <h2>휴가 신청</h2>
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
          <select
            value={vacationType}
            onChange={(e) => setVacationType(e.target.value)}
          >
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
          <input
            type='text'
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
        {/* 버튼 */}
        <div className={styles['button-row']}>
          <button
            type='submit'
            className={styles['confirm-btn']}
            disabled={loading}
          >
            {loading ? '신청 중...' : '등록'}
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
    </div>
  );
};

export default VacationRequest;
