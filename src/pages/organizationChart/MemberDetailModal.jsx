import React, { useCallback } from 'react';
import styles from './OrgChart.module.scss';
import { getContrastColor } from './OrgChart';

function MemberDetailModal({ open, onClose, member, onSendMessage, isSelf }) {
  if (!open || !member) return null;

  // 실제 API 데이터 구조에 맞게 매핑 - 더미 데이터 보완 최소화
  const memberDetail = {
    name: member.userName || member.name || '이름 없음',
    position: member.positionName || member.position || '직책 없음',
    department: member.departmentName || member.department?.name || '부서 없음',
    image:
      member.profileImage ||
      member.image ||
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjYwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=',
    // 실제 API에서 제공되는 정보만 사용, 더미 데이터 최소화
    phone: member.phone || member.phoneNumber || '연락처 정보 없음',
    email: member.email || member.emailAddress || '이메일 정보 없음',
    address: member.address || '주소 정보 없음',
    period: member.hireDate
      ? `${new Date(member.hireDate).getFullYear()}년 입사`
      : '근무 기간 정보 없음',
    // 부서 배지 색상 (실제 API에서 제공되지 않으면 기본값)
    badgeColor:
      member.departmentColor || member.department?.departmentColor || '#e6f0fb',
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
              onError={(e) => {
                // 에러 시 기본 SVG 이미지로 대체
                e.target.src =
                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjYwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
              }}
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
                  style={{
                    background: memberDetail.badgeColor,
                    color: getContrastColor(memberDetail.badgeColor),
                  }}
                >
                  {memberDetail.department}
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
          {!isSelf && (
            <button
              className={styles.memberDetailBtnPrimary}
              onClick={() => onSendMessage && onSendMessage(member)}
            >
              쪽지 보내기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberDetailModal;
