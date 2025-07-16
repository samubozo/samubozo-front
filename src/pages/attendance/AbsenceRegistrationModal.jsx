import React, { useState } from 'react';
import styles from './AbsenceRegistrationModal.module.scss';

const todayStr = new Date().toISOString().slice(0, 10);

const absenceTypes = [
  { value: '출장', label: '출장' },
  { value: '연수', label: '연수' },
  { value: '연차', label: '연차' },
  { value: '반차', label: '반차' },
  { value: '외출', label: '외출' },
  { value: '기타', label: '기타' },
];

const AbsenceRegistrationModal = ({ open, onClose, onSubmit }) => {
  const [type, setType] = useState('출장');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [time, setTime] = useState('09:00');
  const [reason, setReason] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit({ type, startDate, endDate, time, reason });
    if (onClose) onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>부재 등록</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label>부재 유형</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {absenceTypes.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.row}>
            <label>날짜 선택</label>
            <input
              type='date'
              min={todayStr}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>~</span>
            <input
              type='date'
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className={styles.row}>
            <label>시간</label>
            <input
              type='text'
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder='예: 09:00'
              style={{ width: 120 }}
            />
          </div>
          <div className={styles.row}>
            <label>사유</label>
            <input
              type='text'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder=''
            />
          </div>
          <div className={styles.buttonRow}>
            <button type='submit' className={styles.confirmBtn}>
              등록
            </button>
            <button
              type='button'
              className={styles.cancelBtn}
              onClick={onClose}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AbsenceRegistrationModal;
