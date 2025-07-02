import React from 'react';
import styles from './OrgChart.module.scss';

// 부서(팀) 카드
function OrgDeptCard({ dept, onClick }) {
  return (
    <div
      className={styles.orgDeptCard}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.orgDeptCardImgWrap}>
        <img
          src={dept.image}
          alt={dept.name}
          className={styles.orgDeptCardImg}
          onError={(e) =>
            (e.target.src = 'https://via.placeholder.com/320x120?text=No+Image')
          }
        />
        <div className={styles.orgDeptCardOverlay} />
      </div>
      <div className={styles.orgDeptCardBody}>
        <div className={styles.orgDeptCardName}>{dept.name}</div>
        <div className={styles.orgDeptCardDesc}>{dept.desc}</div>
        <div className={styles.orgDeptCardCount}>{dept.count}명</div>
      </div>
    </div>
  );
}

export default OrgDeptCard;
