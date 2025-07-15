import React from 'react';
import styles from './OrgChart.module.scss';
import { getContrastColor } from './OrgChart';

// 카드형 멤버(유저) 카드 - 실제 API 데이터 구조에 맞게 수정
function OrgCard({ user, onClick }) {
  // 실제 API 데이터 구조에 맞게 매핑
  const userData = {
    name: user.userName || user.name || '이름 없음',
    position: user.positionName || user.position || '직책 없음',
    department: user.departmentName || user.department?.name || '부서 없음',
    image:
      user.profileImage ||
      user.department?.imageUrl ||
      user.image ||
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDMyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE2MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K',
    // 실제 API에서 제공되지 않는 필드들은 기본값으로 처리
    badge: user.departmentName || user.department?.name || '부서',
    desc: user.positionName || user.position || '직책',
    period: user.hireDate
      ? `${new Date(user.hireDate).getFullYear()}년 입사`
      : '근무 기간 정보 없음',
    // 부서 색상 정보 추가
    departmentColor:
      user.departmentColor || user.department?.departmentColor || '#e6f0fb',
  };

  return (
    <div className={styles.orgCard} onClick={onClick}>
      <div className={styles.orgCardImgWrap}>
        <img
          src={userData.image}
          alt={userData.name}
          className={styles.orgCardImg}
          onError={(e) => {
            // 에러 시 기본 SVG 이미지로 대체
            e.target.src =
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDMyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE2MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
          }}
        />
      </div>
      <div className={styles.orgCardBody}>
        <div className={styles.orgCardNameRow}>
          <span className={styles.orgCardName}>{userData.name}</span>
          <span
            className={styles.orgCardBadge}
            style={{
              backgroundColor: userData.departmentColor,
              color: getContrastColor(userData.departmentColor),
            }}
          >
            {userData.badge}
          </span>
        </div>
        <div className={styles.orgCardPosition}>{userData.position}</div>
        {/* <div className={styles.orgCardDesc}>{userData.desc}</div> */}
        <div className={styles.orgCardPeriod}>{userData.period}</div>
      </div>
    </div>
  );
}

export default OrgCard;
