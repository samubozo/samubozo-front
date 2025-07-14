import React, { useEffect, useState, useRef } from 'react';
import styles from './EmployeeDetail.module.scss'; // styles import
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR, CERTIFICATE } from '../../configs/host-config';
// certificateEnums.js import 제거

const EmployeeDetail = ({ selectedEmployee }) => {
  const [dept, setDept] = useState(''); // departmentId
  const [deptName, setDeptName] = useState('');
  const [position, setPosition] = useState(''); // positionId
  const [positionName, setPositionName] = useState('');
  const [residentRegNo, setResidentRegNo] = useState('');
  const [status, setStatus] = useState('재직');
  const [role, setRole] = useState('N'); // hrRole: 'Y' or 'N'
  const [joinDate, setJoinDate] = useState('');
  const [leaveDate, setLeaveDate] = useState('');
  const [memo, setMemo] = useState('');
  const [gender, setGender] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');
  const [employeeOutEmail, setEmployeeOutEmail] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeeAddress, setEmployeeAddress] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [profileImage, setProfileImage] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [birthDate, setBirthDate] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // 부서/직책 목록 불러오기
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [deptRes, posRes] = await Promise.all([
          axiosInstance.get(`${API_BASE_URL}${HR}/departments`),
          axiosInstance.get(`${API_BASE_URL}${HR}/positions`),
        ]);
        setDepartments(deptRes.data.result || []);
        setPositions(posRes.data.result || []);
      } catch (e) {
        // 무시
      }
    };
    fetchMeta();
  }, []);

  // 선택된 직원에 따라 이름과 전화번호 업데이트
  useEffect(() => {
    if (!selectedEmployee?.id) return;
    setLoading(true);
    setError(null);
    axiosInstance
      .get(`${API_BASE_URL}${HR}/user/${selectedEmployee.id}`)
      .then((res) => {
        const data = res.data.result;
        setEmployeeName(data.userName || '');
        setEmployeePhone(data.phone || '');
        setEmployeeOutEmail(data.externalEmail || '');
        setEmployeeEmail(data.email || '');
        setDept(data.department?.departmentId || '');
        setDeptName(data.department?.departmentName || '');
        setPosition(data.positionId || '');
        setPositionName(data.positionName || '');
        setStatus(data.activate === 'N' ? '퇴직' : '재직');
        setRole(data.hrRole === 'Y' ? 'Y' : 'N');
        setJoinDate(data.hireDate || '');
        setLeaveDate(data.retireDate || '');
        setMemo(data.remarks || '');
        setGender(data.gender || '');
        setEmployeeAddress(data.address || '');
        setResidentRegNo(data.residentRegNo || '');
        setBirthDate(data.birthDate || '');
        setBankName(data.bankName || '');
        setAccountNumber(data.accountNumber || '');
        setAccountHolder(data.accountHolder || '');
        setProfileImage(data.profileImage);
      })
      .catch(() => setError('직원 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [selectedEmployee]);

  // 직책 관련 상태
  const [selectedPositionId, setSelectedPositionId] = useState(
    positions[0]?.id,
  );
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // 모달 입력 상태
  const [newOrder, setNewOrder] = useState('');
  const [newName, setNewName] = useState('');

  // === 한글 변환 함수 ===
  const typeToKor = (type) => {
    if (type === 'EMPLOYMENT') return '재직증명서';
    if (type === 'CAREER') return '경력증명서';
    return type;
  };
  const statusToKor = (status) => {
    if (status === 'REQUESTED') return '요청됨';
    if (status === 'APPROVED') return '승인됨';
    if (status === 'REJECTED') return '반려됨';
    return status;
  };

  // === 증명서 내역 상태 ===
  const [certList, setCertList] = useState([]);
  const [certType, setCertType] = useState('EMPLOYMENT');
  const [certDate, setCertDate] = useState('');
  const [certStatus, setCertStatus] = useState('REQUESTED');
  const [certPurpose, setCertPurpose] = useState('');
  const [editingCertRowId, setEditingCertRowId] = useState(null);
  const [editForm, setEditForm] = useState({ type: '', purpose: '' });
  const [certId, setCertId] = useState(''); // 추가: 폼에 표시할 발급번호 상태

  // 증명서 내역 불러오기 (GET /list)
  useEffect(() => {
    if (!selectedEmployee?.id) {
      setCertList([]);
      return;
    }
    axiosInstance
      .get(
        `${API_BASE_URL}${CERTIFICATE}/list?employeeNo=${selectedEmployee.id}`,
      )
      .then((res) => {
        setCertList(res.data.result?.content || []);
      })
      .catch(() => setCertList([]));
  }, [selectedEmployee]);

  // 증명서 신청 (POST /application)
  const handleSubmitCertificate = async () => {
    if (!selectedEmployee?.id) return;
    try {
      await axiosInstance.post(`${API_BASE_URL}${CERTIFICATE}/application`, {
        employeeNo: selectedEmployee.id,
        type: certType,
        purpose: certPurpose,
      });
      // 신청 후 목록 갱신
      const res = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/list?employeeNo=${selectedEmployee.id}`,
      );
      setCertList(res.data.result?.content || []);
      setCertType('EMPLOYMENT');
      setCertPurpose('');
    } catch (e) {
      alert('증명서 신청 실패');
    }
  };

  // 증명서 수정 (PUT /certificate/{id})
  const handleEditCertRow = (row) => {
    if (row.status !== 'REQUESTED') return; // 요청됨만 수정 가능
    setCertId(row.certificateId || ''); // 추가: 발급번호 연동
    setCertType(row.type);
    setCertDate(row.requestDate);
    setCertPurpose(row.purpose);
    setEditForm({ type: row.type, purpose: row.purpose });
    setEditingCertRowId(row.certificateId);
  };
  const handleEditSave = async (id) => {
    try {
      await axiosInstance.put(
        `${API_BASE_URL}${CERTIFICATE}/certificate/${id}`,
        {
          type: editForm.type,
          purpose: editForm.purpose,
        },
      );
      setEditingCertRowId(null);
      // 목록 갱신
      const res = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/list?employeeNo=${selectedEmployee.id}`,
      );
      setCertList(res.data.result?.content || []);
    } catch (e) {
      alert('수정 실패');
    }
  };

  // 증명서 삭제 (DELETE /delete/{id})
  const handleDeleteCert = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axiosInstance.delete(`${API_BASE_URL}${CERTIFICATE}/delete/${id}`);
      // 목록 갱신
      const res = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/list?employeeNo=${selectedEmployee.id}`,
      );
      setCertList(res.data.result?.content || []);
    } catch (e) {
      alert('삭제 실패');
    }
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
      setProfileFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 프로필 이미지 서버 업로드
  const handleProfileUpload = async () => {
    if (!profileFile || !selectedEmployee?.id) return;
    const formData = new FormData();
    formData.append('employeeNo', selectedEmployee.id);
    formData.append('profileImage', profileFile);
    try {
      await axiosInstance.post(`${API_BASE_URL}${HR}/user/profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('프로필 이미지가 업로드되었습니다.');
    } catch {
      alert('프로필 이미지 업로드 실패');
    }
  };

  // 직원 정보 저장 (수정)
  const handleSave = async () => {
    if (!selectedEmployee?.id) return;
    setLoading(true);
    setError(null);
    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('userName', employeeName);
      formData.append('email', employeeEmail);
      formData.append('residentRegNo', residentRegNo);
      formData.append('externalEmail', employeeOutEmail);
      if (dept) formData.append('departmentId', dept);
      formData.append('departmentName', deptName);
      if (position) formData.append('positionId', position);
      formData.append('positionName', positionName);
      formData.append('address', employeeAddress);
      formData.append('remarks', memo);
      formData.append('phone', employeePhone);
      formData.append('gender', gender);
      if (birthDate) formData.append('birthDate', birthDate);
      if (joinDate) formData.append('hireDate', joinDate);
      if (leaveDate) formData.append('retireDate', leaveDate);
      formData.append('activate', status === '퇴직' ? 'N' : 'Y');
      // 계좌 정보 등 추가 필요시 여기에
      formData.append('bankName', bankName);
      formData.append('accountNumber', accountNumber);
      formData.append('accountHolder', accountHolder);
      if (profileFile) {
        formData.append('profileImage', profileFile);
      }
      // 디버깅용
      // for (let pair of formData.entries()) { console.log(pair[0]+ ': ' + pair[1]); }
      await axiosInstance.patch(
        `${API_BASE_URL}${HR}/users/${selectedEmployee.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      alert('저장되었습니다.');
      // 저장 후 상세정보를 즉시 다시 불러오기
      try {
        const res = await axiosInstance.get(
          `${API_BASE_URL}${HR}/user/${selectedEmployee.id}`,
        );
        const data = res.data.result;
        setEmployeeName(data.userName || '');
        setEmployeePhone(data.phone || '');
        setEmployeeOutEmail(data.externalEmail || '');
        setEmployeeEmail(data.email || '');
        setDept(data.department?.departmentId || '');
        setDeptName(data.department?.departmentName || '');
        setPosition(data.positionId || '');
        setPositionName(data.positionName || '');
        setStatus(data.activate === 'N' ? '퇴직' : '재직');
        setRole(data.hrRole === 'Y' ? 'Y' : 'N');
        setJoinDate(data.hireDate || '');
        setLeaveDate(data.retireDate || '');
        setMemo(data.remarks || '');
        setGender(data.gender || '');
        setEmployeeAddress(data.address || '');
        setResidentRegNo(data.residentRegNo || '');
        setBirthDate(data.birthDate || '');
        setBankName(data.bankName || '');
        setAccountNumber(data.accountNumber || '');
        setAccountHolder(data.accountHolder || '');
        setProfileImage(data.profileImage);
      } catch (err) {
        alert('저장 후 상세정보를 불러오지 못했습니다. 새로고침 해주세요.');
      }
    } catch {
      setError('저장에 실패했습니다.');
    } finally {
      setLoading(false);
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

  // === [수정] 테이블 행 클릭 시 폼에만 데이터 연동, 행은 항상 읽기 전용 ===
  const handleRowToForm = (row) => {
    setCertId(row.certificateId || ''); // 추가: 발급번호 연동
    setCertType(row.type);
    setCertDate(row.requestDate);
    setCertPurpose(row.purpose);
    setEditForm({ type: row.type, purpose: row.purpose });
  };

  // === [수정] 폼 제출 ===
  const handleFormSubmit = async () => {
    if (!selectedEmployee?.id) return;
    if (editingCertRowId) {
      // 수정
      await handleEditSave(editingCertRowId);
      setEditingCertRowId(null);
      setEditForm({ type: '', purpose: '' });
      setCertType('EMPLOYMENT');
      setCertDate('');
      setCertPurpose('');
      setCertId(''); // 추가: 폼 초기화 시 발급번호도 초기화
    } else {
      // 신규
      await handleSubmitCertificate();
      setCertId(''); // 추가: 신규 신청 후 발급번호 초기화
    }
  };

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
                    <input
                      value={residentRegNo}
                      onChange={(e) => setResidentRegNo(e.target.value)}
                    />
                  </td>
                  <td className={styles.tableLabel}>성별</td>
                  <td className={styles.genderCell}>
                    <label>
                      <input
                        type='radio'
                        checked={gender === 'M'}
                        onChange={() => setGender('M')}
                        disabled
                      />{' '}
                      남
                    </label>
                    <label>
                      <input
                        type='radio'
                        checked={gender === 'F'}
                        onChange={() => setGender('F')}
                        disabled
                      />{' '}
                      여
                    </label>
                  </td>
                </tr>
                <tr>
                  <td className={styles.tableLabel}>생년월일</td>
                  <td>
                    <input value={birthDate} readOnly />
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
                      value={employeeEmail}
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
                      <input
                        type='text'
                        placeholder='은행명'
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                      <input
                        type='text'
                        placeholder='계좌번호'
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                      <span className={styles.accName}>예금주</span>
                      <input
                        type='text'
                        placeholder='예금주'
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                      />
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
          <div
            style={{
              maxHeight: '350px',
              overflowY: 'auto',
              position: 'relative',
              border: '1.5px solid #e0e0e0',
              marginBottom: '24px',
              background: '#fff',
            }}
          >
            <div className={styles.certListTableWrap}>
              <table className={styles.certListTable}>
                <colgroup>
                  <col style={{ width: '90px' }} />{' '}
                  {/* 발급번호: 기존 120px → 90px */}
                  <col style={{ width: '160px' }} /> {/* 증명서구분 */}
                  <col style={{ width: '140px' }} /> {/* 발급일자 */}
                  <col style={{ width: '140px' }} /> {/* 승인일자 */}
                  <col style={{ width: '160px' }} /> {/* 전자결재상태 */}
                  <col style={{ width: '210px' }} />{' '}
                  {/* 용도: 기존 180px → 210px */}
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
                    <th>수정/삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {certList.length > 0 ? (
                    certList.map((row) => (
                      <tr
                        key={row.certificateId}
                        onClick={() => {
                          if (
                            !editingCertRowId ||
                            editingCertRowId === row.certificateId
                          )
                            handleRowToForm(row);
                        }}
                        style={
                          editingCertRowId === row.certificateId
                            ? { background: '#eafaf1' }
                            : {}
                        }
                      >
                        <td>{row.certificateId}</td>
                        <td>{typeToKor(row.type)}</td>
                        <td>{row.requestDate}</td>
                        <td>{row.approvalDate}</td>
                        <td>{statusToKor(row.status)}</td>
                        <td>{row.purpose}</td>
                        <td>
                          {row.status === 'REQUESTED' && (
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCertRow(row);
                                }}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCert(row.certificateId);
                                }}
                              >
                                <DeleteIcon />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          height: 60,
                          textAlign: 'center',
                          color: '#aaa',
                        }}
                      >
                        내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
                    <input
                      value={
                        certId ||
                        (certList.length > 0
                          ? Math.max(...certList.map((c) => c.certificateId)) +
                            1
                          : 1)
                      }
                      readOnly
                    />
                  </td>
                  <td>증명서구분</td>
                  <td>
                    <select
                      value={certType}
                      onChange={(e) => setCertType(e.target.value)}
                    >
                      <option value='EMPLOYMENT'>재직증명서</option>
                      <option value='CAREER'>경력증명서</option>
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
              {editingCertRowId ? (
                <>
                  <button
                    className={styles.approvalBtn}
                    onClick={() => {
                      setEditingCertRowId(null);
                      setEditForm({ type: '', purpose: '' });
                      setCertType('EMPLOYMENT');
                      setCertDate('');
                      setCertPurpose('');
                      setCertId(''); // 추가: 취소 시 발급번호 초기화
                    }}
                  >
                    취소
                  </button>
                  <button className={styles.saveBtn} onClick={handleFormSubmit}>
                    수정 반영
                  </button>
                </>
              ) : (
                <>
                  <button className={styles.printBtn}>인쇄</button>
                  <button
                    className={styles.approvalBtn}
                    onClick={() => navigate('/approval?tab=certificate')}
                  >
                    전자결재
                  </button>
                  <button className={styles.saveBtn} onClick={handleFormSubmit}>
                    제출
                  </button>
                </>
              )}
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
                    <option value=''>부서 선택</option>
                    {departments.map((d) => (
                      <option key={d.departmentId} value={d.departmentId}>
                        {d.name || d.departmentName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={styles.tableLabel}>직책</td>
                <td>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    <option value=''>직책 선택</option>
                    {positions.map((p) => (
                      <option key={p.positionId} value={p.positionId}>
                        {p.positionName}
                      </option>
                    ))}
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
                    <option value='Y'>관리자</option>
                    <option value='N'>일반</option>
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
              <button
                className={styles.save}
                onClick={handleSave}
                disabled={loading}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
