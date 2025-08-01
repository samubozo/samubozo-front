import React, { useState, useEffect } from 'react';
import styles from './AbsenceEditModal.module.scss';

const typeOptions = [
  { value: 'BUSINESS_TRIP', label: '출장' },
  { value: 'TRAINING', label: '연수' },
  { value: 'SHORT_LEAVE', label: '외출' },
  { value: 'SICK_LEAVE', label: '병가' },
  { value: 'OFFICIAL_LEAVE', label: '공가' },
  { value: 'ETC', label: '기타' },
];

const urgencyOptions = [
  { value: 'NORMAL', label: '일반' },
  { value: 'URGENT', label: '긴급' },
];

const AbsenceEditModal = ({ open, onClose, absence, onSubmit, onDelete }) => {
  const [type, setType] = useState(absence?.type || '');
  const [urgency, setUrgency] = useState(absence?.urgency || 'NORMAL');
  const [startDate, setStartDate] = useState(absence?.startDate || '');
  const [endDate, setEndDate] = useState(absence?.endDate || '');
  const [startTime, setStartTime] = useState(absence?.startTime || '');
  const [endTime, setEndTime] = useState(absence?.endTime || '');
  const [reason, setReason] = useState(absence?.reason || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (absence) {
      setType(absence.type); // ENUM 값이 들어오도록 보장
      setUrgency(absence.urgency || 'NORMAL');
      setStartDate(absence.startDate);
      setEndDate(absence.endDate);
      setStartTime(absence.startTime);
      setEndTime(absence.endTime);
      setReason(absence.reason);
    }
  }, [absence]);

  // 부재 타입 변경 시 긴급도 자동 설정
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);

    // 부재 타입에 따른 긴급도 자동 설정
    if (newType === 'SICK_LEAVE' || newType === 'OFFICIAL_LEAVE') {
      setUrgency('URGENT');
    } else {
      setUrgency('NORMAL');
    }
  };

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
      urgency,
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
            <select value={type} onChange={handleTypeChange}>
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.row}>
            <label>긴급도</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
            >
              {urgencyOptions.map((opt) => (
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
              placeholder='HH:mm'
              style={{ width: 120 }}
            />
            <span>~</span>
            <input
              type='text'
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder='HH:mm'
              style={{ width: 120 }}
            />
          </div>
          <div className={styles.row}>
            <label>사유</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='부재 사유를 입력하세요'
              style={{
                flex: '1',
                height: '80px',
                resize: 'vertical',
                border: '1px solid #b7d7c2',
                borderRadius: '4px',
                padding: '0.5rem 0.7rem',
                fontSize: '1rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div className={styles.buttonRow}>
            <button type='submit' className={styles.submitBtn}>
              수정
            </button>
            <button
              type='button'
              onClick={handleDelete}
              className={styles.deleteBtn}
            >
              삭제
            </button>
          </div>
        </form>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className={styles.deleteConfirmOverlay}>
          <div className={styles.deleteConfirmModal}>
            <h3>삭제 확인</h3>
            <p>정말 삭제하시겠습니까?</p>
            <div className={styles.deleteConfirmButtons}>
              <button onClick={cancelDelete} className={styles.cancelBtn}>
                취소
              </button>
              <button
                onClick={confirmDelete}
                className={styles.confirmDeleteBtn}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsenceEditModal;
