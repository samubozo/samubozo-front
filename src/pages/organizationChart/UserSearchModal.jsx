import React, { useState, useEffect } from 'react';
import styles from './OrgChart.module.scss';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

// --- UserSearchModal (reuse from Message.jsx, local dummy for now) ---
const dummyUsers = [
  { id: 1, name: '이호영', dept: '개발팀' },
  { id: 2, name: '홍길동', dept: '영업팀' },
  { id: 3, name: '신현국', dept: '인사팀' },
  { id: 4, name: '김철수', dept: '개발팀' },
  { id: 5, name: '박영희', dept: '영업팀' },
  { id: 6, name: '최민수', dept: '인사팀' },
  { id: 7, name: '이수정', dept: '개발팀' },
  { id: 8, name: '정지훈', dept: '영업팀' },
];

// --- MUI Autocomplete 기반 UserSearchModal ---
function UserSearchModal({ open, onClose, onSelect }) {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  // 실제 환경에서는 서버 쿼리로 대체 가능
  const [options, setOptions] = useState(dummyUsers);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    // 300ms 딜레이 후 필터링 (실제 서버라면 fetch)
    const timeout = setTimeout(() => {
      const filtered = dummyUsers.filter(
        (u) =>
          !inputValue ||
          u.name.includes(inputValue) ||
          u.dept.includes(inputValue),
      );
      setOptions(filtered);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [inputValue, open]);

  return !open ? null : (
    <div className={styles.modalOverlay}>
      <div className={styles.userSearchModalBox}>
        <div className={styles.userSearchModalHeader}>
          <span className={styles.userSearchModalTitle}>부서장 검색</span>
          <button className={styles.userSearchModalCloseBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        <div style={{ padding: '24px 28px 0 28px' }}>
          <Autocomplete
            fullWidth
            autoHighlight
            options={options}
            loading={loading}
            getOptionLabel={(option) => option.name + ' (' + option.dept + ')'}
            renderInput={(params) => (
              <TextField
                {...params}
                label='이름 또는 부서 검색'
                variant='outlined'
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? (
                        <CircularProgress color='success' size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                autoFocus
              />
            )}
            renderOption={(props, option) => (
              <li
                {...props}
                key={option.id}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <span style={{ fontWeight: 600 }}>{option.name}</span>
                <span
                  style={{
                    fontSize: 13,
                    color: '#388e3c',
                    background: '#eafaf1',
                    borderRadius: 4,
                    padding: '2px 9px',
                    fontWeight: 500,
                  }}
                >
                  {option.dept}
                </span>
              </li>
            )}
            inputValue={inputValue}
            onInputChange={(_, value) => setInputValue(value)}
            onChange={(_, value) => {
              if (value) {
                onSelect(value);
                onClose();
              }
            }}
            noOptionsText='검색 결과 없음'
            openOnFocus
            blurOnSelect
          />
        </div>
      </div>
    </div>
  );
}

export default UserSearchModal;
