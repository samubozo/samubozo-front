import React, { useState, useContext } from 'react';
import styles from './Approval.module.scss';
import AuthContext from '../../context/UserContext';

function RejectModal({ open, onClose, onConfirm, loading }) {
  const [comment, setComment] = useState('');
  const { user } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(comment);
    setComment('');
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div
        className={styles.modalContent}
        style={{
          minWidth: '500px',
          maxWidth: '600px',
          width: '90vw',
          maxHeight: '80vh',
          padding: '0',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 헤더 영역 */}
        <div
          style={{
            padding: '24px 32px 0 32px',
            position: 'relative',
          }}
        >
          <button
            className={styles.modalClose}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              fontSize: '24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#999',
              padding: '4px',
              borderRadius: '4px',
              transition: 'color 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.color = '#666')}
            onMouseOut={(e) => (e.target.style.color = '#999')}
          >
            ×
          </button>
          <h3
            style={{
              fontSize: '20px',
              marginBottom: '20px',
              fontWeight: '600',
              color: '#333',
            }}
          >
            반려 사유 입력
          </h3>
        </div>

        {/* 본문 영역 */}
        <div
          style={{
            padding: '0 32px 24px 32px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* 반려 처리자 정보 */}
          <div
            style={{
              marginBottom: '24px',
              padding: '16px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '15px',
              color: '#666',
              border: '1px solid #e9ecef',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <strong>반려 처리자:</strong> {user?.userName || '관리자'} (
            {user?.department || '부서 정보 없음'})
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {/* 텍스트 영역 */}
            <div
              style={{
                marginBottom: '24px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#333',
                }}
              >
                반려 사유 (선택사항)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder='반려 사유를 입력해주세요...'
                rows={6}
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '16px 20px',
                  fontSize: '15px',
                  lineHeight: '1.5',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  flex: 1,
                }}
              />
            </div>

            {/* 버튼 영역 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <button
                type='button'
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  fontSize: '15px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  color: '#666',
                  cursor: 'pointer',
                  minWidth: '80px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.borderColor = '#adb5bd';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                취소
              </button>
              <button
                type='submit'
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  fontSize: '15px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#e74c3c',
                  color: '#fff',
                  cursor: 'pointer',
                  minWidth: '100px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#c0392b';
                }}
                onMouseOut={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#e74c3c';
                }}
              >
                {loading ? '처리 중...' : '반려 처리'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RejectModal;
