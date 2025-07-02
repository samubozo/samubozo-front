import React from 'react';
import styles from './OrgChart.module.scss';

// 카드형 멤버(유저) 카드
function OrgCard({ user, onClick }) {
  return (
    <div className={styles.orgCard} onClick={onClick}>
      <div className={styles.orgCardImgWrap}>
        <img
          src={user.image}
          alt={user.name}
          className={styles.orgCardImg}
          onError={(e) =>
            (e.target.src = 'https://via.placeholder.com/320x120?text=No+Image')
          }
        />
      </div>
      <div className={styles.orgCardBody}>
        <div className={styles.orgCardNameRow}>
          <span className={styles.orgCardName}>{user.name}</span>
          <span className={styles.orgCardBadge}>{user.badge}</span>
        </div>
        <div className={styles.orgCardPosition}>{user.position}</div>
        <div className={styles.orgCardDesc}>{user.desc}</div>
        <div className={styles.orgCardPeriod}>{user.period}</div>
      </div>
    </div>
  );
}

export default OrgCard;
