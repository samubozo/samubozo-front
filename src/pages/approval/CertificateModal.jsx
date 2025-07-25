import React, { useState, useEffect } from 'react';
import styles from './Approval.module.scss';
import absenceModalStyles from '../attendance/AbsenceRegistrationModal.module.scss';
import editModalStyles from '../attendance/AbsenceEditModal.module.scss';

function CertificateModal({
  mode = 'create', // 'create' | 'edit'
  defaultValues = {},
  onSubmit,
  onClose,
  loading = false,
  certData = [], // 추가: 신청 내역 전체 전달
}) {
  // 상태
  const [type, setType] = useState(defaultValues.type || 'EMPLOYMENT');
  const [requestDate, setRequestDate] = useState(
    defaultValues.requestDate || '',
  );
  const [purpose, setPurpose] = useState(defaultValues.purpose || '');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // 오늘 날짜를 yyyy-MM-dd로 계산
  const todayStr = new Date().toISOString().slice(0, 10);

  // 유효성 검사 함수
  const isAlreadyApproved = () => {
    const t = (type || '').trim().toUpperCase();
    const d = (requestDate || '').trim();
    return certData.some((row) => {
      const rowType = (row.type || '').trim().toUpperCase();
      const rowDate = (row.requestDate || '').slice(0, 10);
      const rowStatus = (row.status || '').trim().toUpperCase();
      return rowType === t && rowDate === d && rowStatus === 'APPROVED';
    });
  };

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !requestDate || !purpose) {
      setError('모든 항목을 입력해 주세요.');
      return;
    }
    if (isAlreadyApproved()) {
      setError(
        `이미 승인된 ${type === 'EMPLOYMENT' ? '재직증명서' : '경력증명서'}는 재신청할 수 없습니다.`,
      );
      setShowSuccess(false);
      return;
    }
    setError('');
    try {
      await onSubmit({ type, requestDate, purpose });
      setShowSuccess(true);
    } catch (err) {
      setError(err.message || '신청에 실패했습니다.');
      setShowSuccess(false);
    }
  };

  useEffect(() => {
    if (mode === 'edit' && defaultValues) {
      setType(defaultValues.type || 'EMPLOYMENT');
      setRequestDate(defaultValues.requestDate || '');
      setPurpose(defaultValues.purpose || '');
    }
  }, [mode, defaultValues]);

  // 성공 모달 렌더링
  if (showSuccess) {
    return (
      <div className={editModalStyles.modalOverlay}>
        <div
          className={editModalStyles.modalContent}
          style={{
            textAlign: 'center',
            padding: '3.5rem 2.5rem 2.5rem 2.5rem',
          }}
        >
          <svg
            width='80'
            height='80'
            viewBox='0 0 64 64'
            style={{ margin: '0 auto 24px auto', display: 'block' }}
          >
            <polyline
              points='16,34 28,48 48,18'
              fill='none'
              stroke='#4caf50'
              strokeWidth='6'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <div
            style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              color: '#333',
              marginBottom: 18,
            }}
          >
            증명서 신청이 완료되었습니다.
          </div>
          <div
            className={editModalStyles.buttonRow}
            style={{ justifyContent: 'center' }}
          >
            <button
              className={editModalStyles.confirmBtn}
              onClick={() => {
                setShowSuccess(false);
                if (onClose) onClose();
              }}
            >
              확인
            </button>
          </div>
        </div>
      </div>
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
              {mode === 'edit' ? '증명서 수정' : '증명서 신청'}
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
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
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
                placeholder='발급일자를 선택하세요'
                min={todayStr}
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
              <div style={{ color: '#e74c3c', fontSize: 15, marginTop: -8 }}>
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
              {mode === 'edit' ? '수정' : '신청'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CertificateModal;
