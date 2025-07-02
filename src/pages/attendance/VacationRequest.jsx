import React, { useState } from 'react';
import styles from './VacationRequest.module.scss';

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
  const [type, setType] = useState('연차');
  const [startDate, setStartDate] = useState('2025-06-20');
  const [endDate, setEndDate] = useState('2025-06-20');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('휴가 신청이 완료되었습니다.');
    if (onClose) onClose();
  };

  return (
    <div className={styles.vacationRequest}>
      <h2>휴가 신청</h2>
      <form onSubmit={handleSubmit}>
        {/* 휴가신청일, 연차/반차 */}
        <div className={styles.row}>
          <label>휴가신청일</label>
          <input
            type='date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <span>연차/반차</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value='연차'>연차</option>
            <option value='반차'>반차</option>
          </select>
        </div>

        {/* 휴가기간 */}
        <div className={styles.row}>
          <label>휴가기간</label>
          <input
            type='date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <span>~</span>
          <input
            type='date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        {/* 휴가사유 */}
        <div className={styles.row}>
          <label>휴가사유</label>
          <input
            type='text'
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder=''
            required
          />
        </div>

        {/* 버튼 */}
        <div className={styles['button-row']}>
          <button type='submit' className={styles['confirm-btn']}>
            확인
          </button>
          <button
            type='button'
            onClick={onClose}
            className={styles['cancel-btn']}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default VacationRequest;
