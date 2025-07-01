// OrgChart.jsx
import React from 'react';
import styles from './OrgChart.module.scss';

const orgData = {
  name: '김예은',
  role: 'CEO',
  roleColor: 'ceo',
  children: [
    {
      name: '이호영',
      role: 'Marketing',
      roleColor: 'marketing',
      children: [
        {
          name: '삼호영',
          role: 'Marketing',
          roleColor: 'marketing',
          email: 'bbb@samubozo.com',
          phone: '02-1234-5678',
        },
      ],
    },
  ],
};

const OrgNode = ({ node }) => {
  return (
    <div className={styles.nodeGroup}>
      <div className={styles.profileCard}>
        <div className={styles.profilePhoto}></div>
        <div className={styles.profileName}>{node.name}</div>
        <div className={`${styles.roleBadge} ${styles[node.roleColor]}`}>
          {node.role}
        </div>
        {node.email && (
          <div className={styles.detailBox}>
            <div>{node.role}부</div>
            <div>{node.email}</div>
            <div>{node.phone}</div>
            <button className={styles.messageBtn}>쪽지 보내기</button>
          </div>
        )}
      </div>
      {node.children && (
        <div className={styles.childContainer}>
          {node.children.map((child) => (
            <OrgNode node={child} key={child.name} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrgChart = () => {
  return (
    <div className={styles.chartContainer}>
      <OrgNode node={orgData} />
    </div>
  );
};

export default OrgChart;
