import React, { useState, useContext } from 'react';
import styles from './RejectModal.module.scss';
import modalStyles from './Modal.module.scss';
import AuthContext from '../../context/UserContext';

function RejectModal({ open, onClose, onConfirm, loading }) {
  const [comment, setComment] = useState('');
  const { user } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(comment);
    setComment('');
  };

  if (!open) return null;

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        {/* 헤더 영역 */}
        <div className={styles.rejectModalHeader}>
          <button className={modalStyles.modalClose} onClick={onClose}>
            ×
          </button>
          <h3 className={styles.rejectModalTitle}>반려 사유 입력</h3>
        </div>

        {/* 본문 영역 */}
        <div className={styles.rejectModalBody}>
          {/* 반려 처리자 정보 */}
          <div className={styles.processorInfo}>
            <strong>반려 처리자:</strong> {user?.userName || '관리자'} (
            {user?.department || '부서 정보 없음'})
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* 텍스트 영역 */}
            <div className={styles.textAreaContainer}>
              <label className={styles.label}>반려 사유 (선택사항)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder='반려 사유를 입력해주세요...'
                rows={6}
                className={styles.textarea}
              />
            </div>

            {/* 버튼 영역 */}
            <div className={styles.buttonContainer}>
              <button
                type='button'
                onClick={onClose}
                disabled={loading}
                className={styles.cancelButton}
              >
                취소
              </button>
              <button
                type='submit'
                disabled={loading}
                className={styles.rejectButton}
              >
                {loading ? '처리 중...' : '반려 처리'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RejectModal;
