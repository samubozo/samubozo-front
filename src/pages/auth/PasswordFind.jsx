import React, { useState } from 'react';
import styles from './PasswordFind.module.scss';
import Logo from '../../assets/samubozo-logo.png';
import { useNavigate } from 'react-router-dom';

export default function PasswordFind() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
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
        <div
          className={styles.findBox}
          style={{
            border: 'none',
            boxShadow: 'none',
            padding: 0,
            minWidth: 'unset',
            maxWidth: 'unset',
            background: 'none',
            margin: 0,
          }}
        >
          <div className={styles.inputRow}>
            <label className={styles.label}>이름</label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.inputRow}>
            <label className={styles.label}>이메일</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${styles.input} ${styles.inputEmail}`}
            />
            <button
              className={styles.codeBtn}
              onClick={() => setCodeSent(true)}
            >
              인증번호 받기
            </button>
          </div>
          <div style={{ marginBottom: 18 }}>
            <input
              type='text'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder='인증번호 6자리 숫자 입력'
              className={styles.codeInput}
              disabled={!codeSent}
            />
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoText}>인증번호가 오지 않나요</span>
            <button className={styles.infoBtn}>?</button>
          </div>
          <div className={styles.nextBtnRow}>
            <button
              className={styles.nextBtn}
              onClick={() => navigate('/passwordUpdate')}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
