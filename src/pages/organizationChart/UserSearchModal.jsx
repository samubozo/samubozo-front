import React, { useState, useEffect, useRef } from 'react';
import styles from './OrgChart.module.scss';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR } from '../../configs/host-config';

// --- MUI Autocomplete 기반 UserSearchModal ---
function UserSearchModal({ open, onClose, onSelect, hrRoleFilter = false }) {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const debounceRef = useRef();

  // API 호출 함수
  const fetchUsers = async (keyword) => {
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

      // HRROLE 필터 추가
      if (hrRoleFilter) {
        params.hrRole = 'Y';
      }

      // 이름/부서명 동시 검색: 백엔드가 둘 다 있으면 AND, 둘 중 하나만 있으면 OR로 동작할 수 있음
      // 실제로는 둘 다 보내면 AND, 하나만 보내면 해당 조건만 적용됨
      // 여기서는 둘 다 같은 값으로 보내서 이름 또는 부서명에 포함된 사용자 모두 반환
      const res = await axiosInstance.get(`${API_BASE_URL}${HR}/users/search`, {
        params,
      });

      // API 응답 구조: { statusCode: 200, statusMessage: "Success", result: [...] }
      const usersData = res.data.result || [];

      setOptions(usersData);
    } catch (e) {
      setOptions([]);
    }
    setLoading(false);
  };

  // inputValue 변경 시 debounce로 API 호출
  useEffect(() => {
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
  }, [inputValue, open, hrRoleFilter]);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setInputValue('');
      fetchUsers('');
    }
    // eslint-disable-next-line
  }, [open, hrRoleFilter]);

  return !open ? null : (
    <div className={styles.modalOverlay}>
      <div className={styles.userSearchModalBox}>
        <div className={styles.userSearchModalHeader}>
          <span className={styles.userSearchModalTitle}>
            {hrRoleFilter ? 'HR 권한자 검색' : '부서장 검색'}
          </span>
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
              option.userName && option.department?.name
                ? `${option.userName} (${option.department.name})`
                : option.userName || ''
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={hrRoleFilter ? 'HR 권한자 검색' : '이름 또는 부서 검색'}
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
                  {option.department?.name || '부서 없음'}
                </span>
                <span style={{ fontSize: 13, color: '#888' }}>
                  {option.positionName}
                </span>
                {hrRoleFilter && (
                  <span
                    style={{
                      fontSize: 12,
                      color: '#fff',
                      background: '#48b96c',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontWeight: 600,
                    }}
                  >
                    HR
                  </span>
                )}
              </li>
            )}
            inputValue={inputValue}
            onInputChange={(_, value) => {
              setInputValue(value);
            }}
            onChange={(_, value) => {
              if (value) {
                onSelect(value);
                onClose();
              }
            }}
            noOptionsText={
              hrRoleFilter ? 'HR 권한자가 없습니다' : '검색 결과 없음'
            }
            openOnFocus
            blurOnSelect
          />
        </div>
      </div>
    </div>
  );
}

export default UserSearchModal;
