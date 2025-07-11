import React, { useState, useEffect } from 'react';
import styles from './AbsenceEditModal.module.scss';

const AbsenceEditModal = ({ open, onClose, absence, onSubmit }) => {
  const [type, setType] = useState(absence?.type || '');
  const [startDate, setStartDate] = useState(absence?.startDate || '');
  const [endDate, setEndDate] = useState(absence?.endDate || '');
  const [startTime, setStartTime] = useState(absence?.startTime || '');
  const [endTime, setEndTime] = useState(absence?.endTime || '');
  const [reason, setReason] = useState(absence?.reason || '');

  useEffect(() => {
    if (absence) {
      setType(absence.type);
      setStartDate(absence.startDate);
      setEndDate(absence.endDate);
      setStartTime(absence.startTime);
      setEndTime(absence.endTime);
      setReason(absence.reason);
    }
  }, [absence]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...absence,
      type,
      startDate,
      endDate,
      startTime,
      endTime,
      reason,
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>부재 수정</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label>부재 유형</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value='출장'>출장</option>
              <option value='연수'>연수</option>
              <option value='연차'>연차</option>
              <option value='반차'>반차</option>
              <option value='외출'>외출</option>
              <option value='기타'>기타</option>
            </select>
          </div>
          <div className={styles.row}>
            <label>날짜 선택</label>
            <input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>~</span>
            <input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className={styles.row}>
            <label>시간</label>
            <input
              type='text'
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ width: 80 }}
            />
            <span>~</span>
            <input
              type='text'
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{ width: 80 }}
            />
          </div>
          <div className={styles.row}>
            <label>사유</label>
            <input
              type='text'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className={styles.buttonRow}>
            <button type='submit' className={styles.confirmBtn}>
              수정
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

export default AbsenceEditModal;
