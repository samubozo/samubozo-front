import React from 'react';
import styles from './Approval.module.scss';

function ApprovalTabs({ tab, setTab }) {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tabBtn} ${tab === 'certificate' ? styles.activeTab : ''}`}
        onClick={() => setTab('certificate')}
      >
        증명서 내역
      </button>
      <button
        className={`${styles.tabBtn} ${tab === 'leave' ? styles.activeTab : ''}`}
        onClick={() => setTab('leave')}
      >
        연차/반차 내역
      </button>
    </div>
  );
}

export default ApprovalTabs;
