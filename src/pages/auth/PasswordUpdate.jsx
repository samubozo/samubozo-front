import React, { useState } from 'react';
import styles from './PasswordUpdate.module.scss';
import Logo from '../../assets/samubozo-logo.png';
import { useNavigate } from 'react-router-dom';

export default function PasswordUpdate() {
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const navigate = useNavigate();

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginBox}>
        <div className={styles.logoSection}>
          <img src={Logo} alt='로고' />
        </div>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <span style={{ fontSize: 26, marginRight: 2 }}>←</span> 뒤로가기
        </button>
        <div className={styles.title}>비밀번호 변경</div>
        <div className={styles.findBox}>
          <div className={styles.inputRow}>
            <label className={styles.label}>새 비밀번호</label>
            <input
              type='password'
              className={styles.input}
              placeholder='새 비밀번호 입력'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={styles.inputRow}>
            <label className={styles.label}>비밀번호 확인</label>
            <input
              type='password'
              className={styles.input}
              placeholder='새 비밀번호 확인'
              value={passwordCheck}
              onChange={(e) => setPasswordCheck(e.target.value)}
            />
          </div>
          <div className={styles.nextBtnRow}>
            <button className={styles.nextBtn}>비밀번호 변경</button>
          </div>
        </div>
      </div>
    </div>
  );
}
