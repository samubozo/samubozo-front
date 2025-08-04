import React, { useEffect, useState, useRef } from 'react';
import styles from './EmployeeDetail.module.scss';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, HR, CERTIFICATE } from '../../configs/host-config';
import AuthContext from '../../context/UserContext';
import { approvalService } from '../../services/approvalService';
import { getKoreaToday } from '../../utils/dateUtils';
import RejectModal from '../approval/RejectModal';
import SuccessModal from '../../components/SuccessModal';

const EmployeeDetail = ({ selectedEmployee, onRetireSuccess }) => {
  const [dept, setDept] = useState('');
  const [deptName, setDeptName] = useState('');
  const [position, setPosition] = useState('');
  const [positionName, setPositionName] = useState('');
  const [residentRegNo, setResidentRegNo] = useState('');
  const [residentRegNoError, setResidentRegNoError] = useState('');
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
  const isValidResidentRegNo = (value) => {
    return /^\d{6}-\d{7}$/.test(value);
  };
  const [status, setStatus] = useState('재직');
  const [role, setRole] = useState('N');
  const [joinDate, setJoinDate] = useState('');
  const [leaveDate, setLeaveDate] = useState('');
  const [memo, setMemo] = useState('');
  const [gender, setGender] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');
  const [employeePhoneError, setEmployeePhoneError] = useState('');
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
  const displayEmployeePhone = employeePhone;

  const isValidPhone = (value) => {
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAccountNumberChange = (e) => {
    let value = e.target.value;
    if (value.length > 16) value = value.slice(0, 16);
    setAccountNumber(value);
  };
  const [accountHolder, setAccountHolder] = useState('');
  const { user } = React.useContext(AuthContext);
  const isHR = user?.hrRole === 'Y';

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [deptRes, posRes] = await Promise.all([
          axiosInstance.get(`${API_BASE_URL}${HR}/departments`),
          axiosInstance.get(`${API_BASE_URL}${HR}/positions`),
        ]);
        setDepartments(deptRes.data.result || []);
        setPositions(posRes.data.result || []);
      } catch (e) {}
    };
    fetchMeta();
  }, []);

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

  const [certList, setCertList] = useState([]);
  const [certType, setCertType] = useState('EMPLOYMENT');
  const [certDate, setCertDate] = useState(getKoreaToday());
  const [certPurpose, setCertPurpose] = useState('');

  const [selectedCertIds, setSelectedCertIds] = useState([]);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    const loadCertList = () => {
      if (isHR && selectedEmployee?.id) {
        axiosInstance
          .get(`${API_BASE_URL}${CERTIFICATE}/list/all`, {
            params: { employeeNo: selectedEmployee.id },
          })
          .then((res) => {
            setCertList(res.data.result?.content || res.data.result || []);
          })
          .catch(() => setCertList([]));
      } else if (isHR) {
        approvalService
          .getAllCertificates()
          .then((res) => {
            setCertList(res.result?.content || res.result || []);
          })
          .catch(() => setCertList([]));
      } else if (selectedEmployee?.id) {
        axiosInstance
          .get(`${API_BASE_URL}${CERTIFICATE}/my-list`, {
            params: { employeeNo: selectedEmployee.id },
          })
          .then((res) => {
            setCertList(res.data.result?.content || res.data.result || []);
          })
          .catch(() => setCertList([]));
      } else {
        approvalService
          .getMyCertificates()
          .then((res) => {
            setCertList(res.result?.content || res.result || []);
          })
          .catch(() => setCertList([]));
      }
    };

    loadCertList();

    const interval = setInterval(loadCertList, 5000);

    return () => clearInterval(interval);
  }, [isHR, selectedEmployee]);

  const handleSubmitCertificate = async () => {
    if (!selectedEmployee?.id) return;

    const isDuplicate = certList.some((row) => {
      const rowType = (row.type || '').trim().toUpperCase();
      const rowStatus = (row.status || '').trim().toUpperCase();
      const currentType = (certType || '').trim().toUpperCase();

      return (
        rowType === currentType &&
        ['REQUESTED', 'PENDING', 'APPROVED'].includes(rowStatus)
      );
    });

    if (isDuplicate) {
      setSuccessMessage(
        `${certType === 'EMPLOYMENT' ? '재직증명서' : '경력증명서'}가 이미 신청되어 있습니다.`,
      );
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
      return;
    }

    try {
      await axiosInstance.post(`${API_BASE_URL}${CERTIFICATE}/application`, {
        employeeNo: selectedEmployee.id,
        requestDate: certDate,
        type: certType,
        purpose: certPurpose,
        approverId: 1,
      });

      setSuccessMessage('증명서 신청이 완료되었습니다.');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);

      const res = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/list/${selectedEmployee.id}`,
      );
      setCertList(res.data.result?.content || []);
      setCertType('EMPLOYMENT');
      setCertDate(getKoreaToday());
      setCertPurpose('');
    } catch (e) {
      setSuccessMessage('증명서 신청 실패');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
      if (
        user?.employeeNo &&
        String(user.employeeNo) === String(selectedEmployee.id)
      ) {
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

  const handleSave = async () => {
    if (!selectedEmployee?.id) return;
    setLoading(true);
    setError(null);
    try {
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
      formData.append('activate', status);
      formData.append('bankName', bankName);
      formData.append('accountNumber', accountNumber);
      formData.append('accountHolder', accountHolder);
      if (profileFile) {
        formData.append('profileImage', profileFile);
      }
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
      if (
        user?.employeeNo &&
        String(user.employeeNo) === String(selectedEmployee.id)
      ) {
        try {
          const res = await axiosInstance.get(
            `${API_BASE_URL}${HR}/user/${selectedEmployee.id}`,
          );
          const data = res.data.result;
          const newProfileImage = data.profileImage || profileImage;
          sessionStorage.setItem('USER_PROFILE_IMAGE', newProfileImage);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
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

  const handleFormSubmit = async () => {
    if (!selectedEmployee?.id) return;
    await handleSubmitCertificate();
  };

  const printPdfFromServer = async (certificateId) => {
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/my-print/${certificateId}`,
        { responseType: 'arraybuffer' },
      );

      const contentType = res.headers['content-type'] || 'application/pdf';
      const blob = new Blob([res.data], { type: contentType });
      const fileURL = URL.createObjectURL(blob);

      if (blob.size === 0) {
        setSuccessMessage(
          'PDF 데이터가 비어있습니다. 백엔드에서 PDF 생성에 실패했을 수 있습니다.',
        );
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
        return;
      }

      if (res.data.byteLength < 1000) {
        setSuccessMessage(
          'PDF 크기가 너무 작습니다. 백엔드에서 PDF 생성에 실패했을 수 있습니다.',
        );
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
        return;
      }

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

      iframe.onload = () => {
        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow.document;

          setTimeout(() => {
            try {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();

              setTimeout(() => {
                if (document.getElementById('pdf-iframe')) {
                  document.body.removeChild(iframe);
                  URL.revokeObjectURL(fileURL);
                }
              }, 2000);
            } catch (printError) {
              setSuccessMessage('인쇄 중 오류가 발생했습니다.');
              setShowSuccessModal(true);
              setTimeout(() => setShowSuccessModal(false), 2000);
              if (document.getElementById('pdf-iframe')) {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(fileURL);
              }
            }
          }, 3000);
        } catch (error) {
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
    } catch (err) {
      setSuccessMessage('PDF 인쇄 중 오류 발생: ' + err.message);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    }
  };

  const handleCertCheckbox = (id) => {
    setSelectedCertIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const [showRetireConfirm, setShowRetireConfirm] = useState(false);

  const doRetire = async () => {
    if (!selectedEmployee?.id) return;
    try {
      await axiosInstance.patch(
        `${API_BASE_URL}${HR}/users/retire/${selectedEmployee.id}`,
      );
      setSuccessMessage('퇴사자 등록이 완료되었습니다.');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
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

  const handleRetire = () => {
    setShowRetireConfirm(true);
  };

  const isRetired = status === 'N';

  const refreshCertList = async () => {
    if (selectedEmployee?.id) {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${CERTIFICATE}/list/all`,
        { params: { employeeNo: selectedEmployee.id } },
      );
      setCertList(res.data.result?.content || res.data.result || []);
    }
  };

  const getCertificateById = async (certificateId) => {
    const res = await approvalService.getCertificateById(certificateId);
    return res.result;
  };

  const handleCertReject = (certificateId) => {
    setRejectTargetId(certificateId);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async (comment) => {
    setRejectLoading(true);
    try {
      const targetIds = Array.isArray(rejectTargetId)
        ? rejectTargetId
        : [rejectTargetId];

      const selectedCerts = certList.filter((row) =>
        targetIds.includes(row.certificateId || row.id),
      );

      const pendingCerts = selectedCerts.filter(
        (cert) =>
          cert.status === 'REQUESTED' ||
          cert.status === 'PENDING' ||
          cert.status === '대기',
      );

      if (pendingCerts.length === 0) {
        setShowRejectModal(false);
        setRejectTargetId(null);
        setRejectLoading(false);
        return;
      }

      let processedCount = 0;
      for (const cert of pendingCerts) {
        try {
          await approvalService.rejectCertificate(
            cert.certificateId || cert.id,
            comment,
          );
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
        refreshCertList();
      }
    } catch (err) {
      setSuccessMessage('반려 처리 중 오류가 발생했습니다: ' + err.message);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <div className={styles.employeeDetailWrap}>
      <div className={styles.basicInfoTitle}>
        <span className={styles.arrow}>&#9654;</span>
        <span>상세정보</span>
      </div>
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
      {activeTab === 'info' && (
        <div className={styles.detailBody}>
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
                      maxLength={14}
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
                      maxLength={13}
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
          <div
            className={styles.certListTitle}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>증명서발급내역</span>
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
          {isHR && (
            <div className={styles.certFormBtnRow} style={{ marginTop: 12 }}>
              <button
                className={styles.approvalBtn}
                disabled={selectedCertIds.length === 0}
                onClick={async () => {
                  try {
                    const selectedCerts = certList.filter((row) =>
                      selectedCertIds.includes(row.certificateId || row.id),
                    );

                    const pendingCerts = selectedCerts.filter(
                      (cert) =>
                        cert.status === 'REQUESTED' ||
                        cert.status === 'PENDING' ||
                        cert.status === '대기',
                    );

                    if (pendingCerts.length === 0) {
                      return;
                    }

                    let processedCount = 0;
                    for (const cert of pendingCerts) {
                      try {
                        await approvalService.approveCertificate(
                          cert.certificateId || cert.id,
                        );
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
                      refreshCertList();
                    }
                  } catch (e) {
                    setSuccessMessage('승인 처리 중 오류가 발생했습니다.');
                    setShowSuccessModal(true);
                    setTimeout(() => setShowSuccessModal(false), 2000);
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
                  }
                }}
              >
                반려
              </button>
            </div>
          )}
        </div>
      )}
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

      <RejectModal
        open={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectTargetId(null);
        }}
        onConfirm={handleRejectConfirm}
        loading={rejectLoading}
      />

      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
          autoClose={true}
          autoCloseDelay={3000}
        />
      )}

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
