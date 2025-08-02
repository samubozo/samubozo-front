import React, { useState, useEffect } from 'react';
import styles from './Approval.module.scss';
import absenceModalStyles from '../attendance/AbsenceRegistrationModal.module.scss';
import editModalStyles from '../attendance/AbsenceEditModal.module.scss';
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
      setError(err.message || '신청에 실패했습니다.');
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
    <div className={styles.modalOverlay}>
      <div
        className={styles.modalContent}
        style={{
          minWidth: 440,
          maxWidth: 520,
          borderRadius: 18,
          boxShadow: '0 10px 40px rgba(0,0,0,0.16)',
          padding: 0,
        }}
      >
        <div
          style={{
            padding: '36px 40px 0 40px',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div
              className={styles.certFormTitle}
              style={{
                fontWeight: 800,
                fontSize: 24,
                color: '#222',
                letterSpacing: -1,
                margin: 0,
              }}
            >
              증명서 신청
            </div>
            <button
              className={styles.modalClose}
              onClick={onClose}
              style={{
                fontSize: 32,
                color: '#bbb',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginRight: -10,
                marginTop: -10,
                transition: 'color 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#e74c3c')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#bbb')}
            >
              ×
            </button>
          </div>
          <div
            style={{ borderBottom: '1.5px solid #e0e0e0', marginBottom: 24 }}
          />
        </div>
        <form
          onSubmit={handleSubmit}
          className={styles.certFormWrap}
          style={{ padding: '0 40px 36px 40px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ marginBottom: 0 }}>
              <label
                className={styles.filterLabel}
                htmlFor='type'
                style={{ fontWeight: 700, fontSize: 16, color: '#222' }}
              >
                증명서 구분
              </label>
              <select
                id='type'
                className={styles.dropdownSelected}
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 8,
                  height: 44,
                  fontSize: 16,
                  borderRadius: 8,
                  border: '1.5px solid #cfd8dc',
                  background: '#fafbfc',
                  paddingLeft: 12,
                  boxSizing: 'border-box',
                }}
              >
                <option value='EMPLOYMENT'>재직증명서</option>
                <option value='CAREER'>경력증명서</option>
              </select>
            </div>
            <div style={{ marginBottom: 0 }}>
              <label
                className={styles.filterLabel}
                htmlFor='requestDate'
                style={{ fontWeight: 700, fontSize: 16, color: '#222' }}
              >
                발급일자
              </label>
              <input
                id='requestDate'
                className={styles.datePicker}
                type='date'
                value={todayStr}
                readOnly
                style={{
                  width: '100%',
                  marginTop: 8,
                  height: 44,
                  fontSize: 16,
                  borderRadius: 8,
                  border: '1.5px solid #cfd8dc',
                  background: '#f5f5f5',
                  paddingLeft: 12,
                  boxSizing: 'border-box',
                  color: '#666',
                  cursor: 'not-allowed',
                }}
                placeholder='오늘 날짜로 자동 설정됩니다'
              />
            </div>
            <div style={{ marginBottom: 0 }}>
              <label
                className={styles.filterLabel}
                htmlFor='purpose'
                style={{ fontWeight: 700, fontSize: 16, color: '#222' }}
              >
                용도
              </label>
              <textarea
                id='purpose'
                className={styles.filterInput}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 8,
                  minHeight: 100,
                  borderRadius: 8,
                  fontSize: 16,
                  border: '1.5px solid #cfd8dc',
                  background: '#fafbfc',
                  padding: 12,
                  color: '#222',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
                placeholder='예: 대출, 제출용 등'
                maxLength={100}
              />
            </div>
            {error && (
              <div
                style={{
                  color: '#e74c3c',
                  fontSize: '14px',
                  fontWeight: 400,
                  marginTop: '4px',
                  marginBottom: '8px',
                }}
              >
                {error}
              </div>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 16,
              marginTop: 36,
            }}
          >
            <button
              type='button'
              className={styles.deleteBtn}
              onClick={onClose}
              disabled={loading}
              style={{
                minWidth: 100,
                height: 44,
                fontSize: 17,
                borderRadius: 8,
              }}
            >
              취소
            </button>
            <button
              type='submit'
              className={styles.approveBtn}
              disabled={loading}
              style={{
                minWidth: 100,
                height: 44,
                fontSize: 17,
                borderRadius: 8,
              }}
            >
              신청
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CertificateModal;
