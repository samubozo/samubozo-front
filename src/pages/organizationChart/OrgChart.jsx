
import React from 'react';
import styles from './OrgChart.module.scss';
import CircularProgress from '@mui/material/CircularProgress';


// Import separated components
import OrgCard from './OrgCard';
import OrgDeptCard from './OrgDeptCard';
import MemberDetailModal from './MemberDetailModal';
import AddDeptModal from './AddDeptModal';
import EditDeptModal from './EditDeptModal';
import { MessageWriteModal } from '../message/Message';
import SuccessModal from '../../components/SuccessModal';

// Import the new custom hook
import { useOrgChart } from './hooks/useOrgChart';

// This utility function can stay here or be moved to a utils file.
export function getContrastColor(backgroundColor) {
  if (!backgroundColor) return '#222';
  const hex = backgroundColor.replace('#', '');
  if (hex.length !== 6) return '#222';
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

const OrgChart = () => {
  // All logic, state, and handlers are now coming from this single hook!
  const {
    loading,
    departments,
    filteredMembers,
    filteredDepartments,
    deptMembers,
    tab,
    search,
    deptView,
    selectedTeam,
    sortOrder,
    showFilterDropdown,
    showSortDropdown,
    selectedMember,
    showMemberDetail,
    showAddDeptModal,
    showEditModal,
    showMessageWriteModal,
    messageReceiver,
    showSuccessModal,
    successMessage,
    setSearch,
    setDeptView,
    handleTabChange,
    setSelectedTeam,
    setSortOrder,
    setShowFilterDropdown,
    setShowSortDropdown,
    setSelectedMember,
    setShowMemberDetail,
    setShowAddDeptModal,
    setShowEditModal,
    handleSendMessage,
    setShowMessageWriteModal,
    setSuccessMessage,
    setShowSuccessModal,
    handleAddDept,
    handleEditDept,
    handleDeleteDept,
  } = useOrgChart();

  const teamOptions = [
    { value: 'all', label: '전체 팀' },
    ...departments.map((dept) => ({ value: dept.name, label: dept.name })),
  ];

  const sortOptions = [
    { value: 'asc', label: '이름 오름차순' },
    { value: 'desc', label: '이름 내림차순' },
  ];

  const currentEmployeeNo = sessionStorage.getItem('USER_EMPLOYEE_NO');

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
                {deptView &&
                  sessionStorage.getItem('USER_DEPARTMENT') === '인사팀' && (
                    <button
                      className={styles.editDeptBtn}
                      onClick={() => setShowEditModal(true)} // Simplified
                    >
                      부서 수정
                    </button>
                  )}

                {deptView &&
                  sessionStorage.getItem('USER_DEPARTMENT') === '인사팀' && (
                    <button
                      className={styles.deleteDeptBtn}
                      onClick={handleDeleteDept}
                    >
                      부서 삭제
                    </button>
                  )}
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
                    }}
                    onClick={() => {
                      setSelectedTeam(option.value);
                      setShowFilterDropdown(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {selectedTeam === option.value && (
                      <span style={{ color: '#48b96c' }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

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
                    }}
                    onClick={() => {
                      setSortOrder(option.value);
                      setShowSortDropdown(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {sortOrder === option.value && (
                      <span style={{ color: '#48b96c' }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {tab === 'team' &&
            !deptView &&
            sessionStorage.getItem('USER_DEPARTMENT') === '인사팀' && (
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

      {deptView ? (
        <div className={styles.orgCardGrid}>
          {deptMembers.length > 0 ? (
            deptMembers.map((user) => (
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
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '48px', opacity: 0.3 }}>👥</div>
              <div>팀원이 없습니다</div>
            </div>
          )}
        </div>
      ) : tab === 'all' ? (
        <div className={styles.orgCardGrid}>
          {filteredMembers.map((user) => (
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
          {filteredDepartments.map((dept) => (
            <OrgDeptCard
              dept={dept}
              key={dept.departmentId || dept.id}
              onClick={() => setDeptView(dept)}
            />
          ))}
        </div>
      )}

      <MemberDetailModal
        open={showMemberDetail}
        onClose={() => setShowMemberDetail(false)}
        member={selectedMember}
        onSendMessage={handleSendMessage}
        isSelf={String(selectedMember?.employeeNo) === String(currentEmployeeNo)}
      />

      <MessageWriteModal
        open={showMessageWriteModal}
        onClose={() => setShowMessageWriteModal(false)}
        initialReceiver={messageReceiver}
        onSend={() => setShowMessageWriteModal(false)}
      />

      <AddDeptModal
        open={showAddDeptModal}
        onClose={() => setShowAddDeptModal(false)}
        existingDepartments={departments}
        onAdd={handleAddDept}
      />

      {showEditModal && (
        <EditDeptModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onEdit={handleEditDept}
          initialDept={deptView}
          existingDepartments={departments}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default OrgChart;