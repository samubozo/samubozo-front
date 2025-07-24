import React from 'react';
import styles from './Approval.module.scss';

function DatePicker({ value, onChange }) {
  return (
    <input
      type='date'
      className={styles.datePicker}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default DatePicker;
