import React from 'react';
import styles from './OrgChart.module.scss';
import { getContrastColor } from './OrgChart';

// 부서(팀) 카드 - 실제 API 데이터 구조에 맞게 수정
function OrgDeptCard({ dept, onClick }) {
  // 실제 API 데이터 구조에 맞게 매핑
  const deptData = {
    name: dept.name || dept.departmentName || '부서명 없음',
    desc: dept.description || dept.desc || '부서 설명 없음',
    count: dept.count || 0,
    image:
      dept.imageUrl ||
      dept.image ||
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDMyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE2MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRlcGFydG1lbnQ8L3RleHQ+Cjwvc3ZnPgo=',
  };

  return (
    <div
      className={styles.orgDeptCard}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.orgDeptCardImgWrap}>
        <img
          src={deptData.image}
          alt={deptData.name}
          className={styles.orgDeptCardImg}
          onError={(e) => {
            // 에러 시 기본 SVG 이미지로 대체
            e.target.src =
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDMyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE2MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRlcGFydG1lbnQ8L3RleHQ+Cjwvc3ZnPgo=';
          }}
        />
        <div className={styles.orgDeptCardOverlay} />
      </div>
      <div className={styles.orgDeptCardBody}>
        <div
          className={styles.orgDeptCardName}
          style={{
            background: dept.color,
            color: getContrastColor(dept.color),
          }}
        >
          {deptData.name}
        </div>
        {/* 부서 설명 제거 */}
        {/* <div className={styles.orgDeptCardDesc}>{deptData.desc}</div> */}
        <div className={styles.orgDeptCardCount}>{deptData.count}명</div>
      </div>
    </div>
  );
}

export default OrgDeptCard;
