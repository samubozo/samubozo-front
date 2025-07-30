import React, { useState } from 'react';
import styles from './PasswordFind.module.scss';
import SuccessModal from '../../components/SuccessModal';
import Logo from '../../assets/samubozo-logo.png';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, AUTH } from '../../configs/host-config';
import Tooltip from '@mui/material/Tooltip';

export default function PasswordFind() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeRequested, setCodeRequested] = useState(false); // 인증번호 요청 여부
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // 인증번호 발송 및 재전송 (버튼 텍스트/쿨타임 관리)
  const handleSendOrResendCode = async () => {
    if (!email || resendCooldown > 0) return;
    try {
      await axiosInstance.post(`${API_BASE_URL}${AUTH}/find-password`, {
        email,
      });
      if (!codeRequested) {
        setSuccessMessage('인증번호가 발송되었습니다.');
        setShowSuccessModal(true);
        setCodeRequested(true);
      } else {
        setSuccessMessage('인증번호가 재발송되었습니다.');
        setShowSuccessModal(true);
      }
      setCodeSent(true);
      setResendCooldown(20); // 20초 쿨타임
    } catch (e) {
      setSuccessMessage(e.response?.data?.message || '인증번호 발송 실패');
      setShowSuccessModal(true);
    }
  };

  const handleVerifyCode = async () => {
    if (!email || !code) {
      setSuccessMessage('이메일과 인증번호를 입력하세요.');
      setShowSuccessModal(true);
      return;
    }
    try {
      await axiosInstance.post(`${API_BASE_URL}${AUTH}/verify-code`, {
        email,
        code,
      });
      setSuccessMessage('인증 성공! 비밀번호 변경 페이지로 이동합니다.');
      setShowSuccessModal(true);
      navigate('/passwordUpdate', { state: { email, code } });
    } catch (e) {
      setSuccessMessage(e.response?.data?.message || '인증 실패');
      setShowSuccessModal(true);
    }
  };

  // 쿨타임 타이머
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

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
              onClick={handleSendOrResendCode}
              disabled={!email || resendCooldown > 0}
            >
              {resendCooldown > 0
                ? `재전송 (${resendCooldown}s)`
                : codeRequested
                  ? '재전송'
                  : '인증번호 받기'}
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
            <Tooltip
              title={
                <div style={{ whiteSpace: 'pre-line', fontSize: 15 }}>
                  - 스팸메일함을 확인해 주세요.
                  <br />
                  - 이메일 주소가 올바른지 다시 한번 확인해 주세요.
                  <br />- 그래도 메일이 오지 않으면, 관리자에게 문의해 주세요.
                  (it-support@samubozo.com)
                </div>
              }
              placement='bottom'
              arrow
            >
              <span>
                <button className={styles.infoBtn} tabIndex={0} type='button'>
                  ?
                </button>
              </span>
            </Tooltip>
          </div>
          <div className={styles.nextBtnRow}>
            <button
              className={styles.nextBtn}
              onClick={handleVerifyCode}
              disabled={!codeSent || !code}
            >
              다음
            </button>
          </div>
        </div>
      </div>

      {/* 성공 모달 */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessMessage('');
          }}
        />
      )}
    </div>
  );
}
