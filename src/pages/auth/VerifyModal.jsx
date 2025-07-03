import React, { useEffect, useRef, useState } from 'react';
import styles from './VerifyModal.module.scss';

const VERIFY_TIME = 1800; // 30분

const pad = (n) => n.toString().padStart(2, '0');

const VerifyModal = ({ email, onClose, onResend, onComplete }) => {
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(VERIFY_TIME);

  const timerRef = useRef();

  // 타이머 동작 (1초씩 감소)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // 재발송 로직
  const handleResend = async () => {
    if (timer > 0) return; // 0일 때만 허용
    await onResend?.();
    setTimer(VERIFY_TIME);
    setCode('');
  };

  // 완료 버튼 클릭
  const handleComplete = () => {
    if (code.length !== 6) return;
    onComplete?.(code);
  };

  // 숫자만 입력되게 처리
  const handleInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCode(value);
  };

  // mm:ss 변환
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
            disabled={timer === 0 ? false : false} // 디자인 건들지 말라 했으니 0이어도 입력만 비활성화 X
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
