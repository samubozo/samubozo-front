import React, { useState, useEffect } from 'react';
import styles from './AbsenceEditModal.module.scss';

const typeOptions = [
  { value: 'BUSINESS_TRIP', label: '출장' },
  { value: 'TRAINING', label: '연수' },
  { value: 'ANNUAL_LEAVE', label: '연차' },
  { value: 'HALF_DAY_LEAVE', label: '반차' },
  { value: 'SHORT_LEAVE', label: '외출' },
  { value: 'ETC', label: '기타' },
];

const AbsenceEditModal = ({ open, onClose, absence, onSubmit, onDelete }) => {
  const [type, setType] = useState(absence?.type || '');
  const [startDate, setStartDate] = useState(absence?.startDate || '');
  const [endDate, setEndDate] = useState(absence?.endDate || '');
  const [startTime, setStartTime] = useState(absence?.startTime || '');
  const [endTime, setEndTime] = useState(absence?.endTime || '');
  const [reason, setReason] = useState(absence?.reason || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (absence) {
      setType(absence.type); // ENUM 값이 들어오도록 보장
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
    // startTime, endTime이 'HH:mm' 포맷인지 보장 (예: '09:00')
    const formattedStartTime =
      startTime && startTime.length === 5 ? startTime : '';
    const formattedEndTime = endTime && endTime.length === 5 ? endTime : '';
    onSubmit({
      ...absence,
      type,
      startDate,
      endDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      reason,
    });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    if (onDelete) onDelete(absence.id);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.modalClose} onClick={onClose}>
          ×
        </button>
        <h2>부재 수정</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label>부재 유형</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {typeOptions.map((opt) => (
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
              className={styles.deleteBtn}
              onClick={handleDelete}
            >
              삭제
            </button>
          </div>
        </form>
        {showDeleteConfirm && (
          <div className={styles.deleteConfirmOverlay}>
            <div className={styles.deleteConfirmModal}>
              <div style={{ marginBottom: 16 }}>정말 삭제하시겠습니까?</div>
              <div
                style={{ display: 'flex', gap: 8, justifyContent: 'center' }}
              >
                <button className={styles.confirmBtn} onClick={confirmDelete}>
                  확인
                </button>
                <button className={styles.deleteBtn} onClick={cancelDelete}>
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbsenceEditModal;
