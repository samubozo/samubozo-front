import React, { useEffect, useState } from 'react';
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

  // 직책 추가
  const handleAddPosition = () => {
    // 입력 값 유효성 검사 (공백 여부)
    if (!newOrder.trim() || !newName.trim()) return;
    // 새로운 ID 생성 (기존 ID 중 최대값 + 1)
    const nextId = Math.max(...positions.map((p) => p.id), 0) + 1;
    // 새로운 직책을 기존 직책 목록에 추가
    setPositions([
      ...positions,
      { id: nextId, order: parseInt(newOrder, 10), name: newName }, // order는 숫자로 변환
    ]);
    // 모달 닫기
    setShowAddModal(false);
    // 새로 추가된 직책을 선택 상태로 설정
    setSelectedPositionId(nextId);
  };

  // 직책 선택
  const handleSelectPosition = (id) => {
    setSelectedPositionId(id);
    setShowPositionDropdown(false); // 선택 후 드롭다운 닫기
  };

  // 직책 삭제
  const handleRemovePosition = (id) => {
    // 선택된 ID를 제외한 새로운 배열 생성
    let arr = positions.filter((p) => p.id !== id);
    setPositions(arr);
    // 삭제된 직책이 현재 선택된 직책이었다면, 목록의 첫 번째 직책을 선택하거나 null로 설정
    if (selectedPositionId === id && arr.length > 0)
      setSelectedPositionId(arr[0].id);
    else if (arr.length === 0) setSelectedPositionId(null);
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

  return (
    <div className={styles.employeeDetailWrap}>
      {/* 기본 정보 제목 섹션 */}
      <div className={styles.basicInfoTitle}>
        <span className={styles.arrow}>&#9654;</span>
        <span>상세정보</span>
      </div>
      {/* 탭 메뉴 섹션 */}
      <div className={styles.tabMenu}>
        <button className={styles.active}>인적사항</button>
        <button>증명서 발급</button>
      </div>
      {/* 상세 정보 본문 섹션 */}
      <div className={styles.detailBody}>
        {/* 프로필 이미지 섹션 */}
        <div className={styles.profileSection}>
          <div className={styles.profileImg}>
            <div className={styles.profileImgPlaceholder}>Profile</div>
          </div>
        </div>
        {/* 인적 사항 테이블 섹션 */}
        <div className={styles.infoTableSection}>
          <table className={styles.infoTable}>
            <tbody>
              <tr>
                <td className={styles.tableLabel}>사원번호</td>
                <td>
                  <input value={selectedEmployee?.id} readOnly />
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
                <td>
                  <label>
                    <input type='radio' checked={gender === '남'} readOnly /> 남
                  </label>
                  <label style={{ marginLeft: '12px' }}>
                    <input type='radio' checked={gender === '여'} readOnly /> 여
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
                  <input value='aaa@samubozo.com' readOnly />
                </td>
                <td className={styles.tableLabel}>외부이메일</td>
                <td>
                  <input
                    value={employeeOutEmail}
                    onChange={(e) => setEmployeeOutEmail(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.tableLabel}>지급계좌</td>
                <td colSpan={3}>
                  <div className={styles.accountRow}>
                    <select disabled>
                      <option>우리은행</option>
                    </select>
                    <input
                      value={employeeAccount}
                      onChange={(e) => setEmployeeAccount(e.target.value)}
                    />
                    <span className={styles.accName}>예금주</span>
                    <input
                      value={employeeAccountHolder}
                      onChange={(e) => setEmployeeAccountHolder(e.target.value)}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className={styles.tableLabel}>주소</td>
                <td colSpan={3}>
                  <input
                    style={{ width: '90%' }}
                    value={employeeAddress}
                    onChange={(e) => setEmployeeAddress(e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 기타 정보 테이블 섹션 */}
      <div className={styles.empTableSectionWrap}>
        <table className={styles.empTable}>
          <tbody>
            <tr>
              <td className={styles.tableLabel}>부서</td>
              <td>
                <select value={dept} onChange={(e) => setDept(e.target.value)}>
                  <option>경영지원</option>
                  <option>영업팀</option>
                  <option>개발팀</option>
                </select>
              </td>
              <td className={styles.tableLabel}>직책</td>
              <td>
                {/* 커스텀 셀렉트 박스 */}
                <div className={styles.customSelectWrap}>
                  <div
                    className={styles.customSelect}
                    onClick={() => setShowPositionDropdown((d) => !d)}
                  >
                    {positions.find((p) => p.id === selectedPositionId)?.name ||
                      '선택'}
                    <span className={styles.arrow}>▼</span>
                  </div>
                  {showPositionDropdown && (
                    <div className={styles.customDropdown}>
                      {positions.map((pos) => (
                        <div
                          key={pos.id}
                          className={
                            styles.dropdownItem +
                            (selectedPositionId === pos.id
                              ? ' ' + styles.selected
                              : '') // className에 styles.selected 추가
                          }
                          onClick={() => handleSelectPosition(pos.id)}
                        >
                          {pos.name}
                          <span
                            className={styles.itemRemove}
                            onClick={(e) => {
                              e.stopPropagation(); // 부모 요소의 클릭 이벤트 방지
                              handleRemovePosition(pos.id);
                            }}
                          >
                            ×
                          </span>
                        </div>
                      ))}
                      <div
                        className={styles.dropdownAdd}
                        onClick={openAddModal}
                      >
                        <span>추가</span>
                      </div>
                    </div>
                  )}
                </div>
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
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option>인사담당자</option>
                  <option>일반</option>
                </select>
              </td>
            </tr>
            <tr>
              <td className={styles.tableLabel}>입사일자</td>
              <td>
                <input value={joinDate} readOnly />
                <span className={styles.calendarIco}>📅</span>
              </td>
              <td className={styles.tableLabel}>퇴직일자</td>
              <td>
                <input value={leaveDate} readOnly />
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
            <button className={styles.edit}>수정</button>
            <button className={styles.save}>저장</button>
          </div>
        </div>
      </div>
      {/* 직책 추가 모달 */}
      {showAddModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalTitle}>직책 추가</div>
            <div className={styles.modalField}>
              <label>우선순위</label>
              <input
                type='number'
                value={newOrder}
                onChange={(e) => setNewOrder(e.target.value)}
              />
            </div>
            <div className={styles.modalField}>
              <label>직책명</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className={styles.modalBtnRow}>
              <button
                className={styles.modalConfirm}
                onClick={handleAddPosition}
                disabled={!newOrder.trim() || !newName.trim()}
              >
                확인
              </button>
              <button className={styles.modalCancel} onClick={closeAddModal}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
