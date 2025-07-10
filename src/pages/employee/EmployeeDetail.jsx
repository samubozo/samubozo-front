import React, { useEffect, useState, useRef } from 'react';
import styles from './EmployeeDetail.module.scss'; // styles import

const DEFAULT_POSITIONS = [
  { id: 1, order: 1, name: '팀장' },
  { id: 2, order: 2, name: '대리' },
  { id: 3, order: 3, name: '사원' },
];

const EmployeeDetail = ({ selectedEmployee }) => {
  const [dept, setDept] = useState('경영지원');
  const [position, setPosition] = useState('팀장');
  const [status, setStatus] = useState('재직');
  const [role, setRole] = useState('인사담당자');
  const [joinDate, setJoinDate] = useState('2025.02.19');
  const [leaveDate, setLeaveDate] = useState('');
  const [memo, setMemo] = useState('');
  const [gender, setGender] = useState('남');
  const [employeeName, setEmployeeName] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');
  const [employeeOutEmail, setEmployeeOutEmail] = useState('');
  const [employeeAccount, setEmployeeAccount] = useState('');
  const [employeeAccountHolder, setEmployeeAccountHolder] = useState('');
  const [employeeAddress, setEmployeeAddress] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  // 선택된 직원에 따라 이름과 전화번호 업데이트
  useEffect(() => {
    setEmployeeName(selectedEmployee?.name);
    setEmployeePhone(selectedEmployee?.phone);
  }, [selectedEmployee]);

  // 직책 관련 상태
  const [positions, setPositions] = useState([...DEFAULT_POSITIONS]);
  const [selectedPositionId, setSelectedPositionId] = useState(
    positions[0]?.id,
  );
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // 모달 입력 상태
  const [newOrder, setNewOrder] = useState('');
  const [newName, setNewName] = useState('');

  // 직원별 증명서 신청 내역 더미 데이터 맵
  const certListMap = {
    1: [
      {
        id: '2025-001',
        type: '재직증명서',
        date: '2025.06.20',
        approver: '-',
        status: '요청됨',
        purpose: '은행제출용',
      },
      {
        id: '2025-002',
        type: '경력증명서',
        date: '2025.06.21',
        approver: '2025.06.22',
        status: '승인됨',
        purpose: '이직용',
      },
      {
        id: '2025-003',
        type: '재직증명서',
        date: '2025.06.22',
        approver: '-',
        status: '요청됨',
        purpose: '비자발급',
      },
      {
        id: '2025-004',
        type: '경력증명서',
        date: '2025.06.23',
        approver: '2025.06.24',
        status: '반려됨',
        purpose: '해외연수',
      },
      {
        id: '2025-005',
        type: '재직증명서',
        date: '2025.06.24',
        approver: '-',
        status: '요청됨',
        purpose: '기타',
      },
    ],
    2: [
      {
        id: '2025-101',
        type: '재직증명서',
        date: '2025.06.10',
        approver: '2025.06.11',
        status: '승인됨',
        purpose: '은행제출용',
      },
      {
        id: '2025-102',
        type: '경력증명서',
        date: '2025.06.12',
        approver: '-',
        status: '요청됨',
        purpose: '이직용',
      },
    ],
    3: [
      {
        id: '2025-201',
        type: '재직증명서',
        date: '2025.05.01',
        approver: '2025.05.02',
        status: '승인됨',
        purpose: '비자발급',
      },
    ],
    4: [],
    5: [
      {
        id: '2025-501',
        type: '경력증명서',
        date: '2025.04.15',
        approver: '-',
        status: '요청됨',
        purpose: '기타',
      },
      {
        id: '2025-502',
        type: '재직증명서',
        date: '2025.04.16',
        approver: '2025.04.17',
        status: '승인됨',
        purpose: '은행제출용',
      },
      {
        id: '2025-503',
        type: '경력증명서',
        date: '2025.04.18',
        approver: '-',
        status: '요청됨',
        purpose: '이직용',
      },
    ],
  };

  // 선택된 직원에 따라 certList를 변경
  const [certList, setCertList] = useState([]);
  useEffect(() => {
    if (
      selectedEmployee &&
      selectedEmployee.id &&
      certListMap[selectedEmployee.id]
    ) {
      setCertList(certListMap[selectedEmployee.id]);
    } else {
      setCertList([]);
    }
  }, [selectedEmployee]);

  // 신청 폼 상태
  const [certType, setCertType] = useState('재직증명서');
  const [certDate, setCertDate] = useState('2025.06.20');
  const [certStatus, setCertStatus] = useState('요청됨');
  const [certPurpose, setCertPurpose] = useState('');
  const [editingCertRowId, setEditingCertRowId] = useState(null);

  const handleEditCertRow = (row) => {
    setCertType(row.type);
    setCertDate(row.date);
    setCertPurpose(row.purpose);
    if (row.status) setCertStatus(row.status);
    setEditingCertRowId(row.id);
  };

  // 모달 열기
  const openAddModal = () => {
    setNewOrder('');
    setNewName('');
    setShowAddModal(true);
    setShowPositionDropdown(false);
  };

  // 모달 닫기
  const closeAddModal = () => {
    setShowAddModal(false);
  };

  // 직책 선택
  const handleSelectPosition = (id) => {
    setSelectedPositionId(id);
    setShowPositionDropdown(false); // 선택 후 드롭다운 닫기
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    // 드롭다운이 열려있지 않으면 이벤트 리스너를 등록할 필요 없음
    if (!showPositionDropdown) return;

    // 클릭 이벤트 핸들러
    const handler = (e) => {
      // 클릭된 요소가 커스텀 셀렉트 랩이나 커스텀 드롭다운 내부에 속하지 않으면 드롭다운 닫기
      if (
        !e.target.closest(`.${styles.customSelectWrap}`) &&
        !e.target.closest(`.${styles.customDropdown}`)
      ) {
        setShowPositionDropdown(false);
      }
    };

    // 문서 전체에 클릭 이벤트 리스너 등록
    document.addEventListener('mousedown', handler);
    // 컴포넌트 언마운트 시 또는 showPositionDropdown 값이 변경되어 다시 실행될 때 이벤트 리스너 제거
    return () => document.removeEventListener('mousedown', handler);
  }, [showPositionDropdown]); // showPositionDropdown 값이 변경될 때마다 실행

  // 상세 정보 출력 (인쇄) 함수
  const handlePrint = () => {
    window.print();
  };

  // 프로필 이미지 업로드 핸들러
  const handleProfileImgClick = () => {
    fileInputRef.current.click();
  };
  const handleProfileImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Icon SVGs for edit and delete
  const EditIcon = () => (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='#4cb072'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M12 20h9' />
      <path d='M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z' />
    </svg>
  );
  const DeleteIcon = () => (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='#e74c3c'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <polyline points='3 6 5 6 21 6' />
      <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' />
      <line x1='10' y1='11' x2='10' y2='17' />
      <line x1='14' y1='11' x2='14' y2='17' />
    </svg>
  );

  return (
    <div className={styles.employeeDetailWrap}>
      {/* 기본 정보 제목 섹션 */}
      <div className={styles.basicInfoTitle}>
        <span className={styles.arrow}>&#9654;</span>
        <span>상세정보</span>
      </div>
      {/* 탭 메뉴 섹션 */}
      <div className={styles.tabMenu}>
        <button
          className={activeTab === 'info' ? styles.active : ''}
          onClick={() => setActiveTab('info')}
        >
          인적사항
        </button>
        <button
          className={activeTab === 'cert' ? styles.active : ''}
          onClick={() => setActiveTab('cert')}
        >
          증명서 발급
        </button>
      </div>
      {/* 상세 정보 본문 섹션 */}
      {activeTab === 'info' && (
        <div className={styles.detailBody}>
          {/* 프로필 이미지 섹션 */}
          <div className={styles.profileSection}>
            <div
              className={styles.profileImg}
              onClick={handleProfileImgClick}
              style={{
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title='프로필 이미지 업로드'
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt='프로필'
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    display: 'block',
                  }}
                />
              ) : (
                <div className={styles.profileImgPlaceholder}>Profile</div>
              )}
              <input
                type='file'
                accept='image/*'
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleProfileImgChange}
              />
            </div>
          </div>
          {/* 인적 사항 테이블 섹션 - 첨부 이미지와 완전히 동일하게 수정 */}
          <div className={styles.infoTableSection}>
            <table
              className={styles.infoTable}
              style={{ tableLayout: 'fixed' }}
            >
              <colgroup>
                <col style={{ width: '140px' }} />
                <col style={{ width: '260px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: '260px' }} />
              </colgroup>
              <tbody>
                <tr>
                  <td className={styles.tableLabel}>사원번호</td>
                  <td>
                    <input value={selectedEmployee?.id || ''} readOnly />
                  </td>
                  <td className={styles.tableLabel}>성명</td>
                  <td>
                    <input
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className={styles.tableLabel}>주민등록번호</td>
                  <td>
                    <input value='960316-1000000' readOnly />
                  </td>
                  <td className={styles.tableLabel}>성별</td>
                  <td className={styles.genderCell}>
                    <label>
                      <input type='radio' checked={gender === '남'} readOnly />{' '}
                      남
                    </label>
                    <label>
                      <input type='radio' checked={gender === '여'} readOnly />{' '}
                      여
                    </label>
                  </td>
                </tr>
                <tr>
                  <td className={styles.tableLabel}>생년월일</td>
                  <td>
                    <input value='1996.03.16' readOnly />
                  </td>
                  <td className={styles.tableLabel}>연락처</td>
                  <td>
                    <input
                      value={employeePhone}
                      onChange={(e) => setEmployeePhone(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className={styles.tableLabel}>회사이메일</td>
                  <td>
                    <input
                      value='aaa@samubozo.com'
                      readOnly
                      className={styles.emailInput}
                    />
                  </td>
                  <td className={styles.tableLabel}>외부이메일</td>
                  <td>
                    <input
                      value={employeeOutEmail}
                      onChange={(e) => setEmployeeOutEmail(e.target.value)}
                      className={styles.emailInput}
                    />
                  </td>
                </tr>
                <tr>
                  <td className={styles.tableLabel}>지급계좌</td>
                  <td colSpan={3}>
                    <div className={styles.accountRow}>
                      <input type='text' placeholder='은행명' />
                      <input type='text' placeholder='계좌번호' />
                      <span className={styles.accName}>예금주</span>
                      <input type='text' placeholder='예금주' />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className={styles.tableLabel}>주소</td>
                  <td colSpan={3}>
                    <input
                      style={{ width: '100%' }}
                      value={employeeAddress}
                      onChange={(e) => setEmployeeAddress(e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'cert' && (
        <div className={styles.certTabBody}>
          {/* 증명서 신청 내역 */}
          <div className={styles.certListTitle}>증명서발급내역</div>
          <div className={styles.certListTableWrap}>
            <table className={styles.certListTable}>
              <colgroup>
                <col style={{ width: '120px' }} /> {/* 발급번호 */}
                <col style={{ width: '160px' }} /> {/* 증명서구분 */}
                <col style={{ width: '140px' }} /> {/* 발급일자 */}
                <col style={{ width: '140px' }} /> {/* 승인일자 */}
                <col style={{ width: '160px' }} /> {/* 전자결재상태 */}
                <col style={{ width: '180px' }} /> {/* 용도 */}
                <col style={{ width: '80px' }} /> {/* 수정/삭제 */}
              </colgroup>
              <thead>
                <tr>
                  <th>발급번호</th>
                  <th>증명서구분</th>
                  <th>발급일자</th>
                  <th>승인일자</th>
                  <th>전자결재상태</th>
                  <th>용도</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {certList.map((row) => (
                  <tr
                    key={row.id}
                    style={
                      editingCertRowId === row.id
                        ? { background: '#eafaf1' }
                        : {}
                    }
                  >
                    <td>{row.id}</td>
                    <td>{row.type}</td>
                    <td>{row.date}</td>
                    <td>{row.approver}</td>
                    <td>{row.status}</td>
                    <td>{row.purpose}</td>
                    <td>
                      {row.status === '요청됨' && (
                        <>
                          <button
                            className={styles.iconBtn}
                            aria-label='수정'
                            style={{
                              marginRight: '6px',
                              background: 'none',
                              border: 'none',
                              padding: '4px',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleEditCertRow(row)}
                          >
                            <EditIcon />
                          </button>
                          <button
                            className={styles.iconBtn}
                            aria-label='삭제'
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            <DeleteIcon />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {/* 빈 행 4개 */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={'empty' + i}>
                    <td colSpan={7} style={{ height: 40 }}></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 증명서 신청 폼 */}
          <div className={styles.certFormTitle}>증명서 발급</div>
          <div className={styles.certFormWrap}>
            <table
              className={styles.certFormTable}
              style={{ tableLayout: 'fixed' }}
            >
              <colgroup>
                <col style={{ width: '140px' }} />
                <col style={{ width: '260px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: '260px' }} />
              </colgroup>
              <tbody>
                <tr>
                  <td>발급번호</td>
                  <td>
                    <input value='2025-001' readOnly />
                  </td>
                  <td>증명서구분</td>
                  <td>
                    <select
                      value={certType}
                      onChange={(e) => setCertType(e.target.value)}
                    >
                      <option>재직증명서</option>
                      <option>경력증명서</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>발급일자</td>
                  <td>
                    <input
                      type='date'
                      value={certDate}
                      onChange={(e) => setCertDate(e.target.value)}
                    />
                  </td>
                  <td>용도</td>
                  <td>
                    <input
                      value={certPurpose}
                      onChange={(e) => setCertPurpose(e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              className={styles.certFormBtnRow}
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '10px',
              }}
            >
              <button className={styles.printBtn}>인쇄</button>
              <button className={styles.approvalBtn}>전자결재</button>
              <button className={styles.saveBtn}>제출</button>
            </div>
          </div>
        </div>
      )}
      {/* 기타 정보 테이블 섹션 */}
      {activeTab !== 'cert' && (
        <div className={styles.empTableSectionWrap}>
          <table className={styles.empTable} style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '140px' }} />
              <col style={{ width: '260px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '260px' }} />
            </colgroup>
            <tbody>
              <tr>
                <td className={styles.tableLabel}>부서</td>
                <td>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                  >
                    <option>경영지원</option>
                    <option>인사팀</option>
                    <option>회계팀</option>
                    <option>영업팀</option>
                  </select>
                </td>
                <td className={styles.tableLabel}>직책</td>
                <td>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    <option>팀장</option>
                    <option>대리</option>
                    <option>사원</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className={styles.tableLabel}>재직구분</td>
                <td>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option>재직</option>
                    <option>퇴직</option>
                  </select>
                </td>
                <td className={styles.tableLabel}>역할</td>
                <td>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option>관리자</option>
                    <option>일반</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className={styles.tableLabel}>입사일자</td>
                <td>
                  <input
                    type='date'
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                  />
                </td>
                <td className={styles.tableLabel}>퇴직일자</td>
                <td>
                  <input
                    type='date'
                    value={leaveDate}
                    onChange={(e) => setLeaveDate(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.tableLabel}>비고</td>
                <td colSpan={3}>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder=''
                  />
                </td>
              </tr>
            </tbody>
          </table>
          {/* 버튼 행 */}
          <div className={styles.empTableBtnRow}>
            <button className={styles.excel} onClick={handlePrint}>
              상세 정보 출력
            </button>
            <button className={styles.leave}>퇴사자 등록</button>
            <div className={styles.rightBtns}>
              <button className={styles.delete}>삭제</button>
              <button className={styles.save}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
