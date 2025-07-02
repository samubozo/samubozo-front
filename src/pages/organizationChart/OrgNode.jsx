import React, { useState } from 'react';
import styles from './OrgChart.module.scss';

function OrgNode({ node, onCardClick, selectedId, deptColorMap }) {
  const [hover, setHover] = useState(false);
  const isSelected = selectedId === node.name + node.position;
  const hasChildren = node.children && node.children.length > 0;
  // 부서 색상 적용
  const badgeColor = deptColorMap[node.department];

  return (
    <div className={styles.nodeTreeWrap}>
      <div className={styles.nodeGroup}>
        <div
          className={styles.profileCard}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => onCardClick(node)}
          style={{ zIndex: isSelected ? 20 : 1 }}
        >
          <div className={styles.profilePhoto}></div>
          <div className={styles.profileName}>{node.name}</div>
          <div className={styles.profilePosition}>{node.position}</div>
          <div
            className={styles.roleBadge}
            style={badgeColor ? { background: badgeColor, color: '#222' } : {}}
          >
            {node.role}
          </div>
          {(hover || isSelected) && node.email && (
            <div className={styles.detailBox}>
              <div>{node.department}</div>
              <div>{node.email}</div>
              <div>{node.phone}</div>
              <button className={styles.messageBtn}>쪽지 보내기</button>
            </div>
          )}
        </div>
        {/* 자식이 있을 때만 수직선 */}
        {hasChildren && <div className={styles.verticalLine}></div>}
      </div>
      {/* 자식이 있을 때만 하위 트리 렌더 */}
      {hasChildren && (
        <div className={styles.childrenRowWrap}>
          {/* 여러 자식이 있을 때만 수평선 */}
          {node.children.length > 1 && (
            <div className={styles.horizontalLine}></div>
          )}
          <div className={styles.childrenRow}>
            {node.children.map((child) => (
              <OrgNode
                node={child}
                key={child.name + child.position}
                onCardClick={onCardClick}
                selectedId={selectedId}
                deptColorMap={deptColorMap}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrgNode;
