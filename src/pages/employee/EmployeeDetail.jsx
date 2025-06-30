import React, { useEffect, useState } from 'react';
import './EmployeeDetail.scss';
const DEFAULT_POSITIONS = [
  { id: 1, order: 1, name: "팀장" },
  { id: 2, order: 2, name: "대리" },
  { id: 3, order: 3, name: "사원" }
];

const EmployeeDetail = ({selectedEmployee}) => {
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

  useEffect(() => {
    setEmployeeName(selectedEmployee?.name)
    setEmployeePhone(selectedEmployee?.phone)
  },[selectedEmployee])
// 직책 관련 상태
  const [positions, setPositions] = useState([...DEFAULT_POSITIONS]);
  const [selectedPositionId, setSelectedPositionId] = useState(positions[0]?.id);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // 모달 입력 상태
  const [newOrder, setNewOrder] = useState("");
  const [newName, setNewName] = useState("");

  // 모달 열기
  const openAddModal = () => {
    setNewOrder("");
    setNewName("");
    setShowAddModal(true);
    setShowPositionDropdown(false);
  };

  // 모달 닫기
  const closeAddModal = () => {
    setShowAddModal(false);
  };

  // 직책 추가
  const handleAddPosition = () => {
    if (!newOrder.trim() || !newName.trim()) return;
    // id는 가장 큰 id+1
    const nextId = Math.max(...positions.map(p => p.id), 0) + 1;
    setPositions([
      ...positions,
      { id: nextId, order: parseInt(newOrder, 10), name: newName }
    ]);
    setShowAddModal(false);
    setSelectedPositionId(nextId);
  };

  // 직책 선택
  const handleSelectPosition = id => {
    setSelectedPositionId(id);
    setShowPositionDropdown(false);
  };

  // 직책 삭제
  const handleRemovePosition = id => {
    let arr = positions.filter(p => p.id !== id);
    setPositions(arr);
    if (selectedPositionId === id && arr.length > 0)
      setSelectedPositionId(arr[0].id);
    else if (arr.length === 0) setSelectedPositionId(null);
  };

  // 드롭다운 외부 클릭 닫기
  React.useEffect(() => {
    if (!showPositionDropdown) return;
    const handler = e => {
      if (
        !e.target.closest(".custom-select-wrap") &&
        !e.target.closest(".custom-dropdown")
      ) {
        setShowPositionDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPositionDropdown]);

  return (
    <div className='employee-detail-wrap'>
      <div className='basic-info-title'>
        <span className='arrow'>&#9654;</span>
        <span>상세정보</span>
      </div>
      <div className='tab-menu'>
        <button className='active'>인적사항</button>
        <button>증명서 발급</button>
      </div>
      <div className='detail-body'>
        <div className='profile-section'>
          <div className='profile-img'>
            <div className='profile-img-placeholder'>Profile</div>
          </div>
        </div>
        <div className='info-table-section'>
          <table className='info-table'>
            <tbody>
              <tr>
                <td className='table-label'>사원번호</td>
                <td>
                  <input value={selectedEmployee?.id} readOnly />
                </td>
                <td className='table-label'>성명</td>
                <td>
                  <input
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td className='table-label'>주민등록번호</td>
                <td>
                  <input value='960316-1000000' readOnly />
                </td>
                <td className='table-label'>성별</td>
                <td>
                  <label>
                    <input type='radio' checked={gender === '남'} /> 남
                  </label>
                  <label style={{ marginLeft: '12px' }}>
                    <input type='radio' checked={gender === '여'} /> 여
                  </label>
                </td>
              </tr>
              <tr>
                <td className='table-label'>생년월일</td>
                <td>
                  <input value='1996.03.16' readOnly />
                </td>
                <td className='table-label'>연락처</td>
                <td>
                  <input
                    value={employeePhone}
                    onChange={(e) => setEmployeePhone(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td className='table-label'>회사이메일</td>
                <td>
                  <input value='aaa@samubozo.com' readOnly />
                </td>
                <td className='table-label'>외부이메일</td>
                <td>
                  <input
                    value={employeeOutEmail}
                    onChange={(e) => setEmployeeOutEmail(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td className='table-label'>지급계좌</td>
                <td colSpan={3}>
                  <div className='account-row'>
                    <select disabled>
                      <option>우리은행</option>
                    </select>
                    <input
                      value={employeeAccount}
                      onChange={(e) => setEmployeeAccount(e.target.value)}
                    />
                    <span className='acc-name'>예금주</span>
                    <input
                      value={employeeAccountHolder}
                      onChange={(e) => setEmployeeAccountHolder(e.target.value)}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className='table-label'>주소</td>
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

      <div className="emp-table-section-wrap">
        <table className="emp-table">
          <tbody>
            <tr>
              <td className="table-label">부서</td>
              <td>
                <select value={dept} onChange={e => setDept(e.target.value)}>
                  <option>경영지원</option>
                  <option>영업팀</option>
                  <option>개발팀</option>
                </select>
              </td>
              <td className="table-label">직책</td>
              <td>
                {/* 커스텀 셀렉트 박스 */}
                <div className="custom-select-wrap">
                  <div
                    className="custom-select"
                    onClick={() =>
                      setShowPositionDropdown(d => !d)
                    }
                  >
                    {positions.find(p => p.id === selectedPositionId)?.name ||
                      "선택"}
                    <span className="arrow">▼</span>
                  </div>
                  {showPositionDropdown && (
                    <div className="custom-dropdown">
                      {positions.map(pos => (
                        <div
                          key={pos.id}
                          className={
                            "dropdown-item" +
                            (selectedPositionId === pos.id
                              ? " selected"
                              : "")
                          }
                          onClick={() => handleSelectPosition(pos.id)}
                        >
                          {pos.name}
                          <span
                            className="item-remove"
                            onClick={e => {
                              e.stopPropagation();
                              handleRemovePosition(pos.id);
                            }}
                          >
                            ×
                          </span>
                        </div>
                      ))}
                      <div
                        className="dropdown-add"
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
              <td className="table-label">재직구분</td>
              <td>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  <option>재직</option>
                  <option>퇴직</option>
                </select>
              </td>
              <td className="table-label">역할</td>
              <td>
                <select value={role} onChange={e => setRole(e.target.value)}>
                  <option>인사담당자</option>
                  <option>일반</option>
                </select>
              </td>
            </tr>
            <tr>
              <td className="table-label">입사일자</td>
              <td>
                <input value={joinDate} readOnly />
                <span className="calendar-ico">📅</span>
              </td>
              <td className="table-label">퇴직일자</td>
              <td>
                <input value={leaveDate} readOnly />
              </td>
            </tr>
            <tr>
              <td className="table-label">비고</td>
              <td colSpan={3}>
                <textarea
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  placeholder=""
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="emp-table-btn-row">
          <button className="excel">엑셀 다운로드</button>
          <button className="leave">퇴사자 등록</button>
          <div className="right-btns">
            <button className="delete">삭제</button>
            <button className="edit">수정</button>
            <button className="save">저장</button>
          </div>
        </div>
      </div>
      {/* 직책 추가 모달 */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-title">직책 추가</div>
            <div className="modal-field">
              <label>우선순위</label>
              <input
                type="number"
                value={newOrder}
                onChange={e => setNewOrder(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>직책명</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <div className="modal-btn-row">
              <button
                className="modal-confirm"
                onClick={handleAddPosition}
                disabled={!newOrder.trim() || !newName.trim()}
              >
                확인
              </button>
              <button className="modal-cancel" onClick={closeAddModal}>
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
