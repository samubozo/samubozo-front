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

const timeOptions = Array.from({ length: 36 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

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

  // 부재 타입 변경
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
  };

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // type 필드 검증 (필수 필드)
    if (!type) {
      alert('부재 유형을 선택해주세요.');
      return;
    }

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
        {/* 부재 상태 표시 */}
        {absence?.status && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.5rem',
              backgroundColor:
                absence.status === 'PENDING' || absence.status === '대기'
                  ? '#fff3cd'
                  : '#f8d7da',
              border: '1px solid',
              borderColor:
                absence.status === 'PENDING' || absence.status === '대기'
                  ? '#ffeaa7'
                  : '#f5c6cb',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            <strong>상태:</strong>{' '}
            {absence.status === 'PENDING' || absence.status === '대기'
              ? '대기'
              : absence.status === 'APPROVED' || absence.status === '승인'
                ? '승인'
                : absence.status === 'REJECTED' || absence.status === '반려'
                  ? '반려'
                  : absence.status}
            {absence.status !== 'PENDING' && absence.status !== '대기' && (
              <span style={{ color: '#721c24', marginLeft: '0.5rem' }}>
                (승인되거나 반려된 부재는 수정할 수 없습니다)
              </span>
            )}
          </div>
        )}
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
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <span>~</span>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
            <button
              type='submit'
              className={styles.submitBtn}
              disabled={
                absence?.status &&
                absence.status !== 'PENDING' &&
                absence.status !== '대기'
              }
            >
              수정
            </button>
            <button
              type='button'
              onClick={handleDelete}
              className={styles.deleteBtn}
              disabled={
                absence?.status &&
                absence.status !== 'PENDING' &&
                absence.status !== '대기'
              }
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
