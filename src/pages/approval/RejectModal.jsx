import React, { useState } from 'react';
import styles from './Approval.module.scss';

function RejectModal({ open, onClose, onConfirm, loading }) {
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(comment);
    setComment('');
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.modalClose} onClick={onClose}>
          ×
        </button>
        <h3>반려 사유 입력</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>반려 사유 (선택사항)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='반려 사유를 입력해주세요...'
              rows={4}
              className={styles.textarea}
            />
          </div>
          <div className={styles.buttonRow}>
            <button
              type='submit'
              className={styles.confirmBtn}
              disabled={loading}
            >
              {loading ? '처리 중...' : '반려 처리'}
            </button>
            <button
              type='button'
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={loading}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RejectModal;
