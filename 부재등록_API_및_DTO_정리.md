# 부재등록(Absence Registration) API 및 DTO 정리

---

## 1. 부재등록 관련 API 목록 (프론트 기준)

### 1) 부재 등록

- **POST** `/attendance/absence`
- **Request Body 예시**
  ```json
  {
    "type": "출장|연수|연차|반차|외출|기타", // 부재 유형 (한글 문자열)
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "time": "09:00", // (선택) 시간 정보
    "reason": "string" // 부재 사유
  }
  ```

### 2) 내 부재 목록 조회

- **GET** `/attendance/absence/my`
- **Response 예시**
  ```json
  [
    {
      "id": 1,
      "type": "출장",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "time": "09:00",
      "reason": "string"
    },
    ...
  ]
  ```

### 3) 단일 부재 상세 조회

- **GET** `/attendance/absence/{absenceId}`

### 4) 부재 수정

- **PUT** `/attendance/absence/{absenceId}`
- **Request Body 예시**
  ```json
  {
    "type": "출장|연수|연차|반차|외출|기타",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "time": "09:00",
    "reason": "string"
  }
  ```

### 5) 부재 삭제

- **DELETE** `/attendance/absence/{absenceId}`

---

## 2. 프론트에서 사용하는 DTO/데이터 구조

- **등록/수정 시**
  - type: 부재 유형 (출장, 연수, 연차, 반차, 외출, 기타)
  - startDate: 시작일 (YYYY-MM-DD)
  - endDate: 종료일 (YYYY-MM-DD)
  - time: 시간 (예: 09:00) (필요시)
  - reason: 사유

- **조회 시**
  - id: 부재 식별자
  - type, startDate, endDate, time, reason

---

## 3. 백엔드에서 구현해야 할 것

1. **Absence 엔티티/모델 및 DTO**
   - 필드: id, type, startDate, endDate, time, reason

2. **Controller**
   - POST `/attendance/absence` (등록)
   - GET `/attendance/absence/my` (내 부재내역 조회)
   - GET `/attendance/absence/{absenceId}` (상세)
   - PUT `/attendance/absence/{absenceId}` (수정)
   - DELETE `/attendance/absence/{absenceId}` (삭제)

3. **Service/Repository**
   - 위 API에 맞는 CRUD 로직

4. **응답 구조**
   - 등록/수정/삭제 성공 시: `{ success: true, ... }` 또는 등록된 absence 객체 반환
   - 목록 조회 시: absence 객체 배열 반환

---

## 4. 참고사항

- **type** 필드는 한글(출장, 연수, 연차, 반차, 외출, 기타)로 프론트에서 내려옴
- **userId**는 body에 포함하지 않음, 백엔드에서 SecurityContextHolder로 처리
- **time** 필드는 옵션(필요시만)
- **startDate, endDate**는 YYYY-MM-DD 포맷

---

### 예시 DTO (Java 기준)

```java
public class AbsenceRequestDto {
    private String type; // 출장, 연수, 연차, 반차, 외출, 기타
    private String startDate; // YYYY-MM-DD
    private String endDate;   // YYYY-MM-DD
    private String time;      // 09:00 (옵션)
    private String reason;
}
```
