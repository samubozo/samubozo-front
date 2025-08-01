# 📋 Samubozo HR System 완전 스토리보드

## 🎯 프로젝트 개요

**Samubozo HR System**은 기업의 인사관리를 위한 종합적인 웹 애플리케이션입니다. 사용자 권한에 따라 다른 기능을 제공하며, 근태관리, 급여관리, 결재관리, 메시지 시스템 등을 포함합니다.

---

## 👥 사용자 페르소나

### 1. 일반 직원 (hrRole: 'N')

- **목표**: 개인 근태 기록, 급여 조회, 메시지 송수신, 증명서 신청
- **주요 기능**: 출근/퇴근, 연차/부재 신청, 쪽지함, 개인 급여 조회, 증명서 신청
- **권한**: 기본 사용자 권한

### 2. HR 관리자 (hrRole: 'Y')

- **목표**: 인사 관리, 급여 관리, 결재 처리, 조직도 관리
- **주요 기능**: 직원 정보 관리, 급여 설정, 결재 승인/반려, 조직도 관리, 부서 관리
- **권한**: 관리자 권한

---

## 🔐 인증 및 로그인 플로우

### 📱 화면 구성

#### 1. 로그인 페이지 (/login)

```
🎯 사용자 목표: 안전한 로그인 및 시스템 접근

🖼️ 화면 구성:
- 회사 로고 표시
- 이메일 입력 필드 (자동완성 지원)
- 비밀번호 입력 필드
- "이메일 저장" 체크박스
- 로그인 버튼
- "이메일 찾기" / "비밀번호 찾기" 링크

📊 데이터 구조:
- 입력: email, password, remember
- 출력: accessToken, refreshToken, userInfo
- API: POST /auth-service/auth/login

🔄 사용자 플로우:
시작 → 이메일 입력 → 비밀번호 입력 → 로그인 버튼 클릭 → 대시보드 이동
```

#### 2. 회원가입 페이지 (/signup)

```
🎯 사용자 목표: 새로운 계정 생성

🖼️ 화면 구성:
- 회사 로고
- 이메일 입력 필드
- 비밀번호 입력 필드
- 비밀번호 확인 필드
- 이름 입력 필드
- 회원가입 버튼
- 로그인 페이지 링크

📊 데이터 구조:
- 입력: email, password, confirmPassword, name
- API: POST /auth-service/auth/signup

🔄 사용자 플로우:
이메일 입력 → 비밀번호 입력 → 비밀번호 확인 → 이름 입력 → 회원가입 → 이메일 인증
```

#### 3. 비밀번호 찾기 (/passwordFind)

```
🎯 사용자 목표: 비밀번호 재설정

🖼️ 화면 구성:
- 이메일 입력 필드
- 인증번호 입력 필드
- 새 비밀번호 입력 필드
- 새 비밀번호 확인 필드
- 재설정 버튼

📊 데이터 구조:
- 입력: email, verificationCode, newPassword
- API: POST /auth-service/auth/password-reset

🔄 사용자 플로우:
이메일 입력 → 인증번호 발송 → 인증번호 입력 → 새 비밀번호 입력 → 재설정
```

---

## 🏠 대시보드 (/dashboard)

### 📱 화면 구성

```
🎯 사용자 목표: 개인 현황 및 주요 기능 접근

🖼️ 화면 구성:
- 상단 헤더 (로고, 사용자 정보, 로그아웃)
- 사이드바 네비게이션
- 메인 콘텐츠 영역
- 개인 통계 카드
- 빠른 액션 버튼들

📊 주요 기능:
- 근태 현황 요약
- 연차 사용률
- 미처리 결재 건수
- 최근 메시지
- 날씨 정보
- 챗봇 도움말

🔄 사용자 플로우:
로그인 후 자동 이동 → 개인 현황 확인 → 원하는 기능 선택
```

---

## 📊 근태관리 (/attendance)

### 📱 화면 구성

#### 1. 근태 대시보드

```
🎯 사용자 목표: 출근/퇴근 기록 및 근태 현황 확인

🖼️ 화면 구성:
- 출근/퇴근 버튼 (상태별)
- 현재 시간 표시
- 오늘의 한마디
- 연차 사용률 원형 그래프
- 근무 시간 정보 (남은 시간, 근무한 시간)
- 월별 근태 테이블
- 부재/휴가 신청 버튼

📊 데이터 구조:
- 출근 시간: checkInTime
- 퇴근 시간: checkOutTime
- 외출 시간: goOutTime
- 복귀 시간: returnTime
- 지각 여부: isLate
- 연차 현황: vacationBalance

🔄 사용자 플로우:
페이지 접속 → 현재 근태 상태 확인 → 출근/퇴근 버튼 클릭 → 근태 기록
```

#### 2. 휴가 신청 모달

```
🎯 사용자 목표: 연차/반차 신청

🖼️ 화면 구성:
- 휴가 신청일 선택
- 휴가 유형 선택 (연차, 반차(오전), 반차(오후))
- 휴가 기간 선택 (시작일, 종료일)
- 사유 입력
- 신청 버튼

📊 데이터 구조:
- 입력: vacationType, startDate, endDate, reason, requested_at
- API: POST /approval-service/vacations

🔄 사용자 플로우:
휴가 신청 버튼 클릭 → 휴가 유형 선택 → 기간 설정 → 사유 입력 → 신청
```

#### 3. 부재 신청 모달

```
🎯 사용자 목표: 출장/연수/외출/병가/공가 신청

🖼️ 화면 구성:
- 부재 유형 선택 (출장, 연수, 외출, 병가, 공가, 기타)
- 긴급도 선택 (일반, 긴급)
- 날짜 선택 (시작일, 종료일)
- 시간 선택 (시작시간, 종료시간)
- 사유 입력
- 신청 버튼

📊 데이터 구조:
- 입력: type, urgency, startDate, endDate, startTime, endTime, reason
- API: POST /attendance-service/absences

🔄 사용자 플로우:
부재 신청 버튼 클릭 → 부재 유형 선택 → 긴급도 설정 → 날짜/시간 설정 → 사유 입력 → 신청
```

---

## 📋 결재관리 (/approval)

### 📱 화면 구성

#### 1. 결재 목록 페이지

```
🎯 사용자 목표: 휴가/부재/증명서 신청 및 결재 처리

🖼️ 화면 구성:
- 탭 메뉴 (휴가, 부재, 증명서)
- 필터 옵션 (항목, 결재상태, 긴급도, 날짜범위, 검색어)
- 결재 목록 테이블
- 신청/승인/반려 버튼 (권한별)
- 페이징

📊 데이터 구조:
- 휴가: vacationType, startDate, endDate, reason, status
- 부재: type, urgency, startDate, endDate, reason, status
- 증명서: type, requestDate, purpose, status

🔄 사용자 플로우:
탭 선택 → 필터 설정 → 목록 확인 → 신청/결재 처리
```

#### 2. 증명서 신청 모달

```
🎯 사용자 목표: 재직증명서/경력증명서 신청

🖼️ 화면 구성:
- 증명서 구분 선택 (재직증명서, 경력증명서)
- 발급일자 (자동 설정)
- 용도 입력
- 신청 버튼

📊 데이터 구조:
- 입력: type, requestDate, purpose
- API: POST /approval-service/certificates

🔄 사용자 플로우:
증명서 신청 버튼 클릭 → 증명서 유형 선택 → 용도 입력 → 신청
```

#### 3. 반려 사유 입력 모달

```
🎯 사용자 목표: 결재 반려 시 사유 입력

🖼️ 화면 구성:
- 반려 사유 입력 필드
- 확인/취소 버튼

📊 데이터 구조:
- 입력: comment
- API: POST /approval-service/{type}/reject

🔄 사용자 플로우:
반려 버튼 클릭 → 사유 입력 → 확인
```

---

## 💬 메시지 시스템 (/message)

### 📱 화면 구성

#### 1. 메시지 목록 페이지

```
🎯 사용자 목표: 쪽지 송수신 및 관리

🖼️ 화면 구성:
- 사이드바 (받은쪽지함, 보낸쪽지함)
- 검색 필터 (기간, 검색유형, 검색어)
- 메시지 목록 테이블
- 쪽지 쓰기 버튼
- 삭제 버튼

📊 데이터 구조:
- 받은 쪽지: senderName, subject, sentAt, isRead, isNotice
- 보낸 쪽지: receiverName, subject, sentAt, isRead

🔄 사용자 플로우:
탭 선택 → 검색/필터 → 목록 확인 → 쪽지 읽기/쓰기
```

#### 2. 쪽지 쓰기 모달

```
🎯 사용자 목표: 새로운 쪽지 작성 및 전송

🖼️ 화면 구성:
- 받는사람 검색/선택
- 공지사항 체크박스 (권한별)
- 제목 입력
- 내용 에디터 (Toast UI Editor)
- 첨부파일 업로드
- 전송/취소 버튼

📊 데이터 구조:
- 입력: receiverId, subject, content, isNotice, attachments
- API: POST /message-service/messages

🔄 사용자 플로우:
쪽지 쓰기 버튼 클릭 → 받는사람 선택 → 제목/내용 입력 → 첨부파일 추가 → 전송
```

#### 3. 쪽지 읽기 모달

```
🎯 사용자 목표: 받은 쪽지 읽기 및 답장

🖼️ 화면 구성:
- 보낸사람 정보
- 받은일시
- 제목
- 내용 (HTML 렌더링)
- 첨부파일 다운로드
- 답장/닫기 버튼

📊 데이터 구조:
- 출력: senderName, subject, content, sentAt, attachments

🔄 사용자 플로우:
쪽지 클릭 → 내용 확인 → 첨부파일 다운로드 → 답장/닫기
```

---

## 👥 조직도 (/organizationChart)

### 📱 화면 구성

#### 1. 조직도 메인 페이지

```
🎯 사용자 목표: 조직 구조 확인 및 팀원 정보 조회

🖼️ 화면 구성:
- 탭 메뉴 (부서, 전체 팀 멤버)
- 검색 필터 (이름, 직책, 부서)
- 필터/정렬 드롭다운
- 부서/멤버 카드 그리드
- 부서 추가 버튼 (HR만)

📊 데이터 구조:
- 부서: name, departmentColor, count, image
- 멤버: userName, positionName, departmentName, employeeNo

🔄 사용자 플로우:
탭 선택 → 검색/필터 → 부서/멤버 클릭 → 상세 정보 확인
```

#### 2. 부서 상세 페이지

```
🎯 사용자 목표: 특정 부서의 팀원 목록 확인

🖼️ 화면 구성:
- 뒤로가기 버튼
- 부서명 표시
- 부서 수정/삭제 버튼 (HR만)
- 팀원 카드 그리드
- 무한 스크롤

📊 데이터 구조:
- 부서 정보: name, departmentColor, departmentId
- 팀원 목록: Array<Member>

🔄 사용자 플로우:
부서 클릭 → 팀원 목록 확인 → 팀원 클릭 → 상세 정보
```

#### 3. 멤버 상세 모달

```
🎯 사용자 목표: 개별 팀원 상세 정보 확인

🖼️ 화면 구성:
- 프로필 이미지
- 기본 정보 (이름, 직책, 부서, 사번)
- 연락처 정보
- 쪽지 보내기 버튼
- 닫기 버튼

📊 데이터 구조:
- 멤버 정보: userName, positionName, departmentName, employeeNo, email, phone

🔄 사용자 플로우:
멤버 카드 클릭 → 상세 정보 확인 → 쪽지 보내기
```

---

## 💰 급여관리 (/payroll)

### 📱 화면 구성

#### 1. 급여 조회 페이지

```
🎯 사용자 목표: 개인 급여 정보 조회

🖼️ 화면 구성:
- 급여 조회 기간 선택
- 급여 명세서 테이블
- 급여 통계 차트
- 다운로드 버튼

📊 데이터 구조:
- 급여 정보: baseSalary, allowances, deductions, netSalary
- API: GET /payroll-service/salary/{period}

🔄 사용자 플로우:
기간 선택 → 급여 정보 조회 → 명세서 확인 → 다운로드
```

---

## 👤 인사관리 (/employee) - HR 전용

### 📱 화면 구성

#### 1. 직원 관리 페이지

```
🎯 사용자 목표: 전체 직원 정보 관리

🖼️ 화면 구성:
- 직원 목록 테이블
- 검색/필터 기능
- 직원 추가/수정/삭제 버튼
- 페이징

📊 데이터 구조:
- 직원 정보: employeeNo, userName, positionName, departmentName, email, phone
- API: GET/POST/PUT/DELETE /hr-service/employees

🔄 사용자 플로우:
직원 목록 확인 → 검색/필터 → 직원 정보 관리
```

---

## 📅 일정관리 (/schedule)

### 📱 화면 구성

#### 1. 일정 관리 페이지

```
🎯 사용자 목표: 개인/팀 일정 관리

🖼️ 화면 구성:
- 캘린더 뷰
- 일정 추가/수정/삭제 버튼
- 일정 상세 모달
- 팀 일정 필터

📊 데이터 구조:
- 일정 정보: title, description, startDate, endDate, type
- API: GET/POST/PUT/DELETE /schedule-service/schedules

🔄 사용자 플로우:
캘린더 확인 → 일정 추가 → 상세 정보 입력 → 저장
```

---

## 🔧 공통 기능

### 1. 헤더 컴포넌트

```
🎯 사용자 목표: 네비게이션 및 사용자 정보 표시

🖼️ 화면 구성:
- 로고
- 네비게이션 메뉴
- 사용자 정보 드롭다운
- 로그아웃 버튼
- 알림 아이콘

📊 데이터 구조:
- 사용자 정보: userName, departmentName, hrRole
- 알림 정보: Array<Notification>

🔄 사용자 플로우:
메뉴 선택 → 페이지 이동 → 사용자 정보 확인 → 로그아웃
```

### 2. 챗봇 컴포넌트

```
🎯 사용자 목표: 업무 도움말 및 문의

🖼️ 화면 구성:
- 챗봇 아이콘
- 채팅 인터페이스
- 메시지 입력창
- 전송 버튼

📊 데이터 구조:
- 입력: message
- 출력: response
- API: POST /chatbot-service/chat

🔄 사용자 플로우:
챗봇 클릭 → 질문 입력 → 답변 확인
```

### 3. 알림 시스템

```
🎯 사용자 목표: 실시간 알림 수신

🖼️ 화면 구성:
- 알림 아이콘
- 알림 목록 드롭다운
- 알림 읽음 처리

📊 데이터 구조:
- 알림 정보: type, message, timestamp, isRead
- API: GET /notification-service/notifications

🔄 사용자 플로우:
알림 수신 → 알림 확인 → 읽음 처리
```

---

## 🔐 권한 체계

### 일반 직원 (hrRole: 'N')

```
✅ 허용 기능:
- 개인 근태 기록 (출근/퇴근/외출/복귀)
- 휴가/부재 신청
- 증명서 신청
- 개인 급여 조회
- 메시지 송수신
- 조직도 조회
- 개인 일정 관리
- 챗봇 이용

❌ 제한 기능:
- 결재 승인/반려
- 직원 정보 관리
- 급여 관리
- 부서 관리
```

### HR 관리자 (hrRole: 'Y')

```
✅ 허용 기능:
- 모든 일반 직원 기능
- 휴가/부재/증명서 결재 승인/반려
- 직원 정보 관리 (추가/수정/삭제)
- 급여 관리
- 부서 관리 (추가/수정/삭제)
- 공지사항 작성

🔄 추가 권한:
- 시스템 관리 기능
- 통계 및 리포트 조회
```

---

## 📱 반응형 디자인

### 데스크톱 (1200px+)

```
- 전체 사이드바 표시
- 카드 그리드 4-5열 배치
- 상세 정보 모달 사용
- 호버 효과 활성화
```

### 태블릿 (768px-1199px)

```
- 축소된 사이드바
- 카드 그리드 2-3열 배치
- 터치 친화적 버튼 크기
```

### 모바일 (320px-767px)

```
- 햄버거 메뉴
- 카드 그리드 1열 배치
- 터치 최적화된 인터페이스
- 스와이프 제스처 지원
```

---

## 🎨 UI/UX 특징

### 1. 디자인 시스템

```
- 색상: #48b96c (메인), #388e3c (강조), #eafaf1 (배경)
- 폰트: 시스템 폰트 스택
- 아이콘: Material Icons
- 애니메이션: CSS transitions
```

### 2. 사용자 경험

```
- 직관적인 네비게이션
- 실시간 피드백
- 로딩 상태 표시
- 에러 처리 및 복구
- 접근성 고려
```

### 3. 성능 최적화

```
- 코드 스플리팅
- 이미지 최적화
- 캐싱 전략
- 지연 로딩
```

---

## 🔄 데이터 플로우

### 1. 인증 플로우

```
로그인 → JWT 토큰 발급 → 세션 저장 → API 요청 시 토큰 첨부
```

### 2. 근태 기록 플로우

```
출근 버튼 클릭 → API 요청 → 서버 처리 → 응답 수신 → UI 업데이트
```

### 3. 결재 플로우

```
신청 → 결재자 지정 → 승인/반려 → 결과 통보 → 상태 업데이트
```

### 4. 메시지 플로우

```
쪽지 작성 → 수신자 선택 → 전송 → 알림 발송 → 수신 확인
```

---

## 🛠️ 기술 스택

### Frontend

```
- React 18
- Vite
- React Router v6
- SCSS Modules
- Axios
- Context API
```

### 주요 라이브러리

```
- @toast-ui/react-editor (에디터)
- react-color (색상 선택)
- react-window (가상화)
- react-infinite-scroll-component (무한 스크롤)
```

### 개발 도구

```
- ESLint
- Prettier
- Git
- npm
```

---

## 📊 API 구조

### 인증 서비스

```
POST /auth-service/auth/login
POST /auth-service/auth/signup
POST /auth-service/auth/password-reset
```

### 근태 서비스

```
GET /attendance-service/today
POST /attendance-service/check-in
POST /attendance-service/check-out
GET /attendance-service/monthly
POST /attendance-service/absences
```

### 결재 서비스

```
GET /approval-service/vacations
POST /approval-service/vacations
POST /approval-service/certificates
POST /approval-service/absences
```

### 메시지 서비스

```
GET /message-service/received
GET /message-service/sent
POST /message-service/messages
DELETE /message-service/messages/{id}
```

### HR 서비스

```
GET /hr-service/user/list
GET /hr-service/departments
POST /hr-service/departments
PUT /hr-service/departments/{id}
DELETE /hr-service/departments/{id}
```

---

## 🎯 성공 지표

### 사용자 경험

```
- 로그인 성공률: 95%+
- 페이지 로딩 시간: 2초 이내
- 사용자 만족도: 4.5/5.0
```

### 시스템 성능

```
- API 응답 시간: 1초 이내
- 시스템 가용성: 99.9%
- 동시 사용자: 1000명+
```

### 비즈니스 목표

```
- 근태 기록 정확성: 99%+
- 결재 처리 시간: 24시간 이내
- 사용자 채택률: 90%+
```

---

이 스토리보드는 실제 프로젝트 코드 분석을 바탕으로 작성되었으며, 모든 기능과 사용자 시나리오를 포함합니다. 개발팀, 디자인팀, 기획팀이 모두 동일한 이해를 바탕으로 협업할 수 있도록 구성되었습니다.
