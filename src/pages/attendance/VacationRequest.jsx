import React, { useState } from 'react';
import styles from './VacationRequest.module.scss';

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
    <div
      className={styles.vacationRequest}
      style={{
        minHeight: 'unset',
        padding: '2rem',
        background: 'white',
        borderRadius: '12px',
        maxWidth: 500,
      }}
    >
      <h2
        style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 700 }}
      >
        휴가 신청
      </h2>
      <form onSubmit={handleSubmit}>
        {/* 휴가신청일, 연차/반차 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem',
            gap: 16,
          }}
        >
          <label style={{ minWidth: 90 }}>휴가신청일</label>
          <input
            type='date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: 140 }}
            required
          />
          <span style={{ marginLeft: 16, minWidth: 60 }}>연차/반차</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ width: 80 }}
          >
            <option value='연차'>연차</option>
            <option value='반차'>반차</option>
          </select>
        </div>
        {/* 휴가기간 + 전자결재상태태 */}
        <div className={styles.formRow}>
          <label>휴가기간</label>
          <input
            type='date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <span className={styles.tilde}>~</span>
          <input
            type='date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          {/* approvalGroup 클래스 적용 */}
          <div className={styles.approvalGroup}>
            <label>전자결재상태</label>
            <span className={styles.statusValue}>결재요청</span>
          </div>
        </div>
        {/* 휴가사유 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1.5rem',
            gap: 16,
          }}
        >
          <label style={{ minWidth: 90 }}>휴가사유</label>
          <input
            type='text'
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ flex: 1 }}
            placeholder=''
            required
          />
        </div>
        {/* 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          <button
            type='submit'
            style={{
              background: '#7ec08e',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              padding: '0.5rem 2rem',
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            확인
          </button>
          <button
            type='button'
            onClick={onClose}
            style={{
              background: '#b7d7c2',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              padding: '0.5rem 2rem',
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default VacationRequest;
