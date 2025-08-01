import React, { useState } from 'react';
import styles from './Approval.module.scss';

function Dropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.dropdown} tabIndex={0} onBlur={() => setOpen(false)}>
      <div
        className={styles.dropdownSelected}
        onClick={() => setOpen((v) => !v)}
      >
        {options.find((o) => o.value === value)?.label || options[0].label}
        <span className={styles.dropdownArrow}>▼</span>
      </div>
      {open && (
        <div className={styles.dropdownList}>
          {options.map((o) => (
            <div
              key={o.value}
              className={styles.dropdownItem}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
