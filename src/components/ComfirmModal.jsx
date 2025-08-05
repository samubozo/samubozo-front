import React from 'react';
import styles from './SuccessModal.module.scss';

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.successIcon}>❓</div>
        <div className={styles.successMessage}>{message}</div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          <button
            className={styles.successCloseBtn}
            onClick={onConfirm}
            style={{ backgroundColor: '#1fa366', color: '#fff' }}
          >
            확인
          </button>
          <button
            className={styles.successCloseBtn}
            onClick={onCancel}
            style={{ backgroundColor: '#ccc', color: '#333' }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
