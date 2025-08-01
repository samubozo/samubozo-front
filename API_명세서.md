# Samubozo HR System API 명세서

## 목차

1. [인증 API](#인증-api)
2. [인사관리 API](#인사관리-api)
3. [급여관리 API](#급여관리-api)
4. [근태관리 API](#근태관리-api)
5. [결재관리 API](#결재관리-api)
6. [연차관리 API](#연차관리-api)
7. [챗봇 API](#챗봇-api)
8. [증명서 API](#증명서-api)
9. [메시지 API](#메시지-api)
10. [알림 API](#알림-api)
11. [조직도 API](#조직도-api)
12. [일정관리 API](#일정관리-api)
13. [권한 관리 API](#권한-관리-api)
14. [인센티브 관리 API](#인센티브-관리-api)
15. [공통 응답 형식](#공통-응답-형식)
16. [인증 요구사항](#인증-요구사항)
17. [에러 코드](#에러-코드)

---

## 인증 API

### 1.1 회원가입

- **API명**: 신규 사용자 회원가입
- **HTTP 메서드**: POST
- **엔드포인트**: `/auth/signup`
- **설명**: 신규 사용자 회원가입
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "email": "user@sample.com",
  "password": "pw123",
  "name": "홍길동"
}
```

- **응답 형식**:

```json
{
  "success": true,
  "userId": 1
}
```

- **상태 코드**: 201
- **비고**: 이메일 인증 필요

### 1.2 로그인

- **API명**: 아이디/비밀번호로 로그인 및 토큰 발급
- **HTTP 메서드**: POST
- **엔드포인트**: `/auth/login`
- **설명**: 아이디/비밀번호로 로그인 및 토큰 발급
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "email": "user@sample.com",
  "password": "pw123"
}
```

- **응답 형식**:

```json
{
  "token": "...",
  "refreshToken": "..."
}
```

- **상태 코드**: 200
- **비고**: JWT/Refresh 토큰

### 1.3 이메일 중복확인

- **API명**: 이메일(아이디) 중복 여부 확인
- **HTTP 메서드**: POST
- **엔드포인트**: `/auth/check-email`
- **설명**: 이메일(아이디) 중복 여부 확인
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "email": "user@sample.com"
}
```

- **응답 형식**:

```json
{
  "exists": false
}
```

- **상태 코드**: 200

### 1.4 인증번호 발송

- **API명**: 이메일로 인증번호 발송
- **HTTP 메서드**: POST
- **엔드포인트**: `/auth/email-valid`
- **설명**: 이메일로 인증번호 발송
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "email": "user@sample.com"
}
```

- **응답 형식**:

```json
{
  "message": "전송완료"
}
```

- **상태 코드**: 200

### 1.5 인증번호 확인

- **API명**: 이메일 인증번호 확인
- **HTTP 메서드**: POST
- **엔드포인트**: `/auth/verify`
- **설명**: 이메일 인증번호 확인
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "email": "user@sample.com",
  "code": "123456"
}
```

- **응답 형식**:

```json
{
  "verified": true
}
```

- **상태 코드**: 200/400

### 1.6 비밀번호 재설정

- **API명**: 이메일 인증/코드 확인/비밀번호 변경을 단계별로 처리
- **HTTP 메서드**: POST
- **엔드포인트**: `/api/auth/find-password`
- **설명**: 이메일 인증/코드 확인/비밀번호 변경을 단계별로 처리
- **요청 파라미터**: 없음
- **요청 Body**:

```json
// Step 1: EMAIL
{
  "step": "EMAIL",
  "email": "user@sample.com"
}

// Step 2: CODE
{
  "step": "CODE",
  "email": "user@sample.com",
  "code": "123456"
}

// Step 3: RESET
{
  "step": "RESET",
  "email": "user@sample.com",
  "code": "123456",
  "newPassword": "pw456"
}
```

- **응답 형식**:

```json
// Step 1 응답
{
  "message": "코드 전송 완료"
}

// Step 2 응답
{
  "verified": true
}

// Step 3 응답
{
  "reset": true
}
```

- **상태 코드**: 200/400
- **비고**: step: EMAIL, CODE, RESET

### 1.7 로그아웃

- **API명**: JWT/세션 만료 및 로그아웃
- **HTTP 메서드**: POST
- **엔드포인트**: `/auth/logout`
- **설명**: JWT/세션 만료 및 로그아웃
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "token": "..."
}
```

- **응답 형식**:

```json
{
  "success": true
}
```

- **상태 코드**: 200

---

## 인사관리 API

### 2.1 사용자 목록 조회

- **API명**: 전체 사용자(사원) 목록 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/hr/users`
- **설명**: 전체 사용자(사원) 목록 조회
- **요청 파라미터**: page, size, search 등
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "users": [...],
  "total": 20
}
```

- **상태 코드**: 200
- **비고**: 검색/필터 지원

### 2.2 사용자 상세 조회

- **API명**: 특정 사용자 상세정보 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/hr/users/{id}`
- **설명**: 특정 사용자 상세정보 조회
- **요청 파라미터**: id (path variable)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "id": 1,
  "name": "홍길동",
  ...
}
```

- **상태 코드**: 200/404

### 2.3 사용자 등록

- **API명**: 신규 사용자 등록
- **HTTP 메서드**: POST
- **엔드포인트**: `/hr/users`
- **설명**: 신규 사용자 등록
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "name": "홍길동",
  ...
}
```

- **응답 형식**:

```json
{
  "id": 1,
  "created": true
}
```

- **상태 코드**: 201

### 2.4 사용자 정보 수정

- **API명**: 사용자 정보 수정
- **HTTP 메서드**: PATCH
- **엔드포인트**: `/hr/users/{id}`
- **설명**: 사용자 정보 수정
- **요청 파라미터**: id (path variable)
- **요청 Body**:

```json
{
  "name": "변경명",
  ...
}
```

- **응답 형식**:

```json
{
  "updated": true
}
```

- **상태 코드**: 200

### 2.5 사용자 삭제(퇴직)

- **API명**: 사용자 삭제(또는 퇴직처리)
- **HTTP 메서드**: DELETE
- **엔드포인트**: `/hr/users/{id}`
- **설명**: 사용자 삭제(또는 퇴직처리)
- **요청 파라미터**: id (path variable)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "deleted": true
}
```

- **상태 코드**: 200/404

### 2.6 직책 목록 조회

- **API명**: 전체 직책 목록 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/hr/positions`
- **설명**: 전체 직책 목록 조회
- **요청 파라미터**: 없음
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "positions": [...]
}
```

- **상태 코드**: 200

### 2.7 직책 추가/변경

- **API명**: 직책 신규등록 및 수정
- **HTTP 메서드**: POST
- **엔드포인트**: `/hr/positions`
- **설명**: 직책 신규등록 및 수정
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "name": "팀장",
  "priority": 1
}
```

- **응답 형식**:

```json
{
  "created": true,
  "positionId": 2
}
```

- **상태 코드**: 201

### 2.8 증명서 신청 내역 조회

- **API명**: 증명서 신청 이력 전체 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/hr/certificates`
- **설명**: 증명서 신청 이력 전체 조회
- **요청 파라미터**: userId 등
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "certificates": [...]
}
```

- **상태 코드**: 200
- **비고**: 사용자별, 기간별 등

### 2.9 증명서 신청

- **API명**: 증명서 신규 신청
- **HTTP 메서드**: POST
- **엔드포인트**: `/hr/certificates`
- **설명**: 증명서 신규 신청
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "userId": 1,
  "type": "재직",
  ...
}
```

- **응답 형식**:

```json
{
  "applied": true,
  "certificateId": 1
}
```

- **상태 코드**: 201
- **비고**: 결재자/관리자 권한 필요

### 2.10 증명서 상태/결재 처리

- **API명**: 증명서 상태(전자결재) 변경
- **HTTP 메서드**: PUT
- **엔드포인트**: `/hr/certificates/{id}`
- **설명**: 증명서 상태(전자결재) 변경
- **요청 파라미터**: id (path variable)
- **요청 Body**:

```json
{
  "status": "승인",
  ...
}
```

- **응답 형식**:

```json
{
  "updated": true
}
```

- **상태 코드**: 200
- **비고**: 결재자/관리자 권한 필요

### 2.11 증명서 삭제

- **API명**: 증명서 신청 내역 삭제
- **HTTP 메서드**: DELETE
- **엔드포인트**: `/hr/certificates/{id}`
- **설명**: 증명서 신청 내역 삭제
- **요청 파라미터**: id (path variable)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "deleted": true
}
```

- **상태 코드**: 200/404

---

## 급여관리 API

### 3.1 급여 등록

- **API명**: 급여 정보 등록
- **HTTP 메서드**: POST
- **엔드포인트**: `/api/payroll`
- **설명**: 급여 정보 등록
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "userId": 1003,
  "basePayroll": 400000,
  "positionAllowance": 300000,
  "mealAllowance": 50000
}
```

- **응답 형식**:

```json
{
  "payrollId": 3,
  "userId": 1003,
  "basePayroll": 400000,
  "positionAllowance": 300000,
  "mealAllowance": 50000,
  "updatedAt": "2025-07-03T15:14:50.275373"
}
```

- **상태 코드**: 200

### 3.2 급여 조회

- **API명**: 특정 사용자 급여 정보 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/api/payroll/{id}`
- **설명**: 특정 사용자 급여 정보 조회
- **요청 파라미터**: id (path variable)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "payrollId": 3,
  "userId": 1003,
  "basePayroll": 400000,
  "positionAllowance": 300000,
  "mealAllowance": 50000,
  "updatedAt": "2025-07-03T15:14:50.275373"
}
```

- **상태 코드**: 200

### 3.3 급여 수정

- **API명**: 특정 사용자 급여 정보 수정
- **HTTP 메서드**: PUT
- **엔드포인트**: `/api/payroll`
- **설명**: 특정 사용자 급여 정보 수정
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "userId": 1003,
  "basePayroll": 400000,
  "positionAllowance": 300000,
  "mealAllowance": 50000
}
```

- **응답 형식**:

```json
{
  "payrollId": 3,
  "userId": 1003,
  "basePayroll": 400000,
  "positionAllowance": 300000,
  "mealAllowance": 50000,
  "updatedAt": "2025-07-03T15:14:50.275373"
}
```

### 3.4 급여 삭제

- **API명**: 특정 사용자 급여 정보 삭제
- **HTTP 메서드**: DELETE
- **엔드포인트**: `/api/payroll/{id}`
- **설명**: 특정 사용자 급여 정보 삭제
- **요청 파라미터**: id (path variable)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "statusCode": 200,
  "statusMessage": "급여 정보 삭제 성공!",
  "result": null
}
```

### 3.5 내 급여 조회

- **API명**: 로그인한 사용자 급여 정보 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/api/payroll/me`
- **설명**: 로그인한 사용자 급여 정보 조회
- **요청 파라미터**: 없음
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "payrollId": 3,
  "userId": 2,
  "basePayroll": 400000,
  "positionAllowance": 300000,
  "mealAllowance": 50000,
  "updatedAt": "2025-07-03T15:14:50.275373"
}
```

---

## 근태관리 API

### 4.1 출근 기록

- **API명**: 출근 기록
- **HTTP 메서드**: POST
- **엔드포인트**: `/attendance/check-in`
- **설명**: 사용자의 출근을 기록합니다.
- **요청 파라미터**: 없음
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "status": 200,
  "message": "출근 기록 성공",
  "result": {
    "id": 1,
    "employeeNo": "EMP001",
    "checkInTime": "2024-01-15T09:00:00",
    "checkOutTime": null,
    "ipAddress": "192.168.1.100"
  }
}
```

- **상태 코드**:
  - 200: 성공
  - 400: 이미 출근 기록이 존재하는 경우
  - 500: 서버 오류
- **비고**: 클라이언트 IP 주소를 자동으로 기록

### 4.2 퇴근 기록

- **API명**: 퇴근 기록
- **HTTP 메서드**: POST
- **엔드포인트**: `/attendance/check-out`
- **설명**: 사용자의 퇴근을 기록합니다.
- **요청 파라미터**: 없음
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "status": 200,
  "message": "퇴근 기록 성공",
  "result": {
    "id": 1,
    "employeeNo": "EMP001",
    "checkInTime": "2024-01-15T09:00:00",
    "checkOutTime": "2024-01-15T18:00:00",
    "ipAddress": "192.168.1.100"
  }
}
```

- **상태 코드**:
  - 200: 성공
  - 400: 출근 기록이 없거나 이미 퇴근 기록이 된 경우
  - 500: 서버 오류
- **비고**: 출근 기록이 있어야 퇴근 기록 가능

### 4.3 월별 근태 조회

- **API명**: 월별 근태 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/attendance/monthly/{year}/{month}`
- **설명**: 특정 사용자의 월별 근태 기록을 조회합니다.
- **요청 파라미터**:
  - year (path): 조회할 연도
  - month (path): 조회할 월
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "status": 200,
  "message": "월별 근태 조회 성공",
  "result": [
    {
      "id": 1,
      "employeeNo": "EMP001",
      "checkInTime": "2024-01-15T09:00:00",
      "checkOutTime": "2024-01-15T18:00:00",
      "ipAddress": "192.168.1.100"
    }
  ]
}
```

- **상태 코드**:
  - 200: 성공
  - 500: 서버 오류
- **비고**: 인증된 사용자의 근태 기록만 조회

### 4.4 외출 기록

- **API명**: 외출 기록
- **HTTP 메서드**: PUT
- **엔드포인트**: `/attendance/go-out`
- **설명**: 사용자의 외출을 기록합니다.
- **요청 파라미터**: 없음
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "status": 200,
  "message": "외출 기록 성공",
  "result": {
    "id": 1,
    "employeeNo": "EMP001",
    "checkInTime": "2024-01-15T09:00:00",
    "goOutTime": "2024-01-15T12:00:00"
  }
}
```

- **상태 코드**:
  - 200: 성공
  - 400: 출근 기록이 없거나 이미 외출 중인 경우
  - 500: 서버 오류
- **비고**: 출근 후 외출 기록 가능

### 4.5 복귀 기록

- **API명**: 복귀 기록
- **HTTP 메서드**: PUT
- **엔드포인트**: `/attendance/return`
- **설명**: 사용자의 외출 복귀를 기록합니다.
- **요청 파라미터**: 없음
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "status": 200,
  "message": "복귀 기록 성공",
  "result": {
    "id": 1,
    "employeeNo": "EMP001",
    "checkInTime": "2024-01-15T09:00:00",
    "goOutTime": "2024-01-15T12:00:00",
    "returnTime": "2024-01-15T13:00:00"
  }
}
```

- **상태 코드**:
  - 200: 성공
  - 400: 외출 기록이 없거나 이미 복귀한 경우
  - 500: 서버 오류
- **비고**: 외출 후 복귀 기록 가능

---

## 결재관리 API

### 5.1 결재 요청 생성

- **API명**: 결재 요청 생성
- **HTTP 메서드**: POST
- **엔드포인트**: `/api/v1/approvals`
- **설명**: 새로운 결재 요청을 생성합니다.
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "title": "휴가 신청",
  "content": "연차 신청합니다.",
  "approverId": 2,
  "requestType": "VACATION"
}
```

- **응답 형식**:

```json
{
  "id": 1,
  "title": "휴가 신청",
  "content": "연차 신청합니다.",
  "status": "PENDING",
  "requestType": "VACATION",
  "requesterId": 1,
  "approverId": 2,
  "createdAt": "2024-01-15T10:00:00"
}
```

- **상태 코드**:
  - 201: 생성 성공
  - 400: 잘못된 요청
  - 500: 서버 오류
- **비고**: 인증된 사용자가 요청자로 자동 설정

### 5.2 결재 요청 조회

- **API명**: 결재 요청 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/api/v1/approvals/{id}`
- **설명**: 특정 ID를 가진 결재 요청을 조회합니다.
- **요청 파라미터**:
  - id (path): 조회할 결재 요청의 ID
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "id": 1,
  "title": "휴가 신청",
  "content": "연차 신청합니다.",
  "status": "PENDING",
  "requestType": "VACATION",
  "requesterId": 1,
  "approverId": 2,
  "createdAt": "2024-01-15T10:00:00"
}
```

- **상태 코드**:
  - 200: 성공
  - 404: 해당 ID의 결재 요청을 찾을 수 없음
  - 500: 서버 오류

### 5.3 결재 승인

- **API명**: 결재 승인
- **HTTP 메서드**: PUT
- **엔드포인트**: `/api/v1/approvals/{id}/approve`
- **설명**: 특정 결재 요청을 승인 처리합니다.
- **요청 파라미터**:
  - id (path): 승인할 결재 요청의 ID
  - approverId (query): 승인자의 ID
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "id": 1,
  "title": "휴가 신청",
  "content": "연차 신청합니다.",
  "status": "APPROVED",
  "requestType": "VACATION",
  "requesterId": 1,
  "approverId": 2,
  "approvedAt": "2024-01-15T11:00:00"
}
```

- **상태 코드**:
  - 200: 성공
  - 400: 잘못된 요청
  - 404: 해당 ID의 결재 요청을 찾을 수 없음
  - 500: 서버 오류
- **비고**: 승인 권한이 있는 사용자만 가능

### 5.4 결재 반려

- **API명**: 결재 반려
- **HTTP 메서드**: PUT
- **엔드포인트**: `/api/v1/approvals/{id}/reject`
- **설명**: 특정 결재 요청을 반려 처리합니다.
- **요청 파라미터**:
  - id (path): 반려할 결재 요청의 ID
  - approverId (query): 반려자의 ID
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "id": 1,
  "title": "휴가 신청",
  "content": "연차 신청합니다.",
  "status": "REJECTED",
  "requestType": "VACATION",
  "requesterId": 1,
  "approverId": 2,
  "rejectedAt": "2024-01-15T11:00:00"
}
```

- **상태 코드**:
  - 200: 성공
  - 400: 잘못된 요청
  - 404: 해당 ID의 결재 요청을 찾을 수 없음
  - 500: 서버 오류
- **비고**: 반려 권한이 있는 사용자만 가능

---

## 연차관리 API

### 6.1 연차 신청

- **API명**: 연차 신청
- **HTTP 메서드**: POST
- **엔드포인트**: `/api/v1/vacations/requestVacation`
- **설명**: 새로운 연차 신청을 등록합니다.
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "startDate": "2024-01-20",
  "endDate": "2024-01-22",
  "vacationType": "ANNUAL",
  "reason": "개인 연차"
}
```

- **응답 형식**:

```json
{
  "status": 201
}
```

- **상태 코드**:
  - 201: 생성 성공
  - 400: 잘못된 요청 (연차 일수 초과, 중복 신청 등)
  - 500: 서버 오류
- **비고**: 인증된 사용자가 신청자로 자동 설정

---

## 챗봇 API

### 7.1 챗봇 대화

- **API명**: 챗봇과 대화
- **HTTP 메서드**: POST
- **엔드포인트**: `/chatbot/chat`
- **설명**: 챗봇과 대화를 진행합니다. 욕설 필터링과 업무 관련 키워드 필터링이 적용됩니다.
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "message": "연차 신청 방법을 알려주세요",
  "conversationId": "uuid-string"
}
```

- **응답 형식**:

```json
{
  "message": "챗봇 응답 메시지",
  "conversationId": "uuid-string"
}
```

- **상태 코드**: 200
- **비고**:
  - 욕설 필터링 적용
  - 업무 관련 키워드만 허용
  - JWT 토큰 인증 필요

### 7.2 챗봇 대화 기록 조회

- **API명**: 챗봇 대화 기록 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/chatbot/history`
- **설명**: 사용자의 챗봇 대화 기록을 조회합니다.
- **요청 파라미터**: 없음
- **요청 Body**: 없음
- **응답 형식**:

```json
[
  {
    "id": 1,
    "employeeNo": 1001,
    "message": "사용자 메시지",
    "response": "챗봇 응답",
    "createdAt": "2024-01-15T10:00:00"
  }
]
```

- **상태 코드**: 200
- **비고**: JWT 토큰 인증 필요

### 7.3 챗봇 헬로

- **API명**: 챗봇 헬로
- **HTTP 메서드**: GET
- **엔드포인트**: `/chatbot/hello`
- **설명**: 챗봇 서비스 상태 확인
- **요청 파라미터**: 없음
- **요청 Body**: 없음
- **응답 형식**:

```json
"Hello, Chatbot!"
```

- **상태 코드**: 200

---

## 증명서 API

### 8.1 증명서 발급 신청

- **API명**: 증명서 발급 신청
- **HTTP 메서드**: POST
- **엔드포인트**: `/certificate/application`
- **설명**: 새로운 증명서 발급을 신청합니다.
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "certificateType": "재직증명서",
  "purpose": "대출",
  "requestDate": "2024-01-15"
}
```

- **응답 형식**:

```json
{
  "status": 200,
  "message": "증명서 신청이 완료되었습니다."
}
```

- **상태 코드**: 200

### 8.2 증명서 목록 조회

- **API명**: 증명서 목록 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/certificate/certificate/list`
- **설명**: 증명서 신청 목록을 페이징하여 조회합니다.
- **요청 파라미터**:
  - page: 페이지 번호 (기본값: 0)
  - size: 페이지 크기 (기본값: 5)
  - sort: 정렬 기준 (기본값: certificateId)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "statusCode": 200,
  "statusMessage": "Success",
  "result": {
    "content": [
      {
        "certificateId": 1,
        "certificateType": "재직증명서",
        "status": "승인대기",
        "requestDate": "2024-01-15"
      }
    ],
    "totalElements": 10,
    "totalPages": 2
  }
}
```

- **상태 코드**: 200

### 8.3 증명서 수정

- **API명**: 증명서 수정
- **HTTP 메서드**: PUT
- **엔드포인트**: `/certificate/certificate/{id}`
- **설명**: 특정 증명서 신청을 수정합니다.
- **요청 파라미터**: id (path variable)
- **요청 Body**:

```json
{
  "certificateType": "재직증명서",
  "purpose": "대출",
  "requestDate": "2024-01-15"
}
```

- **응답 형식**:

```json
{
  "statusCode": 200,
  "statusMessage": "수정 완료되었습니다.",
  "result": null
}
```

- **상태 코드**: 200

### 8.4 증명서 삭제

- **API명**: 증명서 삭제
- **HTTP 메서드**: DELETE
- **엔드포인트**: `/certificate/delete/{id}`
- **설명**: 특정 증명서 신청을 삭제합니다.
- **요청 파라미터**: id (path variable)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "statusCode": 200,
  "statusMessage": "삭제 완료되었습니다.",
  "result": 1
}
```

- **상태 코드**: 200

---

## 메시지 API

### 9.1 쪽지 전송

- **API명**: 쪽지 전송
- **HTTP 메서드**: POST
- **엔드포인트**: `/messages`
- **설명**: 다른 사용자에게 쪽지를 전송합니다. 첨부파일 포함 가능.
- **요청 파라미터**: 없음
- **요청 Body**: multipart/form-data
  - request: JSON 형태의 메시지 정보
  - attachment: 첨부파일 (선택사항)

```json
{
  "receiverId": 1002,
  "subject": "쪽지 제목",
  "content": "쪽지 내용"
}
```

- **응답 형식**:

```json
{
  "messageId": 1,
  "senderId": 1001,
  "receiverId": 1002,
  "subject": "쪽지 제목",
  "content": "쪽지 내용",
  "sentAt": "2024-01-15T10:00:00"
}
```

- **상태 코드**: 201
- **비고**: JWT 토큰 인증 필요, 첨부파일 지원

### 9.2 받은 쪽지함 조회

- **API명**: 받은 쪽지함 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/messages/received`
- **설명**: 받은 쪽지 목록을 검색, 필터, 페이징하여 조회합니다.
- **요청 파라미터**:
  - page: 페이지 번호 (기본값: 0)
  - size: 페이지 크기 (기본값: 10)
  - period: 기간 필터 (기본값: all)
  - searchType: 검색 타입
  - searchValue: 검색 값
  - unreadOnly: 읽지 않은 쪽지만 조회 (기본값: false)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "content": [
    {
      "messageId": 1,
      "senderId": 1001,
      "receiverId": 1002,
      "subject": "쪽지 제목",
      "content": "쪽지 내용",
      "isRead": false,
      "sentAt": "2024-01-15T10:00:00"
    }
  ],
  "totalElements": 10,
  "totalPages": 1
}
```

- **상태 코드**: 200

### 9.3 보낸 쪽지함 조회

- **API명**: 보낸 쪽지함 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/messages/sent`
- **설명**: 보낸 쪽지 목록을 검색, 필터, 페이징하여 조회합니다.
- **요청 파라미터**:
  - page: 페이지 번호 (기본값: 0)
  - size: 페이지 크기 (기본값: 10)
  - period: 기간 필터 (기본값: all)
  - searchType: 검색 타입
  - searchValue: 검색 값
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "content": [
    {
      "messageId": 1,
      "senderId": 1001,
      "receiverId": 1002,
      "subject": "쪽지 제목",
      "content": "쪽지 내용",
      "isRead": true,
      "sentAt": "2024-01-15T10:00:00"
    }
  ],
  "totalElements": 5,
  "totalPages": 1
}
```

- **상태 코드**: 200

### 9.4 쪽지 읽기

- **API명**: 쪽지 읽기
- **HTTP 메서드**: GET
- **엔드포인트**: `/messages/{messageId}`
- **설명**: 특정 쪽지를 읽고 읽음 처리를 합니다.
- **요청 파라미터**: messageId (path variable)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "messageId": 1,
  "senderId": 1001,
  "receiverId": 1002,
  "subject": "쪽지 제목",
  "content": "쪽지 내용",
  "isRead": true,
  "readAt": "2024-01-15T11:00:00",
  "sentAt": "2024-01-15T10:00:00"
}
```

- **상태 코드**: 200

### 9.5 읽지 않은 쪽지 개수 조회

- **API명**: 읽지 않은 쪽지 개수 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/messages/unread/count`
- **설명**: 읽지 않은 쪽지 개수를 조회합니다.
- **요청 파라미터**: 없음
- **요청 Body**: 없음
- **응답 형식**:

```json
5
```

- **상태 코드**: 200

### 9.6 쪽지 삭제

- **API명**: 쪽지 삭제
- **HTTP 메서드**: DELETE
- **엔드포인트**: `/messages/{messageId}`
- **설명**: 특정 쪽지를 삭제합니다.
- **요청 파라미터**: messageId (path variable)
- **요청 Body**: 없음
- **응답 형식**: 없음
- **상태 코드**: 204

### 9.7 쪽지 발신 취소

- **API명**: 쪽지 발신 취소
- **HTTP 메서드**: DELETE
- **엔드포인트**: `/messages/{messageId}/recall`
- **설명**: 읽지 않은 쪽지를 발신 취소합니다.
- **요청 파라미터**: messageId (path variable)
- **요청 Body**: 없음
- **응답 형식**: 없음
- **상태 코드**: 204

---

## 알림 API

### 10.1 SSE 구독

- **API명**: SSE 구독
- **HTTP 메서드**: GET
- **엔드포인트**: `/notifications/subscribe`
- **설명**: Server-Sent Events를 통해 실시간 알림을 구독합니다.
- **요청 파라미터**: 없음
- **요청 Body**: 없음
- **응답 형식**: text/event-stream
- **상태 코드**: 200
- **비고**: JWT 토큰 인증 필요

### 10.2 알림 읽음 처리

- **API명**: 알림 읽음 처리
- **HTTP 메서드**: PATCH
- **엔드포인트**: `/notifications/{notificationId}/read`
- **설명**: 특정 알림을 읽음 상태로 변경합니다.
- **요청 파라미터**: notificationId (path variable)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "notificationId": 1,
  "title": "알림 제목",
  "content": "알림 내용",
  "isRead": true,
  "createdAt": "2024-01-15T10:00:00"
}
```

- **상태 코드**: 200

### 10.3 알림 목록 조회

- **API명**: 알림 목록 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/notifications`
- **설명**: 사용자의 알림 목록을 조회합니다.
- **요청 파라미터**: 없음
- **요청 Body**: 없음
- **응답 형식**:

```json
[
  {
    "notificationId": 1,
    "title": "알림 제목",
    "content": "알림 내용",
    "isRead": false,
    "createdAt": "2024-01-15T10:00:00"
  }
]
```

- **상태 코드**: 200

### 10.4 읽지 않은 알림 개수 조회

- **API명**: 읽지 않은 알림 개수 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/notifications/unread/count`
- **설명**: 읽지 않은 알림 개수를 조회합니다.
- **요청 파라미터**: 없음
- **요청 Body**: 없음
- **응답 형식**:

```json
3
```

- **상태 코드**: 200

---

## 조직도 API

### 11.1 조직도 조회

- **API명**: 조직도 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/org/chart`
- **설명**: 회사 전체 조직도를 조회합니다.
- **요청 파라미터**:
  - departmentId: 특정 부서 조회 (선택사항)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "departments": [
    {
      "departmentId": 1,
      "departmentName": "개발팀",
      "managerId": 1001,
      "managerName": "김팀장",
      "employeeCount": 5,
      "subDepartments": [
        {
          "departmentId": 2,
          "departmentName": "프론트엔드팀",
          "managerId": 1002,
          "managerName": "이팀장",
          "employeeCount": 3
        }
      ]
    }
  ]
}
```

- **상태 코드**: 200

### 11.2 부서별 인원 현황 조회

- **API명**: 부서별 인원 현황 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/org/employees`
- **설명**: 부서별 인원 현황을 조회합니다.
- **요청 파라미터**:
  - departmentId: 특정 부서 조회 (선택사항)
  - includeInactive: 퇴직자 포함 여부 (기본값: false)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "totalEmployees": 50,
  "activeEmployees": 45,
  "departments": [
    {
      "departmentId": 1,
      "departmentName": "개발팀",
      "employeeCount": 15,
      "activeCount": 14,
      "employees": [
        {
          "employeeId": 1001,
          "name": "김개발",
          "position": "팀장",
          "status": "재직"
        }
      ]
    }
  ]
}
```

- **상태 코드**: 200

---

## 일정관리 API

### 12.1 일정 등록

- **API명**: 일정 등록
- **HTTP 메서드**: POST
- **엔드포인트**: `/schedule`
- **설명**: 새로운 일정을 등록합니다.
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "title": "팀 미팅",
  "description": "주간 업무 회의",
  "startDate": "2024-01-20T09:00:00",
  "endDate": "2024-01-20T10:00:00",
  "type": "MEETING",
  "location": "회의실 A",
  "attendees": [1001, 1002, 1003],
  "isPublic": true
}
```

- **응답 형식**:

```json
{
  "scheduleId": 1,
  "title": "팀 미팅",
  "status": "CREATED"
}
```

- **상태 코드**: 201

### 12.2 일정 목록 조회

- **API명**: 일정 목록 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/schedule`
- **설명**: 일정 목록을 조회합니다.
- **요청 파라미터**:
  - startDate: 시작일
  - endDate: 종료일
  - type: 일정 타입 (MEETING, VACATION, BUSINESS_TRIP, EDUCATION)
  - departmentId: 부서별 조회 (선택사항)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "schedules": [
    {
      "scheduleId": 1,
      "title": "팀 미팅",
      "description": "주간 업무 회의",
      "startDate": "2024-01-20T09:00:00",
      "endDate": "2024-01-20T10:00:00",
      "type": "MEETING",
      "location": "회의실 A",
      "createdBy": 1001,
      "attendees": [1001, 1002, 1003]
    }
  ],
  "total": 10
}
```

- **상태 코드**: 200

### 12.3 일정 상세 조회

- **API명**: 일정 상세 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/schedule/{scheduleId}`
- **설명**: 특정 일정의 상세 정보를 조회합니다.
- **요청 파라미터**: scheduleId (path variable)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "scheduleId": 1,
  "title": "팀 미팅",
  "description": "주간 업무 회의",
  "startDate": "2024-01-20T09:00:00",
  "endDate": "2024-01-20T10:00:00",
  "type": "MEETING",
  "location": "회의실 A",
  "createdBy": 1001,
  "attendees": [
    {
      "employeeId": 1001,
      "name": "김개발",
      "status": "CONFIRMED"
    }
  ]
}
```

- **상태 코드**: 200

### 12.4 일정 수정

- **API명**: 일정 수정
- **HTTP 메서드**: PUT
- **엔드포인트**: `/schedule/{scheduleId}`
- **설명**: 특정 일정을 수정합니다.
- **요청 파라미터**: scheduleId (path variable)
- **요청 Body**:

```json
{
  "title": "팀 미팅 (수정)",
  "description": "주간 업무 회의",
  "startDate": "2024-01-20T09:00:00",
  "endDate": "2024-01-20T10:00:00",
  "type": "MEETING",
  "location": "회의실 B",
  "attendees": [1001, 1002, 1003]
}
```

- **응답 형식**:

```json
{
  "scheduleId": 1,
  "status": "UPDATED"
}
```

- **상태 코드**: 200

### 12.5 일정 삭제

- **API명**: 일정 삭제
- **HTTP 메서드**: DELETE
- **엔드포인트**: `/schedule/{scheduleId}`
- **설명**: 특정 일정을 삭제합니다.
- **요청 파라미터**: scheduleId (path variable)
- **요청 Body**: 없음
- **응답 형식**: 없음
- **상태 코드**: 204

---

## 권한 관리 API

### 13.1 사용자 역할 조회

- **API명**: 사용자 역할 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/auth/roles`
- **설명**: 현재 사용자의 역할과 권한을 조회합니다.
- **요청 파라미터**: 없음
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "userId": 1001,
  "roles": ["EMPLOYEE", "TEAM_LEADER"],
  "permissions": [
    "READ_EMPLOYEE_INFO",
    "WRITE_ATTENDANCE",
    "READ_PAYROLL",
    "MANAGE_TEAM"
  ]
}
```

- **상태 코드**: 200

### 13.2 역할별 사용자 목록 조회

- **API명**: 역할별 사용자 목록 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/auth/users/by-role`
- **설명**: 특정 역할을 가진 사용자 목록을 조회합니다.
- **요청 파라미터**:
  - role: 역할명 (EMPLOYEE, TEAM_LEADER, HR_MANAGER, ADMIN)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "users": [
    {
      "userId": 1001,
      "name": "김개발",
      "email": "kim@company.com",
      "roles": ["EMPLOYEE", "TEAM_LEADER"],
      "department": "개발팀"
    }
  ],
  "total": 5
}
```

- **상태 코드**: 200

### 13.3 사용자 역할 변경

- **API명**: 사용자 역할 변경
- **HTTP 메서드**: PUT
- **엔드포인트**: `/auth/users/{userId}/roles`
- **설명**: 특정 사용자의 역할을 변경합니다.
- **요청 파라미터**: userId (path variable)
- **요청 Body**:

```json
{
  "roles": ["EMPLOYEE", "TEAM_LEADER"]
}
```

- **응답 형식**:

```json
{
  "userId": 1001,
  "roles": ["EMPLOYEE", "TEAM_LEADER"],
  "updated": true
}
```

- **상태 코드**: 200
- **비고**: 관리자 권한 필요

---

## 인센티브 관리 API

### 14.1 인센티브 등록

- **API명**: 인센티브 등록
- **HTTP 메서드**: POST
- **엔드포인트**: `/payroll/incentives`
- **설명**: 특정 직원에게 인센티브를 등록합니다.
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "employeeId": 1001,
  "incentiveType": "PERFORMANCE",
  "amount": 500000,
  "description": "우수 성과 인센티브",
  "effectiveDate": "2024-01-15",
  "expiryDate": "2024-12-31"
}
```

- **응답 형식**:

```json
{
  "incentiveId": 1,
  "employeeId": 1001,
  "incentiveType": "PERFORMANCE",
  "amount": 500000,
  "status": "ACTIVE"
}
```

- **상태 코드**: 201

### 14.2 인센티브 목록 조회

- **API명**: 인센티브 목록 조회
- **HTTP 메서드**: GET
- **엔드포인트**: `/payroll/incentives`
- **설명**: 인센티브 목록을 조회합니다.
- **요청 파라미터**:
  - employeeId: 특정 직원 조회 (선택사항)
  - type: 인센티브 타입 (선택사항)
  - status: 상태 (ACTIVE, EXPIRED, CANCELLED)
- **요청 Body**: 없음
- **응답 형식**:

```json
{
  "incentives": [
    {
      "incentiveId": 1,
      "employeeId": 1001,
      "employeeName": "김개발",
      "incentiveType": "PERFORMANCE",
      "amount": 500000,
      "description": "우수 성과 인센티브",
      "effectiveDate": "2024-01-15",
      "expiryDate": "2024-12-31",
      "status": "ACTIVE"
    }
  ],
  "total": 10
}
```

- **상태 코드**: 200

### 14.3 인센티브 수정

- **API명**: 인센티브 수정
- **HTTP 메서드**: PUT
- **엔드포인트**: `/payroll/incentives/{incentiveId}`
- **설명**: 특정 인센티브를 수정합니다.
- **요청 파라미터**: incentiveId (path variable)
- **요청 Body**:

```json
{
  "amount": 600000,
  "description": "우수 성과 인센티브 (수정)",
  "expiryDate": "2024-12-31"
}
```

- **응답 형식**:

```json
{
  "incentiveId": 1,
  "status": "UPDATED"
}
```

- **상태 코드**: 200

### 14.4 인센티브 삭제

- **API명**: 인센티브 삭제
- **HTTP 메서드**: DELETE
- **엔드포인트**: `/payroll/incentives/{incentiveId}`
- **설명**: 특정 인센티브를 삭제합니다.
- **요청 파라미터**: incentiveId (path variable)
- **요청 Body**: 없음
- **응답 형식**: 없음
- **상태 코드**: 204

### 14.5 야근수당 등록

- **API명**: 야근수당 등록
- **HTTP 메서드**: POST
- **엔드포인트**: `/payroll/overtime`
- **설명**: 야근수당을 등록합니다.
- **요청 파라미터**: 없음
- **요청 Body**:

```json
{
  "employeeId": 1001,
  "date": "2024-01-15",
  "startTime": "18:00",
  "endTime": "21:00",
  "hours": 3,
  "rate": 1.5,
  "amount": 45000,
  "reason": "프로젝트 마감"
}
```

- **응답 형식**:

```json
{
  "overtimeId": 1,
  "employeeId": 1001,
  "date": "2024-01-15",
  "hours": 3,
  "amount": 45000,
  "status": "APPROVED"
}
```

- **상태 코드**: 201

---

## 공통 응답 형식

### 성공 응답

```json
{
  "status": 200,
  "message": "성공 메시지",
  "result": {
    // 응답 데이터
  }
}
```

### 오류 응답

```json
{
  "status": 400,
  "message": "오류 메시지",
  "result": null
}
```

---

## 인증 요구사항

모든 API는 JWT 토큰을 통한 인증이 필요합니다. 요청 헤더에 다음을 포함해야 합니다:

```
Authorization: Bearer {JWT_TOKEN}
```

---

## 에러 코드

- **400**: 잘못된 요청 (Bad Request)
- **401**: 인증 실패 (Unauthorized)
- **403**: 권한 없음 (Forbidden)
- **404**: 리소스를 찾을 수 없음 (Not Found)
- **500**: 서버 내부 오류 (Internal Server Error)

---

## 비즈니스 요구사항

### BR1.1 인력 정보 관리 효율화

사원 기본 및 상세 정보를 체계적으로 관리하여, 필요한 정보를 신속하게 조회하고 활용할 수 있어야 한다.

### BR1.2 정확한 근태 관리

직원의 출/퇴근 및 근무 시간을 정확하게 기록하고 관리하여, 급여 산정 및 근무 현황 파악의 기반을 마련해야 한다. (로그인한 시간을 기준으로 출근 시간 확인)

### BR1.3 연차 사용 여부 확인

연차 사용 이력을 근태 기록에서 확인할 수 있어야 하며, 별도 연차 산정 로직은 포함하지 않는다.

### BR1.4 급여 산정 기반 마련

직원의 급여 정보를 관리하고, 기본 급여 및 수당 정보를 입력할 수 있는 기반을 제공하여 정확한 급여 산정 프로세스를 지원해야 한다.

### BR1.5 일정 확인 시각화

직원의 주요 업무 일정(근무, 출장 등)을 달력 형태로 시각화하여, 개인 및 팀의 일정을 쉽게 파악할 수 있도록 해야 한다.

---

## 시스템 요구사항

### SR1.1 사용자 인증

사용자(직원, 인사 담당자)는 안전하게 로그인하고 자신의 역할에 맞는 기능에 접근할 수 있어야 한다.

### SR1.2 데이터 보안

모든 민감한 개인 정보(급여, 주민번호 등)는 암호화하여 저장하고, 접근 권한에 따라 통제되어야 한다.

### SR1.3 사용자 인터페이스

직관적이고 사용자 친화적인 UI/UX를 제공하여, 누구나 쉽게 시스템을 이용할 수 있어야 한다.

### SR1.4 성능

일반적인 사용자 수와 데이터 양에서 응답 시간이 지연되지 않아야 한다.

### SR1.5 확장성

향후 기능 추가 및 사용자 수 증가에 대비하여 유연한 아키텍처로 설계되어야 한다.

### SR1.6 반응형

PC 환경에 최적화된 반응형 웹 애플리케이션으로 개발되어야 한다.
