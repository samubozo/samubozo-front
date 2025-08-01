import React, { useState } from 'react';
import styles from './PasswordUpdate.module.scss';
import SuccessModal from '../../components/SuccessModal';
import Logo from '../../assets/samubozo-logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, AUTH } from '../../configs/host-config';

export default function PasswordUpdate() {
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email, code } = location.state || {};

  const handleResetPassword = async () => {
    if (!password || !passwordCheck) {
      setSuccessMessage('비밀번호를 모두 입력하세요.');
      setShowSuccessModal(true);
      return;
    }
    if (password !== passwordCheck) {
      setSuccessMessage('비밀번호가 일치하지 않습니다.');
      setShowSuccessModal(true);
      return;
    }
    if (!email || !code) {
      setSuccessMessage('비정상적인 접근입니다.');
      setShowSuccessModal(true);
      return;
    }
    try {
      await axiosInstance.post(`${API_BASE_URL}${AUTH}/reset-password`, {
        email,
        code,
        newPassword: password,
      });
      setSuccessMessage('비밀번호가 재설정되었습니다.');
      setShowSuccessModal(true);
      navigate('/');
    } catch (e) {
      setSuccessMessage(e.response?.data?.message || '비밀번호 재설정 실패');
      setShowSuccessModal(true);
    }
  };

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
              autoComplete='new-password'
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
              autoComplete='new-password'
            />
          </div>
          <div className={styles.nextBtnRow}>
            <button className={styles.nextBtn} onClick={handleResetPassword}>
              비밀번호 변경
            </button>
          </div>
        </div>
      </div>

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
