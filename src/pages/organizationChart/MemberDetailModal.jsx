import React from 'react';
import styles from './OrgChart.module.scss';

function MemberDetailModal({ open, onClose, member }) {
  if (!open || !member) return null;

  // 더미 데이터로 부족한 정보 보완
  const memberDetail = {
    ...member,
    phone: member.phone || '010-1234-5678',
    email:
      member.email ||
      `${member.name.toLowerCase().replace(/\s+/g, '')}@samubozo.com`,
    address:
      member.address || '서울특별시 강남구 테헤란로 123 사무보조빌딩 8층',
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.memberDetailModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.memberDetailHeader}>
          <h2 className={styles.memberDetailTitle}>멤버 상세 정보</h2>
          <button className={styles.memberDetailCloseBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.memberDetailContent}>
          <div className={styles.memberDetailPhoto}>
            <img
              src={memberDetail.image}
              alt={memberDetail.name}
              onError={(e) =>
                (e.target.src =
                  'https://via.placeholder.com/120x120?text=No+Image')
              }
            />
          </div>

          <div className={styles.memberDetailInfo}>
            <div className={styles.memberDetailRow}>
              <span className={styles.memberDetailLabel}>이름</span>
              <span className={styles.memberDetailValue}>
                {memberDetail.name}
              </span>
            </div>

            <div className={styles.memberDetailRow}>
              <span className={styles.memberDetailLabel}>직책</span>
              <span className={styles.memberDetailValue}>
                {memberDetail.position}
              </span>
            </div>

            <div className={styles.memberDetailRow}>
              <span className={styles.memberDetailLabel}>부서</span>
              <span className={styles.memberDetailValue}>
                <span
                  className={styles.memberDetailBadge}
                  style={{ background: memberDetail.badgeColor }}
                >
                  {memberDetail.role}
                </span>
              </span>
            </div>

            <div className={styles.memberDetailRow}>
              <span className={styles.memberDetailLabel}>휴대폰</span>
              <span className={styles.memberDetailValue}>
                {memberDetail.phone}
              </span>
            </div>

            <div className={styles.memberDetailRow}>
              <span className={styles.memberDetailLabel}>이메일</span>
              <span className={styles.memberDetailValue}>
                {memberDetail.email}
              </span>
            </div>

            <div className={styles.memberDetailRow}>
              <span className={styles.memberDetailLabel}>주소</span>
              <span className={styles.memberDetailValue}>
                {memberDetail.address}
              </span>
            </div>

            <div className={styles.memberDetailRow}>
              <span className={styles.memberDetailLabel}>근무 기간</span>
              <span className={styles.memberDetailValue}>
                {memberDetail.period}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.memberDetailActions}>
          <button className={styles.memberDetailBtn} onClick={onClose}>
            닫기
          </button>
          <button className={styles.memberDetailBtnPrimary}>쪽지 보내기</button>
        </div>
      </div>
    </div>
  );
}

export default MemberDetailModal;
