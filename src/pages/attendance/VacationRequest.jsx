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
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          fontWeight: 700,
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '0.7rem',
        }}
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
            style={{
              width: 140,
              fontWeight: 700,
              fontSize: 16,
              border: '1px solid #b7d7c2',
              borderRadius: 4,
              padding: '0.3rem 0.7rem',
            }}
            required
          />
          <span style={{ marginLeft: 16, minWidth: 60 }}>연차/반차</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              width: 80,
              fontWeight: 700,
              fontSize: 16,
              border: '1px solid #b7d7c2',
              borderRadius: 4,
              padding: '0.3rem 0.7rem',
              background: '#fff',
            }}
          >
            <option value='연차'>연차</option>
            <option value='반차'>반차</option>
          </select>
        </div>
        {/* 휴가기간 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem',
            gap: 16,
          }}
        >
          <label style={{ minWidth: 90 }}>휴가기간</label>
          <input
            type='date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: 140,
              fontWeight: 700,
              fontSize: 16,
              border: '1px solid #b7d7c2',
              borderRadius: 4,
              padding: '0.3rem 0.7rem',
            }}
            required
          />
          <span>~</span>
          <input
            type='date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              width: 140,
              fontWeight: 700,
              fontSize: 16,
              border: '1px solid #b7d7c2',
              borderRadius: 4,
              padding: '0.3rem 0.7rem',
            }}
            required
          />
          <input
            type='text'
            value='전자결재상태'
            readOnly
            style={{
              marginLeft: 16,
              minWidth: 120,
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '0.3rem 0.7rem',
              background: '#fff',
              fontWeight: 500,
              textAlign: 'center',
            }}
          />
          <button
            type='button'
            style={{
              minWidth: 80,
              border: '1px solid #ccc',
              borderRadius: 4,
              background: '#fff',
              color: '#222',
              fontWeight: 500,
              marginLeft: 0,
              padding: '0.3rem 0.7rem',
            }}
            disabled
          >
            결재요청
          </button>
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
            style={{
              flex: 1,
              fontSize: 16,
              border: '1px solid #b7d7c2',
              borderRadius: 4,
              padding: '0.3rem 0.7rem',
            }}
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
