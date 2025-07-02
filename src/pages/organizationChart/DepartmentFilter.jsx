import React, { useState } from 'react';
import styles from './OrgChart.module.scss';

function DepartmentFilter({ selected, onChange, departments, onAddClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelect = (dept) => {
    if (!selected.includes(dept.name)) {
      onChange([...selected, dept.name]);
    }
  };

  const handleRemove = (dept) => {
    onChange(selected.filter((d) => d !== dept));
  };

  return (
    <div className={styles.deptFilterWrap}>
      <div className={styles.multiSelectWrap}>
        <div
          className={styles.multiSelectBox}
          onClick={() => setDropdownOpen((v) => !v)}
        >
          {selected.length === 0 ? (
            <span className={styles.placeholder}>전 부서</span>
          ) : (
            selected.map((dept) => {
              const deptObj = departments.find((d) => d.name === dept);
              return (
                <span
                  className={styles.deptTag}
                  key={dept}
                  style={
                    deptObj
                      ? {
                          background: deptObj.color,
                          borderColor: deptObj.color,
                        }
                      : {}
                  }
                >
                  {dept}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(dept);
                    }}
                    className={styles.deptRemoveBtn}
                  >
                    ×
                  </button>
                </span>
              );
            })
          )}
          <span className={styles.arrowIcon}>▼</span>
        </div>
        {dropdownOpen && (
          <div className={styles.dropdownList}>
            {departments.map((dept) => (
              <div className={styles.dropdownItem} key={dept.name}>
                <span onClick={() => handleSelect(dept)}>{dept.name}</span>
                <button
                  onClick={() => handleRemove(dept.name)}
                  className={styles.deptRemoveBtn}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button className={styles.addDeptBtn} onClick={onAddClick}>
        부서의 조직도 <span className={styles.plusIcon}>+</span>
      </button>
    </div>
  );
}

export default DepartmentFilter;
