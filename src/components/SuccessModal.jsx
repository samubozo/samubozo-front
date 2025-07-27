import React from 'react';
import styles from './SuccessModal.module.scss';

function SuccessModal({
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 3000,
}) {
  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.successIcon}>✓</div>
        <div className={styles.successMessage}>{message}</div>
        <button className={styles.successCloseBtn} onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}

export default SuccessModal;
