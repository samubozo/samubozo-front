// 휴가 유형 옵션
export const leaveOptions = [
  { value: 'all', label: '전체' },
  { value: '연차', label: '연차' },
  { value: '반차', label: '반차' },
];

// 증명서 유형 옵션
export const certOptions = [
  { value: 'all', label: '전체' },
  { value: '재직', label: '재직' },
  { value: '경력', label: '경력' },
  { value: '퇴직', label: '퇴직' },
];

// 상태 옵션
export const statusOptions = [
  { value: 'all', label: '전체' },
  { value: '요청', label: '요청' },
  { value: '승인', label: '승인' },
  { value: '반려', label: '반려' },
];

// 휴가 필터 타입
export const leaveFilterTypes = [
  { value: 'all', label: '전체' },
  { value: 'applicant', label: '신청자' },
  { value: 'approver', label: '결재자' },
  { value: 'reason', label: '사유' },
  { value: 'period', label: '기간' },
  { value: 'applicantDepartment', label: '부서' },
];

// HR용 결재 상태 필터
export const hrApprovalStatusOptions = [
  { value: 'pending', label: '대기 중' },
  { value: 'processed', label: '처리 완료' },
];

// 증명서 필터 타입
export const certFilterTypes = [
  { value: 'all', label: '전체' },
  { value: 'applicant', label: '신청자' },
  { value: 'approver', label: '결재자' },
  { value: 'purpose', label: '용도' },
  { value: 'applicantDepartment', label: '부서' },
];

// 휴가 테이블 컬럼
export const leaveColumns = [
  { key: 'type', label: '항목' },
  { key: 'reason', label: '사유' },
  { key: 'applicant', label: '신청자' },
  { key: 'applicantDepartment', label: '부서' },
  { key: 'applyDate', label: '신청일자' },
  { key: 'period', label: '기간' },
  { key: 'approver', label: '결재자' },
  { key: 'processedAt', label: '처리일자' },
  { key: 'status', label: '상태' },
];

// 증명서 테이블 컬럼
export const certColumns = [
  { key: 'type', label: '항목' },
  { key: 'purpose', label: '용도' },
  { key: 'applicant', label: '신청자' },
  { key: 'applicantDepartment', label: '부서' },
  { key: 'applyDate', label: '신청일자' },
  { key: 'approver', label: '결재자' },
  { key: 'processedAt', label: '처리일자' },
  { key: 'status', label: '상태' },
];

// 휴가 유형 매핑
export const vacationTypeMap = {
  ANNUAL_LEAVE: '연차',
  AM_HALF_DAY: '반차(오전)',
  PM_HALF_DAY: '반차(오후)',
};

// 상태 매핑
export const statusMap = {
  PENDING: '대기',
  APPROVED: '승인',
  REJECTED: '반려',
  PENDING_APPROVAL: '대기',
};
