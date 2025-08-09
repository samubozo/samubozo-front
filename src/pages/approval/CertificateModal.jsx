import React, { useState, useEffect } from 'react';
import styles from './CertificateModal.module.scss';
import modalStyles from './Modal.module.scss';
import { getKoreaToday } from '../../utils/dateUtils';
import SuccessModal from '../../components/SuccessModal';

function CertificateModal({
  onSubmit,
  onClose,
  loading = false,
  certData = [], // 추가: 신청 내역 전체 전달
}) {
  // 오늘 날짜를 yyyy-MM-dd로 계산 (한국 시간 기준)
  const todayStr = getKoreaToday();

  // 상태
  const [type, setType] = useState('EMPLOYMENT');
  const [requestDate, setRequestDate] = useState(todayStr);
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // 유효성 검사 함수 - 같은 타입의 증명서가 대기/승인 상태인지 확인 (반려는 재신청 가능)
  const isDuplicateRequest = () => {
    const t = (type || '').trim().toUpperCase();

    return certData.some((row) => {
      // 원본 타입 사용 (한글 변환 전)
      const rowType = (row.originalType || row.type || '').trim().toUpperCase();
      const rowStatus = (row.status || '').trim().toUpperCase();

      // 같은 타입이고 대기/승인 상태인 경우만 중복으로 처리 (반려는 제외)
      return (
        rowType === t &&
        ['대기', '승인', 'PENDING', 'APPROVED'].includes(rowStatus)
      );
    });
  };

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !requestDate || !purpose) {
      setError('모든 항목을 입력해 주세요.');
      return;
    }

    // 중복 신청 검사
    if (isDuplicateRequest()) {
      setError(
        `${requestDate}에 ${type === 'EMPLOYMENT' ? '재직증명서' : '경력증명서'}가 이미 신청되어 있습니다.`,
      );
      setShowSuccess(false);
      return;
    }

    setError('');
    try {
      const result = await onSubmit({ type, requestDate, purpose });
      // 실제로 성공했을 때만 성공 모달 표시
      if (result === true) {
        setShowSuccess(true);
        // 성공 후 2초 뒤에 모달 닫기 (자동 새로고침을 위해)
        setTimeout(() => {
          setShowSuccess(false);
          if (onClose) onClose();
        }, 2000);
      } else {
        setError('신청에 실패했습니다.');
        setShowSuccess(false);
      }
    } catch (err) {
      console.error('증명서 신청 에러:', err);

      // 중복 신청 에러 메시지 처리 (다양한 메시지 패턴 처리)
      if (
        err.message &&
        (err.message.includes('이미 유효한 동일한 유형') ||
          err.message.includes('이미 발급받으신') ||
          err.message.includes('server error')) // 임시로 server error도 중복 에러로 처리
      ) {
        const certTypeName =
          type === 'EMPLOYMENT' ? '재직증명서' : '경력증명서';
        setError(
          `이미 발급받으신 ${certTypeName}가 있습니다. 만료일을 확인해주세요.`,
        );
      } else {
        setError(err.message || '신청에 실패했습니다.');
      }
      setShowSuccess(false);
    }
  };

  // 성공 모달 렌더링
  if (showSuccess) {
    return (
      <SuccessModal
        message='증명서 신청이 완료되었습니다.'
        onClose={() => {
          setShowSuccess(false);
          if (onClose) onClose();
        }}
        autoClose={true}
        autoCloseDelay={3000}
      />
    );
  }

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <div className={styles.certModalHeader}>
          <div className={styles.certHeaderContent}>
            <div className={styles.certModalTitle}>증명서 신청</div>
            <button className={modalStyles.modalClose} onClick={onClose}>
              ×
            </button>
          </div>
          <div className={styles.headerDivider} />
        </div>
        <form onSubmit={handleSubmit} className={styles.certFormWrap}>
          <div className={styles.formContainer}>
            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor='type'>
                증명서 구분
              </label>
              <select
                id='type'
                className={styles.formSelect}
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value='EMPLOYMENT'>재직증명서</option>
                <option value='CAREER'>경력증명서</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor='requestDate'>
                발급일자
              </label>
              <input
                id='requestDate'
                className={styles.formInput}
                type='date'
                value={todayStr}
                readOnly
                placeholder='오늘 날짜로 자동 설정됩니다'
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel} htmlFor='purpose'>
                용도
              </label>
              <textarea
                id='purpose'
                className={styles.formTextarea}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder='예: 대출, 제출용 등'
                maxLength={100}
              />
            </div>
            {error && <div className={styles.errorMessage}>{error}</div>}
          </div>
          <div className={styles.buttonContainer}>
            <button
              type='submit'
              className={styles.submitButton}
              disabled={loading}
            >
              신청
            </button>
            <button
              type='button'
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CertificateModal;
