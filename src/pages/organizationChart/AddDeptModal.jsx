import React, { useState } from 'react';
import styles from './OrgChart.module.scss';
import { ChromePicker } from 'react-color';
import UserSearchModal from './UserSearchModal';

function AddDeptModal({ open, onClose, onAdd }) {
  const [color, setColor] = useState('#e6f0fb');
  const [name, setName] = useState('');
  const [head, setHead] = useState(null); // 부서장
  const [showUserSearch, setShowUserSearch] = useState(false);

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalTitle}>부서 추가</div>
        <div className={styles.modalField}>
          <label>색상</label>
          <div className={styles.colorPickerWrap}>
            <ChromePicker
              color={color}
              onChange={(c) => setColor(c.hex)}
              disableAlpha
            />
          </div>
        </div>
        <div className={styles.modalField}>
          <label>부서명</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='부서명 입력'
          />
        </div>
        <div className={styles.modalField}>
          <label>부서장</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              value={head ? head.name : ''}
              placeholder='부서장 선택'
              readOnly
              style={{ flex: 1 }}
            />
            <button
              type='button'
              className={styles.addUserBtn}
              onClick={() => setShowUserSearch(true)}
              title='부서장 선택'
            >
              <span style={{ fontSize: 22, color: '#48b96c' }}>+</span>
            </button>
          </div>
        </div>
        <UserSearchModal
          open={showUserSearch}
          onClose={() => setShowUserSearch(false)}
          onSelect={setHead}
        />
        <div className={styles.modalBtnRow}>
          <button
            className={styles.modalOkBtn}
            onClick={() => {
              if (name && head) {
                onAdd({ name, color, head });
                setName('');
                setColor('#e6f0fb');
                setHead(null);
              }
            }}
          >
            확인
          </button>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddDeptModal;
