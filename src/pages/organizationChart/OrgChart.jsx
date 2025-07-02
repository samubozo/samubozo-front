// OrgChart.jsx
import React, { useState, useEffect } from 'react';
import styles from './OrgChart.module.scss';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL } from '../../configs/host-config';
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

// 예시용 조직도 데이터
const orgData = [
  {
    name: '김예은',
    position: '대표이사',
    role: 'CEO',
    roleColor: 'ceo',
    department: '경영지원부',
    children: [
      {
        name: '구현희',
        position: '개발팀장',
        role: 'Engineering',
        roleColor: 'engineering',
        department: '개발부',
        children: [
          {
            name: '팔현희',
            position: '선임개발자',
            role: 'Engineering',
            roleColor: 'engineering',
            department: '개발부',
          },
        ],
      },
      {
        name: '이호영',
        position: '마케팅팀장',
        role: 'Marketing',
        roleColor: 'marketing',
        department: '마케팅부',
        children: [
          {
            name: '삼호영',
            position: '마케팅 매니저',
            role: 'Marketing',
            roleColor: 'marketing',
            department: '마케팅부',
            email: 'bbb@samubozo.com',
            phone: '02-1234-5678',
          },
        ],
      },
      {
        name: '주영찬',
        position: '영업팀장',
        role: 'Sales',
        roleColor: 'sales',
        department: '영업부',
      },
      {
        name: '신현국',
        position: '인사팀장',
        role: 'Hr',
        roleColor: 'hr',
        department: '경영지원부',
      },
    ],
  },
];

const DEFAULT_DEPARTMENTS = [
  { name: '개발부', color: '#e6f0fb' },
  { name: '마케팅부', color: '#dafbe5' },
  { name: '영업부', color: '#fff0cc' },
  { name: '경영지원부', color: '#ffe6e6' },
];

const COLOR_OPTIONS = [
  { name: '파랑', value: '#e6f0fb' },
  { name: '초록', value: '#dafbe5' },
  { name: '노랑', value: '#fff0cc' },
  { name: '빨강', value: '#ffe6e6' },
  { name: '보라', value: '#e0c3f7' },
  { name: '회색', value: '#e0e0e0' },
  { name: '연두', value: '#eaffd0' },
];

const filterOrgData = (data, selectedDepts) => {
  if (!selectedDepts.length) return data;
  return data.map((ceo) => ({
    ...ceo,
    children: ceo.children?.filter((c) => selectedDepts.includes(c.department)),
  }));
};

// 카드형 조직도용 더미 데이터 (100명 이상, role이 부서명과 정확히 일치)
const deptNames = ['개발팀', '디자인팀', '마케팅팀', '영업팀'];
const cardOrgData = Array.from({ length: 120 }).map((_, i) => {
  const names = [
    '김석현',
    '김원성',
    '김윤아',
    '김지현',
    '박수진',
    '이민희',
    '이영수',
    '장민혁',
  ];
  const positions = [
    'SRE(사이트 안전 엔지니어)',
    '선임 소프트웨어 엔지니어',
    '브랜드 디자이너',
    '인사 전문가',
    '마케팅 팀장',
    '영업사원',
    '지원 담당자',
    '프로덕트 디자이너',
  ];
  const dept = deptNames[i % deptNames.length];
  const images = [
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/men/33.jpg',
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/women/45.jpg',
    'https://randomuser.me/api/portraits/women/46.jpg',
    'https://randomuser.me/api/portraits/women/47.jpg',
    'https://randomuser.me/api/portraits/men/34.jpg',
    'https://randomuser.me/api/portraits/men/35.jpg',
  ];
  return {
    id: i + 1,
    name: names[i % names.length] + (i + 1),
    position: positions[i % positions.length],
    role: dept, // 부서명과 정확히 일치
    roleColor: ['#e8d6f7', '#d6eaf7', '#f7e6d6', '#f7f6d6'][i % 4],
    badge: dept,
    badgeColor: ['#e8d6f7', '#d6eaf7', '#f7e6d6', '#f7f6d6'][i % 4],
    image: images[i % images.length],
    period: (Math.random() * 30 + 10).toFixed(1) + ' 개월',
    desc: positions[i % positions.length],
  };
});

// 부서(팀) 카드용 더미 데이터 (name이 위와 정확히 일치)
const cardDeptData = [
  {
    id: 1,
    name: '개발팀',
    desc: '최고의 서비스를 만드는 개발팀',
    count: cardOrgData.filter((u) => u.role === '개발팀').length,
    image:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    name: '디자인팀',
    desc: '브랜드와 UX를 책임지는 디자인팀',
    count: cardOrgData.filter((u) => u.role === '디자인팀').length,
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: '마케팅팀',
    desc: '고객과 시장을 연결하는 마케팅팀',
    count: cardOrgData.filter((u) => u.role === '마케팅팀').length,
    image:
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    name: '영업팀',
    desc: '비즈니스의 최전선, 영업팀',
    count: cardOrgData.filter((u) => u.role === '영업팀').length,
    image:
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
  },
];

const OrgChart = () => {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [filteredMembers, setFilteredMembers] = useState(cardOrgData);
  const [visibleMembers, setVisibleMembers] = useState(
    cardOrgData.slice(0, 16),
  );
  const [hasMore, setHasMore] = useState(cardOrgData.length > 16);
  // 부서 상세 뷰 상태
  const [deptView, setDeptView] = useState(null); // {id, name, ...} or null
  const [deptMembers, setDeptMembers] = useState([]);
  const [deptVisibleMembers, setDeptVisibleMembers] = useState([]);
  const [deptHasMore, setDeptHasMore] = useState(false);

  // 필터/정렬 상태 추가
  const [selectedTeam, setSelectedTeam] = useState('all'); // 'all', '개발팀', '디자인팀', '마케팅팀', '영업팀'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // 멤버 상세 모달 상태
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberDetail, setShowMemberDetail] = useState(false);

  // 부서 추가 모달 상태
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);

  // 팀 목록
  const teamOptions = [
    { value: 'all', label: '전체 팀' },
    { value: '개발팀', label: '개발팀' },
    { value: '디자인팀', label: '디자인팀' },
    { value: '마케팅팀', label: '마케팅팀' },
    { value: '영업팀', label: '영업팀' },
  ];

  // 정렬 옵션
  const sortOptions = [
    { value: 'asc', label: '이름 오름차순' },
    { value: 'desc', label: '이름 내림차순' },
  ];

  // 필터링된 데이터로 부서 카드 데이터 업데이트
  const getFilteredDeptData = () => {
    let filtered = cardOrgData;

    // 팀 필터 적용
    if (selectedTeam !== 'all') {
      filtered = filtered.filter((user) => user.role === selectedTeam);
    }

    // 검색어 필터 적용
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.name.includes(search) ||
          u.position.includes(search) ||
          u.desc.includes(search),
      );
    }

    // 이름 정렬 적용
    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    // 필터링된 데이터에 따라 부서 카드 필터링
    let filteredDeptData = cardDeptData;

    // 특정 팀이 선택된 경우 해당 팀만 표시
    if (selectedTeam !== 'all') {
      filteredDeptData = cardDeptData.filter(
        (dept) => dept.name === selectedTeam,
      );
    }

    // 검색어가 있는 경우 멤버가 있는 부서만 표시
    if (search) {
      filteredDeptData = filteredDeptData.filter((dept) =>
        filtered.some((user) => user.role === dept.name),
      );
    }

    const result = filteredDeptData.map((dept) => ({
      ...dept,
      count: filtered.filter((u) => u.role === dept.name).length,
    }));

    // 디버깅용 로그
    console.log('=== getFilteredDeptData Debug ===');
    console.log('selectedTeam:', selectedTeam);
    console.log('search:', search);
    console.log('sortOrder:', sortOrder);
    console.log('filtered total:', filtered.length);
    console.log(
      'filteredDeptData:',
      filteredDeptData.map((d) => d.name),
    );
    console.log('result:', result);
    console.log('===============================');

    return result;
  };

  useEffect(() => {
    // 검색어, 팀 필터, 정렬 적용
    let filtered = cardOrgData;

    // 팀 필터 적용
    if (selectedTeam !== 'all') {
      filtered = filtered.filter((user) => user.role === selectedTeam);
    }

    // 검색어 필터 적용
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.name.includes(search) ||
          u.position.includes(search) ||
          u.desc.includes(search),
      );
    }

    // 이름 정렬 적용
    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    if (!deptView) {
      setFilteredMembers(filtered);
      setVisibleMembers(filtered.slice(0, 16));
      setHasMore(filtered.length > 16);
    } else {
      // 부서 상세 뷰: 해당 부서 멤버만 필터링
      const deptFiltered = filtered.filter((u) => u.role === deptView.name);
      setDeptMembers(deptFiltered);
      setDeptVisibleMembers(deptFiltered.slice(0, 16));
      setDeptHasMore(deptFiltered.length > 16);
    }
  }, [search, deptView, selectedTeam, sortOrder]);

  const fetchMore = () => {
    setTimeout(() => {
      setVisibleMembers((prev) => [
        ...prev,
        ...filteredMembers.slice(prev.length, prev.length + 16),
      ]);
      setHasMore(visibleMembers.length + 16 < filteredMembers.length);
    }, 400);
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

  return (
    <div className={styles.orgChartPage}>
      {/* Modern 탭형 헤더 */}
      <div className={styles.orgChartHeader}>
        <div className={styles.orgChartTabs}>
          {deptView ? (
            <button
              className={styles.orgChartBackBtn}
              onClick={() => setDeptView(null)}
            >
              ←
            </button>
          ) : null}
          {!deptView && (
            <>
              <span
                className={
                  tab === 'all' ? styles.orgChartTabActive : styles.orgChartTab
                }
                onClick={() => setTab('all')}
              >
                전체 팀 멤버
              </span>
              <span
                className={
                  tab === 'team' ? styles.orgChartTabActive : styles.orgChartTab
                }
                onClick={() => setTab('team')}
              >
                부서
              </span>
            </>
          )}
          {deptView && (
            <span
              className={styles.orgChartTabActive}
              style={{ marginLeft: 12 }}
            >
              {deptView.name} 부서
            </span>
          )}
        </div>
        <div className={styles.orgChartHeaderRight}>
          {(tab === 'all' || deptView || tab === 'team') && (
            <input
              className={styles.orgChartSearchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='이름, 직책, 설명 검색'
              style={{ marginRight: 12, minWidth: 180 }}
            />
          )}

          {/* Filter 드롭다운 */}
          <div className={styles.filterSortDropdown}>
            <span
              className={styles.orgChartHeaderAction}
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSortDropdown(false);
              }}
            >
              Filter
            </span>
            {showFilterDropdown && (
              <div className={styles.dropdownMenu}>
                {teamOptions.map((option) => (
                  <div
                    key={option.value}
                    className={styles.dropdownMenuItem}
                    onClick={() => {
                      setSelectedTeam(option.value);
                      setShowFilterDropdown(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort 드롭다운 */}
          <div className={styles.filterSortDropdown}>
            <span
              className={styles.orgChartHeaderAction}
              style={{ color: '#388e3c', fontWeight: 600 }}
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowFilterDropdown(false);
              }}
            >
              Sort
            </span>
            {showSortDropdown && (
              <div className={styles.dropdownMenu}>
                {sortOptions.map((option) => (
                  <div
                    key={option.value}
                    className={styles.dropdownMenuItem}
                    onClick={() => {
                      setSortOrder(option.value);
                      setShowSortDropdown(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 부서 추가 버튼 */}
          <button
            className={styles.addDeptHeaderBtn}
            onClick={() => setShowAddDeptModal(true)}
            title='부서 추가'
          >
            <span className={styles.addDeptHeaderIcon}>+</span>
            부서 추가
          </button>
        </div>
      </div>
      <div className={styles.orgChartHeaderLine} />
      {/* 멤버/부서 카드 그리드 분기 */}
      {deptView ? (
        <InfiniteScroll
          dataLength={deptVisibleMembers.length}
          next={fetchDeptMore}
          hasMore={deptHasMore}
          loader={
            <div style={{ textAlign: 'center', color: '#888', padding: 18 }}>
              불러오는 중...
            </div>
          }
          endMessage={
            <div style={{ textAlign: 'center', color: '#bbb', padding: 18 }}>
              모든 멤버를 불러왔습니다.
            </div>
          }
          style={{ overflow: 'visible' }}
        >
          <div className={styles.orgCardGrid}>
            {deptVisibleMembers.map((user) => (
              <OrgCard
                user={user}
                key={user.id}
                onClick={() => {
                  setSelectedMember(user);
                  setShowMemberDetail(true);
                }}
              />
            ))}
          </div>
        </InfiniteScroll>
      ) : tab === 'all' ? (
        <InfiniteScroll
          dataLength={visibleMembers.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={
            <div style={{ textAlign: 'center', color: '#888', padding: 18 }}>
              불러오는 중...
            </div>
          }
          endMessage={
            <div style={{ textAlign: 'center', color: '#bbb', padding: 18 }}>
              모든 멤버를 불러왔습니다.
            </div>
          }
          style={{ overflow: 'visible' }}
        >
          <div className={styles.orgCardGrid}>
            {visibleMembers.map((user) => (
              <OrgCard
                user={user}
                key={user.id}
                onClick={() => {
                  setSelectedMember(user);
                  setShowMemberDetail(true);
                }}
              />
            ))}
          </div>
        </InfiniteScroll>
      ) : (
        <div className={styles.orgCardGrid}>
          {getFilteredDeptData().map((dept) => (
            <OrgDeptCard
              dept={dept}
              key={dept.id}
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
      />

      {/* 부서 추가 모달 */}
      <AddDeptModal
        open={showAddDeptModal}
        onClose={() => setShowAddDeptModal(false)}
        onAdd={(newDept) => {
          setDepartments([...departments, newDept]);
          setShowAddDeptModal(false);
        }}
      />
    </div>
  );
};

export default OrgChart;
