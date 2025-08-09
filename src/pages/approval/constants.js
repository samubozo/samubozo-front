// 휴가 유형 옵션
export const leaveOptions = [
  { value: 'all', label: '전체' },
  { value: '연차', label: '연차' },
  { value: '반차', label: '반차' },
];

// 증명서 유형 옵션
export const certOptions = [
  { value: 'all', label: '전체' },
  { value: '재직증명서', label: '재직증명서' },
  { value: '경력증명서', label: '경력증명서' },
];

// 상태 옵션
export const statusOptions = [
  { value: 'all', label: '전체' },
  { value: '대기', label: '대기' },
  { value: '승인', label: '승인' },
  { value: '만료', label: '만료' },
  { value: '반려', label: '반려' },
];

// 휴가 필터 타입 (통합 검색용)
export const leaveFilterTypes = [{ value: 'all', label: '전체' }];

// HR용 결재 상태 필터
export const hrApprovalStatusOptions = [
  { value: 'pending', label: '대기 중' },
  { value: 'processed', label: '처리 완료' },
];

// 증명서 필터 타입 (통합 검색용)
export const certFilterTypes = [{ value: 'all', label: '전체' }];

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
  { key: 'reason', label: '용도' },
  { key: 'applicant', label: '신청자' },
  { key: 'applicantDepartment', label: '부서' },
  { key: 'applyDate', label: '신청일자' },
  { key: 'approver', label: '결재자' },
  { key: 'processedAt', label: '처리일자' },
  { key: 'expirationDate', label: '만료일' },
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
  EXPIRED: '만료',
  REJECTED: '반려',
  PENDING_APPROVAL: '대기',
};

// 부재 유형 옵션
export const absenceOptions = [
  { value: 'all', label: '전체' },
  { value: '출장', label: '출장' },
  { value: '연수', label: '연수' },
  { value: '외출', label: '외출' },
  { value: '병가', label: '병가' },
  { value: '공가', label: '공가' },
  { value: '기타', label: '기타' },
];

// 긴급도 옵션
export const urgencyOptions = [
  { value: 'all', label: '전체' },
  { value: '긴급', label: '긴급' },
  { value: '일반', label: '일반' },
];

// 부재 필터 타입 (통합 검색용)
export const absenceFilterTypes = [{ value: 'all', label: '전체' }];

// 부재 테이블 컬럼
export const absenceColumns = [
  { key: 'type', label: '항목' },
  { key: 'urgency', label: '긴급도' },
  { key: 'reason', label: '사유' },
  { key: 'applicant', label: '신청자' },
  { key: 'applicantDepartment', label: '부서' },
  { key: 'applyDate', label: '신청일자' },
  { key: 'period', label: '기간' },
  { key: 'approver', label: '결재자' },
  { key: 'processedAt', label: '처리일자' },
  { key: 'status', label: '상태' },
];

// 부재 유형 매핑
export const absenceTypeMap = {
  BUSINESS_TRIP: '출장',
  TRAINING: '연수',
  SHORT_LEAVE: '외출',
  SICK_LEAVE: '병가',
  OFFICIAL_LEAVE: '공가',
  ETC: '기타',
};

// 긴급도 매핑
export const urgencyMap = {
  URGENT: '긴급',
  NORMAL: '일반',
};
