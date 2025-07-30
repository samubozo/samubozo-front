import React, { useEffect, useState, useRef } from 'react';
import styles from './EmployeeDetail.module.scss'; // styles import
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR, CERTIFICATE } from '../../configs/host-config';
// certificateEnums.js import 제거
import AuthContext from '../../context/UserContext';
import { approvalService } from '../../services/approvalService';
import { getKoreaToday } from '../../utils/dateUtils';
import RejectModal from '../approval/RejectModal';
import SuccessModal from '../../components/SuccessModal';

const EmployeeDetail = ({ selectedEmployee, onRetireSuccess }) => {
  const [dept, setDept] = useState(''); // departmentId
  const [deptName, setDeptName] = useState('');
  const [position, setPosition] = useState(''); // positionId
  const [positionName, setPositionName] = useState('');
  const [residentRegNo, setResidentRegNo] = useState('');
  const [residentRegNoError, setResidentRegNoError] = useState('');
  // 주민등록번호 입력 핸들러: 하이픈 포함하여 저장, 6자리 뒤에 자동으로 '-' 표시, 최대 14자리(하이픈 포함)
  const handleResidentRegNoChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 13) value = value.slice(0, 13);
    let formatted = value;
    if (formatted.length > 6) {
      formatted = formatted.slice(0, 6) + '-' + formatted.slice(6);
    }
    setResidentRegNo(formatted);
    setResidentRegNoError('');
  };
  // 주민등록번호 유효성 검사 함수
  const isValidResidentRegNo = (value) => {
    // 6자리-7자리, 총 14글자, 하이픈 포함
    return /^\d{6}-\d{7}$/.test(value);
  };
  const [status, setStatus] = useState('재직');
  const [role, setRole] = useState('N'); // hrRole: 'Y' or 'N'
  const [joinDate, setJoinDate] = useState('');
  const [leaveDate, setLeaveDate] = useState('');
  const [memo, setMemo] = useState('');
  const [gender, setGender] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');
  const [employeePhoneError, setEmployeePhoneError] = useState('');
  // 연락처 입력 핸들러: 3-4-4 형태로 하이픈 포함하여 저장, 최대 13자리(하이픈 포함)
  const handleEmployeePhoneChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    let formatted = value;
    if (formatted.length > 7) {
      formatted =
        formatted.slice(0, 3) +
        '-' +
        formatted.slice(3, 7) +
        '-' +
        formatted.slice(7);
    } else if (formatted.length > 3) {
      formatted = formatted.slice(0, 3) + '-' + formatted.slice(3);
    }
    setEmployeePhone(formatted);
    setEmployeePhoneError('');
  };
  // 화면에 표시할 연락처: employeePhone 그대로 사용
  const displayEmployeePhone = employeePhone;

  // 연락처 유효성 검사 함수 (하이픈 필수, 010-1234-5678 등)
  const isValidPhone = (value) => {
    // 010-1234-5678, 011-123-4567 등 3-3~4-4
    return /^01[016789]-\d{3,4}-\d{4}$/.test(value);
  };
  const [employeeOutEmail, setEmployeeOutEmail] = useState('');
  const [employeeOutEmailError, setEmployeeOutEmailError] = useState('');
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
  const [showSuccessModal, setShowSuccessModal] = useState(false); // 성공 메시지 모달
  const [successMessage, setSuccessMessage] = useState(''); // 성공 메시지 내용

  const handleAccountNumberChange = (e) => {
    let value = e.target.value;
    if (value.length > 16) value = value.slice(0, 16);
    setAccountNumber(value);
  };
  const [accountHolder, setAccountHolder] = useState('');
  const { user } = React.useContext(AuthContext);
  const isHR = user?.hrRole === 'Y';

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
        setStatus(data.activate || 'Y');
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
    const t = (type || '').trim().toUpperCase();
    if (t === 'EMPLOYMENT') return '재직증명서';
    if (t === 'CAREER') return '경력증명서';
    return type;
  };
  const statusToKor = (status) => {
    const s = (status || '').trim().toUpperCase();
    if (s === 'REQUESTED' || s === 'PENDING') return '대기';
    if (s === 'APPROVED') return '승인';
    if (s === 'REJECTED') return '반려';
    return status;
  };

  // === 증명서 내역 상태 ===
  const [certList, setCertList] = useState([]);
  const [certType, setCertType] = useState('EMPLOYMENT');
  const [certDate, setCertDate] = useState(getKoreaToday());
  const [certApproveDate, setCertApproveDate] = useState('');
  const [certStatus, setCertStatus] = useState('REQUESTED');
  const [certPurpose, setCertPurpose] = useState('');

  const [certId, setCertId] = useState(''); // 추가: 폼에 표시할 발급번호 상태
  const [selectedCertIds, setSelectedCertIds] = useState([]); // 체크된 증명서 ID 목록

  // 반려 모달 상태
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  // 증명서 내역 불러오기 (GET /list 또는 /list/all)
  useEffect(() => {
    const loadCertList = () => {
      if (isHR && selectedEmployee?.id) {
        // 관리자이면서 특정 직원 선택 시: 해당 직원의 증명서 내역만 조회
        axiosInstance
          .get(`${API_BASE_URL}${CERTIFICATE}/list/all`, {
            params: { employeeNo: selectedEmployee.id },
          })
          .then((res) => {
            setCertList(res.data.result?.content || res.data.result || []);
          })
          .catch(() => setCertList([]));
      } else if (isHR) {
        // 관리자이지만 직원 선택 안 한 경우: 전체 내역 조회(기존 유지)
        approvalService
          .getAllCertificates()
          .then((res) => {
            setCertList(res.result?.content || res.result || []);
          })
          .catch(() => setCertList([]));
      } else if (selectedEmployee?.id) {
        // 일반 사용자가 특정 직원을 선택한 경우: 해당 직원의 증명서 내역 조회
        axiosInstance
          .get(`${API_BASE_URL}${CERTIFICATE}/my-list`, {
            params: { employeeNo: selectedEmployee.id },
          })
          .then((res) => {
            setCertList(res.data.result?.content || res.data.result || []);
          })
          .catch(() => setCertList([]));
      } else {
        // 일반 사용자가 인사관리 페이지에 들어온 경우: 자신의 증명서 내역 조회
        approvalService
          .getMyCertificates()
          .then((res) => {
            setCertList(res.result?.content || res.result || []);
          })
          .catch(() => setCertList([]));
      }
    };

    // 초기 로드
    loadCertList();

    // 5초마다 자동 새로고침 (실시간 업데이트)
    const interval = setInterval(loadCertList, 5000);

    return () => clearInterval(interval);
  }, [isHR, selectedEmployee]);

  // 증명서 신청 (POST /application)
  const handleSubmitCertificate = async () => {
    if (!selectedEmployee?.id) return;

    // 중복 신청 검사 - 같은 타입의 증명서가 대기/승인 상태인지 확인 (반려는 재신청 가능)
    const isDuplicate = certList.some((row) => {
      const rowType = (row.type || '').trim().toUpperCase();
      const rowStatus = (row.status || '').trim().toUpperCase();
      const currentType = (certType || '').trim().toUpperCase();

      // 같은 타입이고 대기/승인 상태인 경우만 중복으로 처리 (반려는 제외)
      return (
        rowType === currentType &&
        ['REQUESTED', 'PENDING', 'APPROVED'].includes(rowStatus)
      );
    });

    if (isDuplicate) {
      alert(
        `${certType === 'EMPLOYMENT' ? '재직증명서' : '경력증명서'}가 이미 신청되어 있습니다.`,
      );
      return;
    }

    try {
      await axiosInstance.post(`${API_BASE_URL}${CERTIFICATE}/application`, {
        employeeNo: selectedEmployee.id,
        requestDate: certDate,
        type: certType,
        purpose: certPurpose,
        approveDate: certApproveDate,
        approverId: 1, // 기본 HR 담당자 ID (실제로는 동적으로 설정해야 함)
      });

      // 성공 메시지 표시
      setSuccessMessage('증명서 신청이 완료되었습니다.');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);

      // 신청 후 목록 갱신
      const res = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/list/${selectedEmployee.id}`,
      );
      setCertList(res.data.result?.content || []);
      setCertType('EMPLOYMENT');
      setCertDate(getKoreaToday());
      setCertPurpose('');
      setCertApproveDate('');
    } catch (e) {
      setSuccessMessage('증명서 신청 실패');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
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
      const res = await axiosInstance.post(
        `${API_BASE_URL}${HR}/user/profile`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      setSuccessMessage('프로필 이미지가 업로드되었습니다.');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
      // 본인 프로필을 수정한 경우에만 sessionStorage 갱신 및 새로고침
      if (
        user?.employeeNo &&
        String(user.employeeNo) === String(selectedEmployee.id)
      ) {
        // 서버 응답에서 최신 프로필 이미지 URL을 받아서 저장 (예시: res.data.result.profileImage)
        const newProfileImage = res.data?.result?.profileImage || profileImage;
        sessionStorage.setItem('USER_PROFILE_IMAGE', newProfileImage);
        window.location.reload();
      }
    } catch {
      setSuccessMessage('프로필 이미지 업로드 실패');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
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
      formData.append('activate', status); // status는 'Y' 또는 'N'이어야 함
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
      setSuccessMessage('저장되었습니다.');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
      // 본인 프로필을 수정한 경우에만 sessionStorage 갱신 및 새로고침
      if (
        user?.employeeNo &&
        String(user.employeeNo) === String(selectedEmployee.id)
      ) {
        // 저장 후 상세정보를 즉시 다시 불러오기
        try {
          const res = await axiosInstance.get(
            `${API_BASE_URL}${HR}/user/${selectedEmployee.id}`,
          );
          const data = res.data.result;
          const newProfileImage = data.profileImage || profileImage;
          sessionStorage.setItem('USER_PROFILE_IMAGE', newProfileImage);
          window.location.reload();
        } catch (err) {
          setSuccessMessage(
            '저장 후 상세정보를 불러오지 못했습니다. 새로고침 해주세요.',
          );
          setShowSuccessModal(true);
          setTimeout(() => setShowSuccessModal(false), 2000);
        }
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

  // === [수정] 테이블 행 클릭 시 폼에만 데이터 연동, 행은 항상 읽기 전용 ===
  // 1. Remove handleRowToForm logic from row onClick
  // 2. Remove handleRowToForm function definition

  // === [수정] 폼 제출 ===
  const handleFormSubmit = async () => {
    if (!selectedEmployee?.id) return;
    // 신규 신청만 가능
    await handleSubmitCertificate();
    setCertId(''); // 추가: 신규 신청 후 발급번호 초기화
  };

  // axiosInstance를 활용한 PDF 인쇄 함수 예시
  const printPdfFromServer = async (certificateId) => {
    try {
      console.log('=== PDF 인쇄 시작 ===');
      console.log('증명서 ID:', certificateId);
      console.log('현재 사용자:', user);
      console.log('HR 권한:', user?.hrRole);

      // 올바른 엔드포인트로 수정
      const res = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/my-print/${certificateId}`,
        { responseType: 'arraybuffer' },
      );

      console.log('PDF 응답 상태:', res.status);
      console.log('PDF 응답 헤더:', res.headers);
      console.log('PDF 데이터 크기:', res.data.byteLength);
      console.log('Content-Type:', res.headers['content-type']);

      // PDF 시그니처 확인
      const pdfSignature = new Uint8Array(res.data.slice(0, 4));
      console.log(
        'PDF 시그니처:',
        Array.from(pdfSignature)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' '),
      );
      const isValidPdfSignature =
        pdfSignature[0] === 0x25 &&
        pdfSignature[1] === 0x50 &&
        pdfSignature[2] === 0x44 &&
        pdfSignature[3] === 0x46;
      console.log('올바른 PDF 시그니처:', isValidPdfSignature);

      const contentType = res.headers['content-type'] || 'application/pdf';
      const blob = new Blob([res.data], { type: contentType });
      const fileURL = URL.createObjectURL(blob);

      console.log('Blob 크기:', blob.size);
      console.log('Blob 타입:', blob.type);
      console.log('파일 URL:', fileURL);

      // Blob이 비어있는지 확인
      if (blob.size === 0) {
        console.error('Blob이 비어있습니다!');
        alert(
          'PDF 데이터가 비어있습니다. 백엔드에서 PDF 생성에 실패했을 수 있습니다.',
        );
        return;
      }

      // PDF 데이터를 콘솔에 출력하여 확인
      console.log(
        'PDF 데이터 첫 100바이트:',
        new Uint8Array(res.data.slice(0, 100)),
      );

      // PDF 데이터가 실제로 PDF인지 확인
      const pdfHeader = new TextDecoder().decode(res.data.slice(0, 20));
      console.log('PDF 헤더:', pdfHeader);

      // PDF 크기가 너무 작으면 문제
      if (res.data.byteLength < 1000) {
        console.error('PDF 크기가 너무 작습니다:', res.data.byteLength);
        alert(
          'PDF 크기가 너무 작습니다. 백엔드에서 PDF 생성에 실패했을 수 있습니다.',
        );
        return;
      }

      // PDF 시그니처 재확인
      if (!isValidPdfSignature) {
        console.error(
          '올바른 PDF 시그니처가 아닙니다:',
          Array.from(pdfSignature)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join(' '),
        );
        alert(
          '올바른 PDF 형식이 아닙니다. 백엔드에서 PDF 생성에 실패했을 수 있습니다.',
        );
        return;
      }

      // 기존 iframe 제거
      const existingIframe = document.getElementById('pdf-iframe');
      if (existingIframe) {
        document.body.removeChild(existingIframe);
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'pdf-iframe';
      iframe.style.position = 'fixed';
      iframe.style.top = '50%';
      iframe.style.left = '50%';
      iframe.style.transform = 'translate(-50%, -50%)';
      iframe.style.width = '80%';
      iframe.style.height = '80%';
      iframe.style.zIndex = '9999';
      iframe.style.border = '2px solid #ccc';
      iframe.style.backgroundColor = 'white';
      iframe.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
      iframe.src = fileURL;
      document.body.appendChild(iframe);

      console.log('iframe 생성 완료');

      iframe.onload = () => {
        console.log('iframe 로드 완료');

        // PDF가 제대로 로드되었는지 확인
        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow.document;
          console.log('iframe 문서:', iframeDoc);

          // 3초 후에 인쇄 실행 (PDF 로딩 시간 확보)
          setTimeout(() => {
            try {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
              console.log('인쇄 다이얼로그 열림');

              // 인쇄 다이얼로그가 닫힌 후 iframe 제거
              setTimeout(() => {
                if (document.getElementById('pdf-iframe')) {
                  document.body.removeChild(iframe);
                  URL.revokeObjectURL(fileURL);
                }
              }, 2000);
            } catch (printError) {
              console.error('인쇄 오류:', printError);
              alert('인쇄 중 오류가 발생했습니다.');
              if (document.getElementById('pdf-iframe')) {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(fileURL);
              }
            }
          }, 3000); // 로딩 시간을 3초로 증가
        } catch (error) {
          console.error('iframe 문서 접근 오류:', error);
          // iframe 실패 시 새 창으로 시도
          console.log('iframe 실패, 새 창으로 시도');
          const newWindow = window.open(fileURL, '_blank');
          if (newWindow) {
            setTimeout(() => {
              newWindow.print();
            }, 2000);
          }

          if (document.getElementById('pdf-iframe')) {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(fileURL);
          }
        }
      };

      console.log('=== PDF 인쇄 완료 ===');
    } catch (err) {
      console.error('=== PDF 인쇄 오류 ===');
      console.error('오류 타입:', err.constructor.name);
      console.error('오류 메시지:', err.message);
      console.error('오류 응답:', err.response);

      if (err.response) {
        console.error('응답 상태:', err.response.status);
        console.error('응답 헤더:', err.response.headers);
        console.error('응답 데이터:', err.response.data);
      }

      alert('PDF 인쇄 중 오류 발생: ' + err.message);
    }
  };

  const handleCertCheckbox = (id) => {
    setSelectedCertIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const handlePrintSelected = () => {
    console.log('선택된 증명서 ID들:', selectedCertIds);
    console.log('전체 증명서 목록:', certList);

    const approvedIds = certList
      .filter((row) => {
        const certificateId = row.certificateId || row.id;
        const isSelected = selectedCertIds.includes(certificateId);
        const isApproved = row.status === 'APPROVED' || row.status === '승인';

        console.log('증명서 필터링:', {
          certificateId: certificateId,
          originalId: row.id,
          certificateIdField: row.certificateId,
          status: row.status,
          isSelected,
          isApproved,
        });

        return isSelected && isApproved;
      })
      .map((row) => {
        const certificateId = row.certificateId || row.id;
        console.log(`인쇄할 증명서 ID: ${certificateId} (원본: ${row.id})`);
        return certificateId;
      });

    console.log('승인된 증명서 ID들:', approvedIds);

    if (approvedIds.length === 0) {
      alert('승인된 증명서만 인쇄할 수 있습니다.');
      return;
    }

    // 각 ID에 대해 개별적으로 인쇄 시도
    approvedIds.forEach((id) => {
      console.log(`증명서 인쇄 시도: ID = ${id}`);
      printPdfFromServer(id);
    });
  };

  // 직원 퇴사자 등록
  const [showRetireConfirm, setShowRetireConfirm] = useState(false);

  // 퇴사자 등록 실제 실행
  const doRetire = async () => {
    if (!selectedEmployee?.id) return;
    try {
      await axiosInstance.patch(
        `${API_BASE_URL}${HR}/users/retire/${selectedEmployee.id}`,
      );
      setSuccessMessage('퇴사자 등록이 완료되었습니다.');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
      // 상세정보 새로고침
      const res = await axiosInstance.get(
        `${API_BASE_URL}${HR}/user/${selectedEmployee.id}`,
      );
      const data = res.data.result;
      setStatus(data.activate || 'N');
      if (onRetireSuccess) onRetireSuccess(selectedEmployee.id);
    } catch (e) {
      setSuccessMessage('퇴사자 등록 실패');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    }
  };

  // 퇴사자 등록 버튼 클릭 시
  const handleRetire = () => {
    setShowRetireConfirm(true);
  };

  const isRetired = status === 'N'; // activate === 'N'이면 true

  // 승인/반려 버튼 클릭 후 목록 갱신 부분을 아래와 같이 수정
  const refreshCertList = async () => {
    if (selectedEmployee?.id) {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/list/all`,
        { params: { employeeNo: selectedEmployee.id } },
      );
      setCertList(res.data.result?.content || res.data.result || []);
    }
  };

  // 증명서 단건 조회 함수 수정 (approvalService 사용)
  const getCertificateById = async (certificateId) => {
    const res = await approvalService.getCertificateById(certificateId);
    return res.result;
  };

  // 증명서 반려 핸들러
  const handleCertReject = (certificateId) => {
    setRejectTargetId(certificateId);
    setShowRejectModal(true);
  };

  // 반려 확인 핸들러
  const handleRejectConfirm = async (comment) => {
    setRejectLoading(true);
    try {
      // rejectTargetId가 배열인 경우 (다중 선택)
      const targetIds = Array.isArray(rejectTargetId)
        ? rejectTargetId
        : [rejectTargetId];

      // 선택된 증명서들 중 처리 가능한 항목만 필터링
      const selectedCerts = certList.filter((row) =>
        targetIds.includes(row.certificateId || row.id),
      );

      // 대기 상태인 증명서만 필터링
      const pendingCerts = selectedCerts.filter(
        (cert) =>
          cert.status === 'REQUESTED' ||
          cert.status === 'PENDING' ||
          cert.status === '대기',
      );

      if (pendingCerts.length === 0) {
        // 처리 가능한 항목이 없으면 조용히 종료
        setShowRejectModal(false);
        setRejectTargetId(null);
        setRejectLoading(false);
        return;
      }

      // 반려 처리
      let processedCount = 0;
      for (const cert of pendingCerts) {
        try {
          await approvalService.rejectCertificate(
            cert.certificateId || cert.id,
            comment,
          );
          // 단건 조회 후 certList 갱신
          const updated = await getCertificateById(
            cert.certificateId || cert.id,
          );
          setCertList((prev) =>
            prev.map((row) =>
              (row.certificateId || row.id) === (cert.certificateId || cert.id)
                ? updated
                : row,
            ),
          );
          processedCount++;
        } catch (e) {
          console.error(
            `증명서 ${cert.certificateId || cert.id} 반려 실패:`,
            e,
          );
        }
      }

      setShowRejectModal(false);
      setRejectTargetId(null);
      setSelectedCertIds([]);
      if (processedCount > 0) {
        setSuccessMessage(`${processedCount}개 증명서가 반려되었습니다.`);
        setShowSuccessModal(true);
        // 반려 후 목록 자동 새로고침
        refreshCertList();
      }
    } catch (err) {
      alert('반려 처리 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setRejectLoading(false);
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
                      onChange={handleResidentRegNoChange}
                      maxLength={14} // 6자리+하이픈+7자리 = 14
                      placeholder='예: 123456-1234567'
                      onBlur={() => {
                        if (
                          residentRegNo &&
                          !isValidResidentRegNo(residentRegNo)
                        ) {
                          setResidentRegNoError(
                            '주민등록번호 형식이 올바르지 않습니다. (예: 123456-1234567)',
                          );
                        } else {
                          setResidentRegNoError('');
                        }
                      }}
                    />
                    {residentRegNoError && (
                      <div style={{ color: 'red', fontSize: 13, marginTop: 4 }}>
                        {residentRegNoError}
                      </div>
                    )}
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
                      value={displayEmployeePhone}
                      onChange={handleEmployeePhoneChange}
                      maxLength={13} // 3자리+하이픈+4자리+하이픈+4자리 = 13
                      placeholder='예: 010-1234-5678'
                      onBlur={() => {
                        if (
                          displayEmployeePhone &&
                          !isValidPhone(displayEmployeePhone)
                        ) {
                          setEmployeePhoneError(
                            '연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)',
                          );
                        } else {
                          setEmployeePhoneError('');
                        }
                      }}
                    />
                    {employeePhoneError && (
                      <div style={{ color: 'red', fontSize: 13, marginTop: 4 }}>
                        {employeePhoneError}
                      </div>
                    )}
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
                      type='email'
                      value={employeeOutEmail}
                      onChange={(e) => {
                        setEmployeeOutEmail(e.target.value);
                        setEmployeeOutEmailError('');
                      }}
                      className={styles.emailInput}
                      placeholder='예: example@email.com'
                      onBlur={() => {
                        if (
                          employeeOutEmail &&
                          !/^([\w.-]+)@([\w-]+)\.(\w{2,})$/.test(
                            employeeOutEmail,
                          )
                        ) {
                          setEmployeeOutEmailError(
                            '이메일 형식이 올바르지 않습니다.',
                          );
                        } else {
                          setEmployeeOutEmailError('');
                        }
                      }}
                    />
                    {employeeOutEmailError && (
                      <div style={{ color: 'red', fontSize: 13, marginTop: 4 }}>
                        {employeeOutEmailError}
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className={styles.tableLabel}>지급계좌</td>
                  <td colSpan={3}>
                    <div className={styles.accountRow}>
                      <input
                        type='text'
                        placeholder='은행명'
                        maxLength={6}
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                      <input
                        type='text'
                        value={accountNumber}
                        onChange={handleAccountNumberChange}
                        maxLength={16}
                        placeholder='계좌번호'
                      />
                      <span className={styles.accName}>예금주</span>
                      <input
                        type='text'
                        placeholder='예금주'
                        maxLength={6}
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
          <div
            className={styles.certListTitle}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>증명서발급내역</span>
            {/* 증명서 신청 내역 상단에서 선택 인쇄 버튼 제거 */}
          </div>
          <div
            style={{
              maxHeight: '300px',
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
                  <col style={{ width: '90px' }} />
                  <col style={{ width: '160px' }} />
                  <col style={{ width: '140px' }} />
                  <col style={{ width: '140px' }} />
                  <col style={{ width: '160px' }} />
                  <col style={{ width: '210px' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>
                      <input
                        type='checkbox'
                        checked={
                          certList.length > 0 &&
                          selectedCertIds.length === certList.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCertIds(
                              certList.map(
                                (row) => row.certificateId || row.id,
                              ),
                            );
                          } else {
                            setSelectedCertIds([]);
                          }
                        }}
                      />
                    </th>
                    <th>발급번호</th>
                    <th>증명서구분</th>
                    <th>발급일자</th>
                    <th>승인일자</th>
                    <th>전자결재상태</th>
                    <th>용도</th>
                  </tr>
                </thead>
                <tbody>
                  {certList.length > 0 ? (
                    certList.map((row) => (
                      <tr key={row.certificateId || row.id}>
                        <td>
                          <input
                            type='checkbox'
                            checked={selectedCertIds.includes(
                              row.certificateId || row.id,
                            )}
                            onChange={() =>
                              handleCertCheckbox(row.certificateId || row.id)
                            }
                          />
                        </td>
                        <td>{row.certificateId || row.id}</td>
                        <td>{typeToKor(row.type)}</td>
                        <td>{row.requestDate}</td>
                        <td>{row.approveDate}</td>
                        <td>{statusToKor(row.status)}</td>
                        <td>{row.purpose}</td>
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
          {/* 테이블 하단 승인/반려 버튼 */}
          {isHR && (
            <div className={styles.certFormBtnRow} style={{ marginTop: 12 }}>
              <button
                className={styles.approvalBtn}
                disabled={selectedCertIds.length === 0}
                onClick={async () => {
                  try {
                    // 선택된 증명서들 중 처리 가능한 항목만 필터링
                    const selectedCerts = certList.filter((row) =>
                      selectedCertIds.includes(row.certificateId || row.id),
                    );

                    // 대기 상태인 증명서만 필터링
                    const pendingCerts = selectedCerts.filter(
                      (cert) =>
                        cert.status === 'REQUESTED' ||
                        cert.status === 'PENDING' ||
                        cert.status === '대기',
                    );

                    if (pendingCerts.length === 0) {
                      // 처리 가능한 항목이 없으면 조용히 종료
                      return;
                    }

                    // 승인 처리
                    let processedCount = 0;
                    for (const cert of pendingCerts) {
                      try {
                        await approvalService.approveCertificate(
                          cert.certificateId || cert.id,
                        );
                        // 단건 조회 후 certList 갱신
                        const updated = await getCertificateById(
                          cert.certificateId || cert.id,
                        );
                        setCertList((prev) =>
                          prev.map((row) =>
                            (row.certificateId || row.id) ===
                            (cert.certificateId || cert.id)
                              ? updated
                              : row,
                          ),
                        );
                        processedCount++;
                      } catch (e) {
                        console.error(
                          `증명서 ${cert.certificateId || cert.id} 승인 실패:`,
                          e,
                        );
                      }
                    }

                    setSelectedCertIds([]);
                    if (processedCount > 0) {
                      setSuccessMessage(
                        `${processedCount}개 증명서가 승인되었습니다.`,
                      );
                      setShowSuccessModal(true);
                      // 승인 후 목록 자동 새로고침
                      refreshCertList();
                    }
                  } catch (e) {
                    alert('승인 처리 중 오류가 발생했습니다.');
                  }
                }}
              >
                승인
              </button>
              <button
                className={styles.deleteBtn}
                style={{ marginLeft: 8 }}
                disabled={selectedCertIds.length === 0}
                onClick={() => {
                  if (selectedCertIds.length === 1) {
                    // 선택된 증명서가 대기 상태인지 확인
                    const selectedCert = certList.find((row) =>
                      selectedCertIds.includes(row.certificateId || row.id),
                    );

                    if (
                      selectedCert &&
                      (selectedCert.status === 'REQUESTED' ||
                        selectedCert.status === 'PENDING' ||
                        selectedCert.status === '대기')
                    ) {
                      handleCertReject(selectedCertIds);
                    }
                    // 이미 처리된 증명서면 조용히 무시
                  }
                }}
              >
                반려
              </button>
            </div>
          )}
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
                    disabled={status === 'N'}
                  >
                    <option value='Y'>재직</option>
                    <option value='N'>퇴직</option>
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
            <button
              className={styles.leave}
              onClick={handleRetire}
              disabled={isRetired}
              style={
                isRetired ? { background: '#ccc', cursor: 'not-allowed' } : {}
              }
            >
              {isRetired ? '퇴사처리 완료' : '퇴사자 등록'}
            </button>
            <div className={styles.rightBtns}>
              <button
                className={styles.save}
                onClick={handleSave}
                disabled={
                  loading ||
                  (!!residentRegNo && !!residentRegNoError) ||
                  (!!residentRegNo && !isValidResidentRegNo(residentRegNo)) ||
                  (!!employeeOutEmail && !!employeeOutEmailError) ||
                  (!!employeeOutEmail &&
                    !/^([\w.-]+)@([\w-]+)\.(\w{2,})$/.test(employeeOutEmail)) ||
                  (!!displayEmployeePhone && !!employeePhoneError) ||
                  (!!displayEmployeePhone &&
                    !isValidPhone(displayEmployeePhone))
                }
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 반려 사유 입력 모달 */}
      <RejectModal
        open={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectTargetId(null);
        }}
        onConfirm={handleRejectConfirm}
        loading={rejectLoading}
      />

      {/* 성공 모달 */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
          autoClose={true}
          autoCloseDelay={3000}
        />
      )}

      {/* 퇴사자 등록 확인 모달 */}
      {showRetireConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.successModal}>
            <div
              className={styles.successMessage}
              style={{ marginBottom: 24, fontWeight: 600, fontSize: '1.1rem' }}
            >
              정말 퇴사자로 등록하시겠습니까?
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button
                className={styles.successCloseBtn}
                style={{ minWidth: 80 }}
                onClick={() => {
                  setShowRetireConfirm(false);
                  doRetire();
                }}
              >
                확인
              </button>
              <button
                className={styles.successCloseBtn}
                style={{
                  minWidth: 80,
                  background: '#f3f3f3',
                  color: '#333',
                  border: '1px solid #bbb',
                }}
                onClick={() => setShowRetireConfirm(false)}
              >
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
