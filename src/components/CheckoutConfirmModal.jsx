import React from 'react';
import styles from './CheckoutConfirmModal.module.scss';

function CheckoutConfirmModal({ isOpen, onConfirm, onCancel, currentTime }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>퇴근 확인</h3>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.confirmMessage}>정말로 퇴근하시겠습니까?</div>
          <div className={styles.timeInfo}>현재 시간: {currentTime}</div>
        </div>
        <div className={styles.modalFooter}>
          <button
            className={`${styles.modalButton} ${styles.cancelButton}`}
            onClick={onCancel}
          >
            취소
          </button>
          <button
            className={`${styles.modalButton} ${styles.confirmButton}`}
            onClick={onConfirm}
          >
            퇴근하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutConfirmModal;
