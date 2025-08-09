// OrgChart.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './OrgChart.module.scss';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR } from '../../configs/host-config';
import { ChromePicker } from 'react-color';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { FixedSizeList } from 'react-window';
import InfiniteScroll from 'react-infinite-scroll-component';

// Import separated components
import OrgCard from './OrgCard';
import OrgDeptCard from './OrgDeptCard';
import UserSearchModal from './UserSearchModal';
import AddDeptModal from './AddDeptModal';
import DepartmentFilter from './DepartmentFilter';
import OrgNode from './OrgNode';
import MemberDetailModal from './MemberDetailModal';
import EditDeptModal from './EditDeptModal';
import { MessageWriteModal } from '../message/Message'; // 쪽지 쓰기 모달 import (named import)
import SuccessModal from '../../components/SuccessModal';

// 더미 데이터 완전 삭제 - 실제 API 연동 데이터만 사용
const COLOR_OPTIONS = [
  { name: '파랑', value: '#e6f0fb' },
  { name: '초록', value: '#dafbe5' },
  { name: '노랑', value: '#fff0cc' },
  { name: '빨강', value: '#ffe6e6' },
  { name: '보라', value: '#e0c3f7' },
  { name: '회색', value: '#e0e0e0' },
  { name: '연두', value: '#eaffd0' },
];

// 실제 API 연동 데이터 필터링 함수
const filterOrgData = (data, selectedDepts) => {
  if (!selectedDepts.length) return data;
  return data.map((ceo) => ({
    ...ceo,
    children: ceo.children?.filter((c) => selectedDepts.includes(c.department)),
  }));
};

// 색상 대비 계산 함수 (일정관리에서 차용)
export function getContrastColor(backgroundColor) {
  if (!backgroundColor) return '#222';
  const hex = backgroundColor.replace('#', '');
  if (hex.length !== 6) return '#222';
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness <= 50) {
    return '#ffffff';
  } else if (brightness > 128) {
    return '#000000';
  } else {
    return '#ffffff';
  }
}

const OrgChart = () => {
  // 실제 API 연동 데이터 상태
  const [members, setMembers] = useState([]); // 직원 목록
  const [departments, setDepartments] = useState([]); // 부서 목록
  const [loading, setLoading] = useState(false); // 로딩 상태

  // UI 상태
  // 탭 상태: localStorage → 쿼리스트링 → 'team' 순으로 초기값 결정
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const storageTab = localStorage.getItem('orgchartTab');
  const initialTab = storageTab || urlTab || 'team';
  const [tab, setTab] = useState(initialTab);
  const [search, setSearch] = useState('');
  const [deptView, setDeptView] = useState(null); // 부서 상세 뷰 상태
  const [deptMembers, setDeptMembers] = useState([]);
  const [deptVisibleMembers, setDeptVisibleMembers] = useState([]);
  const [deptHasMore, setDeptHasMore] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDeptForm, setEditDeptForm] = useState({
    name: '',
    color: '',
    imageFile: null,
  });

  // 필터/정렬 상태
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // 모달 상태
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberDetail, setShowMemberDetail] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showMessageWriteModal, setShowMessageWriteModal] = useState(false);
  const [messageReceiver, setMessageReceiver] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 실제 API에서 받아온 부서 목록 기반 팀 옵션 생성
  const teamOptions = [
    { value: 'all', label: '전체 팀' },
    ...departments.map((dept) => ({ value: dept.name, label: dept.name })),
  ];

  // 정렬 옵션
  const sortOptions = [
    { value: 'asc', label: '이름 오름차순' },
    { value: 'desc', label: '이름 내림차순' },
  ];

  // 탭 변경 시 쿼리스트링과 localStorage 모두에 저장
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSearchParams({ ...Object.fromEntries(searchParams), tab: newTab });
    localStorage.setItem('orgchartTab', newTab);
  };
  // 쿼리스트링이 바뀌면 상태와 localStorage도 동기화
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== tab) {
      setTab(urlTab);
      localStorage.setItem('orgchartTab', urlTab);
    }
  }, [searchParams]);

  // 실제 API 데이터 로드 함수 - host-config.js의 HR 상수 사용
  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${HR}/user/list`,
      );

      // API 응답 구조: { statusCode: 200, statusMessage: "Success", result: {content: [...], page: {...}} }
      const result = response.data?.result;
      const membersData = result?.content || [];


      // 배열이 아닌 경우 빈 배열로 처리
      if (!Array.isArray(membersData)) {
        console.error('membersData가 배열이 아닙니다:', membersData);
        setMembers([]);
        return;
      }

      // department 정보를 평면화하여 사용하기 쉽게 변환
      const processedMembers = membersData.map((member) => {
        return {
          ...member,
          departmentName: member.department?.name || '부서 없음',
          departmentColor: member.department?.departmentColor || '#e6f0fb',
          departmentId: member.department?.departmentId,
        };
      });

      setMembers(processedMembers);
    } catch (error) {
      console.error('직원 목록 로드 실패:', error);
      console.error('에러 상세:', error.response?.data);
      setMembers([]);
    }
    setLoading(false);
  };

  const loadDepartments = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${HR}/departments`,
      );

      // 실제 API 응답 구조에 맞게 데이터 처리
      const departmentsData = response.data.result || [];
      setDepartments(departmentsData);
    } catch (error) {
      console.error('부서 목록 로드 실패:', error);
      setDepartments([]);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadMembers();
    loadDepartments();
  }, []);

  // 실제 데이터 기반 필터링된 멤버 목록 생성
  const getFilteredMembers = () => {
    let filtered = [...members];

    // 팀 필터 적용
    if (selectedTeam !== 'all') {
      filtered = filtered.filter(
        (user) => user.departmentName === selectedTeam,
      );
    }

    // 검색어 필터 적용
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.userName?.includes(search) ||
          u.positionName?.includes(search) ||
          u.departmentName?.includes(search),
      );
    }

    // 이름 정렬 적용
    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return (a.userName || '').localeCompare(b.userName || '');
      } else {
        return (b.userName || '').localeCompare(a.userName || '');
      }
    });

    return filtered;
  };

  // 실제 데이터 기반 필터링된 부서 목록 생성
  const getFilteredDepartments = () => {
    let filtered = [...departments];

    // 검색어가 있는 경우 해당 부서에 멤버가 있는 부서만 표시
    if (search) {
      const filteredMembers = getFilteredMembers();
      const deptNamesWithMembers = [
        ...new Set(filteredMembers.map((m) => m.departmentName)),
      ];
      filtered = filtered.filter((dept) =>
        deptNamesWithMembers.includes(dept.name),
      );
    }

    // 각 부서의 멤버 수 계산 및 부서 이미지 정보 추가
    return filtered.map((dept) => {
      // 해당 부서의 멤버들 찾기
      const deptMembers = members.filter(
        (m) => m.departmentId === dept.departmentId,
      );

      // 부서 이미지 URL (첫 번째 멤버의 department.imageUrl 사용)
      const deptImageUrl =
        deptMembers.length > 0 ? deptMembers[0].department?.imageUrl : null;

      return {
        ...dept,
        count: deptMembers.length,
        image:
          dept.imageUrl ||
          deptImageUrl ||
          dept.image ||
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDMyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE2MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRlcGFydG1lbnQ8L3RleHQ+Cjwvc3ZnPgo=',
      };
    });
  };

  // 필터/검색/정렬 변경 시 부서 상세 뷰 업데이트
  useEffect(() => {
    if (deptView) {
      const deptFiltered = getFilteredMembers().filter(
        (u) => u.departmentName === deptView.name,
      );
      setDeptMembers(deptFiltered);
      setDeptVisibleMembers(deptFiltered.slice(0, 16));
      setDeptHasMore(deptFiltered.length > 16);
    }
  }, [search, deptView, selectedTeam, sortOrder, members]);

  // 무한 스크롤 함수들
  const fetchMore = () => {
    // 실제 API 기반 무한 스크롤 구현 필요 시 추가
  };

  const fetchDeptMore = () => {
    setTimeout(() => {
      setDeptVisibleMembers((prev) => [
        ...prev,
        ...deptMembers.slice(prev.length, prev.length + 16),
      ]);
      setDeptHasMore(deptVisibleMembers.length + 16 < deptMembers.length);
    }, 400);
  };

  // 삭제 핸들러
  const handleDeleteDept = async () => {
    if (!deptView) return;
    if (!window.confirm(`${deptView.name} 부서를 삭제하시겠습니까?`)) return;
    try {
      await axiosInstance.delete(
        `${API_BASE_URL}${HR}/departments/${deptView.departmentId || deptView.id}`,
      );
      setSuccessMessage('부서가 삭제되었습니다.');
      setShowSuccessModal(true);
      setDeptView(null);
      await loadDepartments();
    } catch (e) {
      setSuccessMessage(
        e.response?.status === 400
          ? '해당 부서에 소속된 직원이 있어 삭제할 수 없습니다.'
          : '부서 삭제 중 오류가 발생했습니다.',
      );
      setShowSuccessModal(true);
    }
  };

  // 수정 버튼 클릭 시 모달 오픈 및 기존 정보 세팅
  const openEditModal = () => {
    setEditDeptForm({
      name: deptView.name || deptView.departmentName || '',
      color: deptView.departmentColor || deptView.color || '#e6f0fb',
      imageFile: null,
    });
    setShowEditModal(true);
  };

  // 수정 폼 제출
  const handleEditDept = async (e) => {
    e.preventDefault();
    if (!editDeptForm.name.trim()) {
      setSuccessMessage('부서명을 입력하세요.');
      setShowSuccessModal(true);
      return;
    }
    const formData = new FormData();
    formData.append('name', editDeptForm.name);
    formData.append('departmentColor', editDeptForm.color);
    if (editDeptForm.imageFile) {
      formData.append('departmentImage', editDeptForm.imageFile);
    }
    try {
      await axiosInstance.put(
        `${API_BASE_URL}${HR}/departments/${deptView.departmentId || deptView.id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setSuccessMessage('부서 정보가 수정되었습니다.');
      setShowSuccessModal(true);
      setShowEditModal(false);
      await loadDepartments();
      // 상세 뷰 갱신
      setDeptView(
        (prev) =>
          prev && {
            ...prev,
            name: editDeptForm.name,
            departmentColor: editDeptForm.color,
          },
      );
    } catch (e) {
      // 서버에서 statusMessage가 오면 그대로 SuccessModal로 안내
      if (e.response && e.response.data && e.response.data.statusMessage) {
        setSuccessMessage(e.response.data.statusMessage);
      } else {
        setSuccessMessage('부서 정보 수정 중 오류가 발생했습니다.');
      }
      setShowSuccessModal(true);
    }
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <div className={styles.orgChartPage}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
          }}
        >
          <CircularProgress />
        </div>
      </div>
    );
  }

  // 쪽지 보내기 버튼 핸들러
  const handleSendMessage = (member) => {
    // MessageWriteModal이 기대하는 구조로 변환
    setMessageReceiver({
      id: member.employeeNo || member.id,
      name: member.userName || member.name,
      dept:
        member.departmentName ||
        (member.department && member.department.name) ||
        '',
    });
    setShowMessageWriteModal(true);
  };

  // 현재 로그인한 사번(본인 식별)
  const currentEmployeeNo = sessionStorage.getItem('USER_EMPLOYEE_NO');

  return (
    <div className={styles.orgChartPage}>
      {/* Modern 탭형 헤더 */}
      <div className={styles.orgChartHeader}>
        <div className={styles.orgChartTabs}>
          {deptView && (
            <div
              style={{ display: 'flex', alignItems: 'center', width: '100%' }}
            >
              <button
                className={styles.orgChartBackBtn}
                onClick={() => setDeptView(null)}
                style={{ marginRight: 24 }}
              >
                ←
              </button>
              <span
                className={styles.orgChartTabActive}
                style={{ flex: 1, marginLeft: 0, marginRight: 24 }}
              >
                {deptView.name} 부서
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginLeft: 0,
                }}
              >
                <button
                  style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#48b96c',
                    background: '#fff',
                    border: '1px solid #48b96c',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onClick={openEditModal}
                >
                  부서 수정
                </button>
                <button
                  style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ff4444',
                    background: '#fff',
                    border: '1px solid #ff4444',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onClick={handleDeleteDept}
                >
                  부서 삭제
                </button>
              </div>
            </div>
          )}
          {!deptView && (
            <>
              <span
                className={
                  tab === 'team' ? styles.orgChartTabActive : styles.orgChartTab
                }
                onClick={() => handleTabChange('team')}
              >
                부서
              </span>
              <span
                className={
                  tab === 'all' ? styles.orgChartTabActive : styles.orgChartTab
                }
                onClick={() => handleTabChange('all')}
              >
                전체 팀 멤버
              </span>
            </>
          )}
        </div>
        <div className={styles.orgChartHeaderRight}>
          {(tab === 'all' || deptView || tab === 'team') && (
            <input
              className={styles.orgChartSearchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='이름, 직책, 부서 검색'
              style={{ marginRight: 12, minWidth: 180 }}
            />
          )}

          {/* Filter 드롭다운 */}
          <div className={styles.filterSortDropdown}>
            <span
              className={styles.orgChartHeaderAction}
              style={{
                color: selectedTeam !== 'all' ? '#388e3c' : '#bbb',
                fontWeight: selectedTeam !== 'all' ? 600 : 500,
                position: 'relative',
              }}
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSortDropdown(false);
              }}
            >
              Filter
              {selectedTeam !== 'all' && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#48b96c',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }}
                />
              )}
            </span>
            {showFilterDropdown && (
              <div className={styles.dropdownMenu}>
                {teamOptions.map((option) => (
                  <div
                    key={option.value}
                    className={styles.dropdownMenuItem}
                    style={{
                      backgroundColor:
                        selectedTeam === option.value
                          ? '#eafaf1'
                          : 'transparent',
                      color: selectedTeam === option.value ? '#388e3c' : '#333',
                      fontWeight: selectedTeam === option.value ? 600 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onClick={() => {
                      setSelectedTeam(option.value);
                      setShowFilterDropdown(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {selectedTeam === option.value && (
                      <span
                        style={{
                          fontSize: '16px',
                          marginLeft: '12px',
                          color: '#48b96c',
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort 드롭다운 */}
          <div className={styles.filterSortDropdown}>
            <span
              className={styles.orgChartHeaderAction}
              style={{
                color: '#388e3c',
                fontWeight: 600,
                position: 'relative',
              }}
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowFilterDropdown(false);
              }}
            >
              Sort
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-8px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#48b96c',
                  borderRadius: '50%',
                  display: 'inline-block',
                }}
              />
            </span>
            {showSortDropdown && (
              <div className={styles.dropdownMenu}>
                {sortOptions.map((option) => (
                  <div
                    key={option.value}
                    className={styles.dropdownMenuItem}
                    style={{
                      backgroundColor:
                        sortOrder === option.value ? '#eafaf1' : 'transparent',
                      color: sortOrder === option.value ? '#388e3c' : '#333',
                      fontWeight: sortOrder === option.value ? 600 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onClick={() => {
                      setSortOrder(option.value);
                      setShowSortDropdown(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {sortOrder === option.value && (
                      <span
                        style={{
                          fontSize: '16px',
                          marginLeft: '12px',
                          color: '#48b96c',
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 부서 추가 버튼 - 부서 탭에서만 표시 */}
          {tab === 'team' && !deptView && sessionStorage.getItem('USER_DEPARTMENT') === '인사팀' && (
            <button
              className={styles.addDeptHeaderBtn}
              onClick={() => setShowAddDeptModal(true)}
              title='부서 추가'
            >
              <span className={styles.addDeptHeaderIcon}>+</span>
              부서 추가
            </button>
          )}
        </div>
      </div>
      <div className={styles.orgChartHeaderLine} />

      {/* 멤버/부서 카드 그리드 분기 */}
      {deptView ? (
        <div className={styles.orgCardGrid}>
          {deptVisibleMembers.length > 0 ? (
            deptVisibleMembers.map((user) => (
              <OrgCard
                user={user}
                key={user.employeeNo}
                onClick={() => {
                  setSelectedMember(user);
                  setShowMemberDetail(true);
                }}
              />
            ))
          ) : (
            // 팀원이 없을 때 메시지 표시
            <div
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 20px',
                textAlign: 'center',
                color: '#666',
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  opacity: 0.3,
                }}
              >
                👥
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#333',
                }}
              >
                팀원이 없습니다
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#888',
                }}
              >
                아직 이 부서에 소속된 팀원이 없어요
              </div>
            </div>
          )}
        </div>
      ) : tab === 'all' ? (
        <div className={styles.orgCardGrid}>
          {getFilteredMembers().map((user) => (
            <OrgCard
              user={user}
              key={user.employeeNo}
              onClick={() => {
                setSelectedMember(user);
                setShowMemberDetail(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className={styles.orgCardGrid}>
          {getFilteredDepartments().map((dept) => (
            <OrgDeptCard
              dept={dept}
              key={dept.departmentId || dept.id || `dept-${dept.name}`}
              onClick={() => setDeptView(dept)}
            />
          ))}
        </div>
      )}

      {/* 멤버 상세 정보 모달 */}
      <MemberDetailModal
        open={showMemberDetail}
        onClose={() => {
          setShowMemberDetail(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onSendMessage={handleSendMessage}
        isSelf={
          selectedMember &&
          String(selectedMember.employeeNo) === String(currentEmployeeNo)
        }
      />
      {/* 쪽지 쓰기 모달 */}
      <MessageWriteModal
        open={showMessageWriteModal}
        onClose={() => setShowMessageWriteModal(false)}
        initialReceiver={messageReceiver}
        onSend={() => setShowMessageWriteModal(false)}
      />

      {/* 부서 추가 모달 */}
      <AddDeptModal
        open={showAddDeptModal}
        onClose={() => setShowAddDeptModal(false)}
        existingDepartments={departments}
        onAdd={async (newDept) => {
          try {

            // 백엔드 API에 맞춰 데이터 전송 방식 결정
            let requestData;
            let headers = {};

            if (newDept.imageFile) {
              // 이미지 파일이 있는 경우 FormData 사용
              const formData = new FormData();
              formData.append('name', newDept.name);
              formData.append('departmentColor', newDept.color);
              formData.append('departmentImage', newDept.imageFile); // <-- key 변경!

              requestData = formData;
              headers = {
                'Content-Type': 'multipart/form-data',
              };
            } else {
              // 이미지 파일이 없는 경우 JSON 사용
              requestData = {
                name: newDept.name,
                departmentColor: newDept.color,
              };
              headers = {
                'Content-Type': 'application/json',
              };
            }

            // 실제 API 호출로 부서 추가
            const response = await axiosInstance.post(
              `${API_BASE_URL}${HR}/departments`,
              requestData,
              { headers },
            );


            // 성공 시 부서 목록 새로고침
            await loadDepartments();
            setSuccessMessage('부서가 추가되었습니다.'); // 추가 성공 시 SuccessModal
            setShowSuccessModal(true);
            setShowAddDeptModal(false); // 성공 시에만 닫기
          } catch (error) {
            console.error('부서 추가 실패:', error);
            // alert 호출 제거, 반드시 throw만
            throw error;
          }
        }}
      />

      {/* 부서 수정 모달 */}
      {showEditModal && (
        <EditDeptModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onEdit={async (formData) => {
            try {
              await axiosInstance.put(
                `${API_BASE_URL}${HR}/departments/${deptView.departmentId || deptView.id}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
              );
              setSuccessMessage('부서 정보가 수정되었습니다.'); // 수정 성공 시 SuccessModal
              setShowSuccessModal(true);
              setShowEditModal(false); // 성공 시에만 닫기
              await loadDepartments();
              await loadMembers(); // ← 멤버 목록도 최신화
              setDeptView(
                (prev) =>
                  prev && {
                    ...prev,
                    name: formData.get('name'),
                    departmentColor: formData.get('departmentColor'),
                  },
              );
            } catch (e) {
              // 서버에서 statusMessage가 오면 그대로 SuccessModal로 안내 (중복 방지)
              if (
                e.response &&
                e.response.data &&
                e.response.data.statusMessage
              ) {
                setSuccessMessage(e.response.data.statusMessage);
              } else {
                setSuccessMessage('부서 정보 수정 중 오류가 발생했습니다.');
              }
              setShowSuccessModal(true);
              // throw e; // 중복 alert 방지를 위해 throw 제거
            }
          }}
          initialDept={deptView}
          existingDepartments={departments}
        />
      )}

      {/* 성공 모달 */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessMessage('');
          }}
        />
      )}
    </div>
  );
};

export default OrgChart;
