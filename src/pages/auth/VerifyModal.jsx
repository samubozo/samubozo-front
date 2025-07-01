import React, { useState } from 'react';
import styles from './VerifyModal.module.scss';

const VerifyModal = ({ email, onClose, onResend, onComplete, timer }) => {
  const [code, setCode] = useState('');

  return (
    <div className={styles.modalDim}>
      <div className={styles.verifyModal}>
        <h2 className={styles.modalTitle}>인증번호 입력</h2>
        <div className={styles.modalEmail}>{email}</div>
        <div className={styles.modalRow}>
          <span className={styles.modalTimer}>{timer}</span>
          <input
            className={styles.modalInput}
            type='text'
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button className={styles.modalResend} onClick={onResend}>
            재발송
          </button>
        </div>
        <div className={styles.modalBtns}>
          <button
            className={styles.modalComplete}
            onClick={() => onComplete(code)}
          >
            완료
          </button>
          <button className={styles.modalCancel} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyModal;
