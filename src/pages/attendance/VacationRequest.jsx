import React, { useState } from 'react';
import styles from './VacationRequest.module.scss';
import { attendanceService } from '../../services/attendanceService';

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
  const [type, setType] = useState('연차');
  const [halfType, setHalfType] = useState('AM'); // 반차일 때 오전/오후
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // 휴가 유형 매핑
  const getVacationType = () => {
    if (type === '연차') return 'ANNUAL_LEAVE';
    if (type === '반차')
      return halfType === 'AM' ? 'AM_HALF_DAY' : 'PM_HALF_DAY';
    return 'ANNUAL_LEAVE';
  };

  // 신청 일수 계산
  const days =
    type === '반차'
      ? 0.5
      : startDate && endDate
        ? getDateDiff(startDate, endDate)
        : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const vacationType = getVacationType();
      // 반차는 startDate, endDate 동일하게
      const reqStart = type === '반차' ? startDate : startDate;
      const reqEnd = type === '반차' ? startDate : endDate;
      await attendanceService.requestVacation({
        vacationType,
        startDate: reqStart,
        endDate: reqEnd,
        reason,
      });
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
            value={requestDate}
            onChange={(e) => setRequestDate(e.target.value)}
            required
          />
        </div>
        {/* 휴가 유형 */}
        <div className={styles.row}>
          <label>휴가 유형</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value='연차'>연차</option>
            <option value='반차'>반차</option>
          </select>
          {type === '반차' && (
            <select
              value={halfType}
              onChange={(e) => setHalfType(e.target.value)}
            >
              <option value='AM'>오전</option>
              <option value='PM'>오후</option>
            </select>
          )}
        </div>
        {/* 휴가 기간 */}
        <div className={styles.row}>
          <label>휴가 기간</label>
          <input
            type='date'
            className={styles.periodInput}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          {type === '연차' && (
            <>
              <span className={styles.periodTilde}>~</span>
              <input
                type='date'
                className={styles.periodInput}
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
