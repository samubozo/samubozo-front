import React, { useEffect, useRef, useState } from 'react';
import styles from './VerifyModal.module.scss';

const VERIFY_TIME = 1800;

const pad = (n) => n.toString().padStart(2, '0');

const VerifyModal = ({ email, onClose, onResend, onComplete }) => {
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(VERIFY_TIME);

  const timerRef = useRef();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleResend = async () => {
    if (timer > 0) return;
    await onResend?.();
    setTimer(VERIFY_TIME);
    setCode('');
  };

  const handleComplete = () => {
    if (code.length !== 6) return;
    onComplete?.(code);
  };

  const handleInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCode(value);
  };

  const min = pad(Math.floor(timer / 60));
  const sec = pad(timer % 60);
  const timerStr = `${min}:${sec}`;

  return (
    <div className={styles.modalDim}>
      <div className={styles.verifyModal}>
        <h2 className={styles.modalTitle}>인증번호 입력</h2>
        <div className={styles.modalEmail}>{email}</div>
        <div className={styles.modalRow}>
          <span className={styles.modalTimer}>{timerStr}</span>
          <input
            className={styles.modalInput}
            type='text'
            inputMode='numeric'
            pattern='[0-9]*'
            value={code}
            onChange={handleInput}
            maxLength={6}
            disabled={timer === 0 ? false : false}
            placeholder='인증번호'
          />
          <button
            className={styles.modalResend}
            onClick={handleResend}
            disabled={timer > 0}
            style={{
              color: timer > 0 ? '#888' : '#0066FF',
              cursor: timer > 0 ? 'default' : 'pointer',
            }}
            type='button'
          >
            재발송
          </button>
        </div>
        <div className={styles.modalBtns}>
          <button
            className={styles.modalComplete}
            onClick={handleComplete}
            disabled={code.length !== 6}
            style={{
              background: '#5CBF8E',
              color: 'white',
              opacity: code.length === 6 ? 1 : 0.6,
              cursor: code.length === 6 ? 'pointer' : 'default',
            }}
            type='button'
          >
            완료
          </button>
          <button
            className={styles.modalCancel}
            onClick={onClose}
            type='button'
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyModal;
