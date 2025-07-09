import React, { useState, useEffect, useRef } from 'react';
import styles from './OrgChart.module.scss';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import axiosInstance from '../../configs/axios-config';

// --- MUI Autocomplete 기반 UserSearchModal ---
function UserSearchModal({ open, onClose, onSelect }) {
  console.log('UserSearchModal 렌더링됨', open);

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const debounceRef = useRef();

  // API 호출 함수
  const fetchUsers = async (keyword) => {
    console.log('fetchUsers 호출됨', keyword);
    setLoading(true);
    try {
      let params = {};
      if (keyword) {
        // 이름 또는 부서명 모두에 검색어 적용
        params.userName = keyword;
        params.departmentName = keyword;
      } else {
        params.page = 0;
        params.size = 10;
      }
      // 이름/부서명 동시 검색: 백엔드가 둘 다 있으면 AND, 둘 중 하나만 있으면 OR로 동작할 수 있음
      // 실제로는 둘 다 보내면 AND, 하나만 보내면 해당 조건만 적용됨
      // 여기서는 둘 다 같은 값으로 보내서 이름 또는 부서명에 포함된 사용자 모두 반환
      const res = await axiosInstance.get('/hr-service/hr/users/search', {
        params,
      });
      console.log('API 응답:', res);
      setOptions(res.data.result?.content || []);
      console.log('옵션 배열:', res.data.result?.content || []);
    } catch (e) {
      setOptions([]);
      console.log('API 에러:', e);
    }
    setLoading(false);
  };

  // inputValue 변경 시 debounce로 API 호출
  useEffect(() => {
    console.log('useEffect 실행됨', inputValue, open);
    if (!open) return;
    setOptions([]);
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers(inputValue.trim());
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line
  }, [inputValue, open]);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setInputValue('');
      fetchUsers('');
    }
    // eslint-disable-next-line
  }, [open]);

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
            getOptionLabel={(option) =>
              option.userName && option.departmentName
                ? `${option.userName} (${option.departmentName})`
                : ''
            }
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
                key={option.employeeNo}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <span style={{ fontWeight: 600 }}>{option.userName}</span>
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
                  {option.departmentName}
                </span>
                <span style={{ fontSize: 13, color: '#888' }}>
                  {option.positionName}
                </span>
              </li>
            )}
            inputValue={inputValue}
            onInputChange={(_, value) => {
              console.log('onInputChange 발생', value);
              setInputValue(value);
            }}
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
          <button
            onClick={() => fetchUsers(inputValue)}
            style={{ marginTop: 12 }}
          >
            강제 검색 (디버그)
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserSearchModal;
