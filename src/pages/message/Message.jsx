import React, { useState, useEffect, useRef } from 'react';
import styles from './Message.module.scss';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, MESSAGE, HR } from '../../configs/host-config';
import { useLocation } from 'react-router-dom';

const periodOptions = [
  { value: 'all', label: '전체기간' },
  { value: '1w', label: '1주일' },
  { value: '1m', label: '1개월' },
  { value: '3m', label: '3개월' },
];
const searchOptions = [
  { value: 'title', label: '제목' },
  { value: 'sender', label: '보낸사람' },
];
const sentSearchOptions = [
  { value: 'title', label: '제목' },
  { value: 'receiver', label: '받는사람' },
];

const PAGE_SIZE = 10;

function UserSearchModal({ open, onClose, onSelect }) {
  const [dept, setDept] = useState('');
  const [name, setName] = useState('');
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deptOptions, setDeptOptions] = useState([]);
  const debounceRef = useRef();
  const [isComposing, setIsComposing] = useState(false);

  // 검색 API 호출
  const fetchUsers = () => {
    setLoading(true);
    const params = {};
    if (name) params.userName = name;
    if (dept) params.departmentName = dept;
    axiosInstance
      .get(`${API_BASE_URL}${HR}/users/search`, { params })
      .then((res) => {
        let data = [];
        if (Array.isArray(res.data.result)) {
          data = res.data.result;
        } else if (res.data.result?.content) {
          data = res.data.result.content;
        }

        // 현재 로그인한 사용자 제외
        const currentEmployeeNo = sessionStorage.getItem('USER_EMPLOYEE_NO');
        const filteredData = data.filter(
          (user) => user.employeeNo != currentEmployeeNo,
        );

        setUserList(filteredData);
      })
      .catch(() => setUserList([]))
      .finally(() => setLoading(false));
  };

  // 모달이 열릴 때 전체 유저로 deptOptions 세팅
  useEffect(() => {
    if (!open) return;
    axiosInstance
      .get(`${API_BASE_URL}${HR}/users/search`, {
        params: { page: 0, size: 1000 },
      })
      .then((res) => {
        const data = res.data.result?.content || [];

        // 현재 로그인한 사용자 제외
        const currentEmployeeNo = sessionStorage.getItem('USER_EMPLOYEE_NO');
        const filteredData = data.filter(
          (user) => user.employeeNo != currentEmployeeNo,
        );

        setDeptOptions(
          Array.from(
            new Set(
              filteredData.map((u) => u.department?.name).filter(Boolean),
            ),
          ),
        );
      });
  }, [open]);

  // 검색/필터/모달 열릴 때마다 debounce로 API 호출
  useEffect(() => {
    if (!open || isComposing) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line
  }, [dept, name, open, isComposing]);

  return !open ? null : (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox} style={{ minWidth: 340, maxWidth: 400 }}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>받는사람 검색</span>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalFieldRow}>
          <label>부서</label>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value=''>전체</option>
            {deptOptions.map((opt) => (
              <option value={opt} key={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.modalFieldRow}>
          <label>이름</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={(e) => {
              setIsComposing(false);
              setName(e.target.value);
            }}
            placeholder='이름'
          />
        </div>
        <div
          style={{ margin: '10px 0 0 0', maxHeight: 160, overflowY: 'auto' }}
        >
          {loading ? (
            <div style={{ color: '#bbb', padding: '16px 0' }}>로딩 중...</div>
          ) : userList.length === 0 ? (
            <div style={{ color: '#bbb', padding: '16px 0' }}>
              검색 결과 없음
            </div>
          ) : (
            userList.map((u) => (
              <div
                key={u.employeeNo}
                style={{
                  padding: '7px 0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onClick={() => {
                  onSelect({
                    id: u.employeeNo,
                    name: u.userName,
                    dept: u.department?.name,
                  });
                  onClose();
                }}
              >
                <span style={{ fontWeight: 600 }}>{u.userName}</span>
                <span
                  style={{
                    fontSize: 13,
                    color: '#222',
                    background: u.department?.departmentColor || '#eafaf1',
                    borderRadius: 4,
                    padding: '2px 7px',
                    fontWeight: 500,
                  }}
                >
                  {u.department?.name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MessageModal({ open, onClose, onReply, message }) {
  if (!open || !message) return null;
  // 첨부파일 여러 개 지원: attachmentUrl, originalFileName이 배열일 수도 있음
  const attachmentUrls = Array.isArray(message.attachmentUrl)
    ? message.attachmentUrl
    : message.attachmentUrl
      ? [message.attachmentUrl]
      : [];
  const originalFileNames = Array.isArray(message.originalFileName)
    ? message.originalFileName
    : message.originalFileName
      ? [message.originalFileName]
      : [];
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>쪽지읽기</span>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalField}>
          <label>보낸사람</label>
          <input value={message.senderName || '보낸사람 없음'} readOnly />
        </div>
        <div className={styles.modalField}>
          <label>받은일시</label>
          <input
            value={
              message.sentAt
                ? new Date(message.sentAt).toLocaleString()
                : message.createdAt
                  ? new Date(message.createdAt).toLocaleString()
                  : ''
            }
            readOnly
          />
        </div>
        <div className={styles.modalField}>
          <label>제목</label>
          <input value={message.subject || '제목 없음'} readOnly />
        </div>
        <div className={styles.modalField}>
          <label>내용</label>
          <div
            className={styles.messageContentView}
            dangerouslySetInnerHTML={{ __html: message.content || '' }}
          />
        </div>
        {/* 첨부파일 표시 */}
        {Array.isArray(message.attachments) &&
          message.attachments.length > 0 && (
            <div className={styles.modalField}>
              <label>첨부파일</label>
              <div className={styles.fileLinksBox}>
                {message.attachments.map((file, idx) => (
                  <a
                    key={file.attachmentId || idx}
                    href={file.attachmentUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={styles.fileLink}
                    download={file.originalFileName || undefined}
                  >
                    {file.originalFileName || '첨부파일 다운로드'}
                  </a>
                ))}
              </div>
            </div>
          )}
        <div className={styles.modalBtnRow}>
          <button
            className={styles.modalOkBtn}
            onClick={() => onReply(message)}
            style={{ backgroundColor: '#007bff', color: 'white' }}
          >
            답장
          </button>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageWriteModal({
  open,
  onClose,
  onSend,
  initialReceiver = null,
  initialSubject = '',
}) {
  const [receivers, setReceivers] = useState([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [isNotice, setIsNotice] = useState(false);
  const editorRef = React.useRef();

  // JWT에서 권한 추출 함수
  const getRoleFromToken = () => {
    const token = sessionStorage.getItem('ACCESS_TOKEN');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.role || null;
    } catch (e) {
      return null;
    }
  };

  // 공지 권한 확인
  const hasNoticePermission = () => {
    const role = getRoleFromToken();
    return role === 'Y';
  };

  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
  ];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  // 초기값 설정
  useEffect(() => {
    if (open) {
      if (initialReceiver) {
        setReceivers([initialReceiver]);
      } else {
        setReceivers([]);
      }
      setSubject(initialSubject);
      setContent('');
      setFiles([]);
      setIsNotice(false);
      if (editorRef.current) {
        editorRef.current.getInstance().setMarkdown('');
      }
    }
  }, [open, initialReceiver, initialSubject]);

  // 권한이 없으면 공지 상태 해제
  useEffect(() => {
    if (!hasNoticePermission() && isNotice) {
      setIsNotice(false);
    }
  }, [isNotice]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files);
    const validFiles = [];
    for (const file of newFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(
          `허용되지 않은 파일 형식입니다.\n(이미지, PDF, 문서, 엑셀, 텍스트, ZIP만 첨부 가능)`,
        );
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`파일 "${file.name}"은(는) 50MB를 초과하여 첨부할 수 없습니다.`);
        continue;
      }
      validFiles.push(file);
    }
    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
    // 파일 input 값 초기화 (같은 파일 재첨부 가능하게)
    e.target.value = '';
  };

  const handleFileRemove = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddReceiver = (user) => {
    if (!receivers.find((r) => r.id === user.id)) {
      setReceivers((prev) => [...prev, user]);
    }
  };

  const handleRemoveReceiver = (id) => {
    setReceivers((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSend = async () => {
    if (!isNotice && receivers.length === 0) {
      alert('받는사람을 선택해주세요.');
      return;
    }
    if (!subject.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      const requestData = {
        receiverIds: isNotice ? [] : receivers.map((r) => r.id), // ✅ 배열로 전송
        subject: subject.trim(),
        content: content.trim(),
        isNotice,
      };

      const formData = new FormData();
      formData.append(
        'request',
        new Blob([JSON.stringify(requestData)], { type: 'application/json' }),
      );
      files.forEach((file) => formData.append('attachments', file));

      const response = await axiosInstance.post(
        `${API_BASE_URL}${MESSAGE}`,
        formData,
      );

      if (response.status === 200 || response.status === 201) {
        alert(isNotice ? '공지가 등록되었습니다.' : '쪽지가 전송되었습니다.');
        setReceivers([]);
        setSubject('');
        setContent('');
        setFiles([]);
        setIsNotice(false);
        if (editorRef.current) editorRef.current.getInstance().setMarkdown('');
        onSend({ success: true });
      } else {
        alert(
          isNotice ? '공지 등록에 실패했습니다.' : '쪽지 전송에 실패했습니다.',
        );
        onSend({ success: false });
      }
    } catch (error) {
      alert(
        isNotice ? '공지 등록에 실패했습니다.' : '쪽지 전송에 실패했습니다.',
      );
      onSend({ success: false });
    }
  };

  const handleClose = () => {
    setReceivers([]);
    setSubject('');
    setContent('');
    setFiles([]);
    setIsNotice(false);
    if (editorRef.current) {
      editorRef.current.getInstance().setMarkdown('');
    }
    onClose();
  };

  return !open ? null : (
    <>
      <div className={styles.modalOverlay}>
        <div
          className={styles.modalBox}
          style={{ maxWidth: 600, maxHeight: '80vh' }}
          onWheel={(e) => {
            const el = e.currentTarget;
            if (el.scrollHeight > el.clientHeight) {
              const { scrollTop, scrollHeight, clientHeight } = el;
              if (
                (e.deltaY > 0 && scrollTop + clientHeight < scrollHeight) ||
                (e.deltaY < 0 && scrollTop > 0)
              ) {
                e.stopPropagation();
              }
            }
          }}
        >
          <div className={styles.modalHeader}>
            <span className={styles.modalTitle}>쪽지 쓰기</span>
            <button className={styles.modalCloseBtn} onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className={styles.modalField}>
            <label>받는사람</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div
                style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 4 }}
              >
                {receivers.map((r) => (
                  <span
                    key={r.id}
                    style={{
                      background: '#e3f2fd',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {r.name} ({r.dept})
                    <button
                      onClick={() => handleRemoveReceiver(r.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        color: '#666',
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={() => setShowUserSearch(true)}
                disabled={isNotice}
                style={{
                  background: isNotice ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 4,
                  cursor: isNotice ? 'not-allowed' : 'pointer',
                  fontSize: 12,
                }}
              >
                검색
              </button>
            </div>
            {hasNoticePermission() && (
              <div style={{ marginTop: 8 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type='checkbox'
                    checked={isNotice}
                    onChange={(e) => setIsNotice(e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: 14, color: '#333' }}>
                    공지로 보내기 (전체 공지사항)
                  </span>
                </label>
              </div>
            )}
          </div>
          <div className={styles.modalField}>
            <label>제목</label>
            <input
              type='text'
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder='제목을 입력하세요'
            />
          </div>
          <div className={styles.modalField}>
            <label>내용</label>
            <Editor
              ref={editorRef}
              initialValue={content}
              initialEditType='wysiwyg'
              onChange={() => {
                const content = editorRef.current.getInstance().getMarkdown();
                setContent(content);
              }}
              height='300px'
              previewStyle='vertical'
              extendedAutolinks={true}
              customHTMLSanitizer={(html) => html}
              hideModeSwitch={false}
              toolbarItems={[
                ['heading', 'bold', 'italic', 'strike'],
                ['hr', 'quote'],
                ['ul', 'ol', 'task', 'indent', 'outdent'],
                ['table', 'image', 'link'],
                ['code', 'codeblock'],
              ]}
            />
          </div>
          <div className={styles.modalField}>
            <label>첨부파일</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label
                className={styles.modalOkBtn}
                style={{ margin: 0, cursor: 'pointer', padding: '7px 18px' }}
              >
                파일 선택
                <input
                  type='file'
                  multiple
                  onChange={handleFileAdd}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={{ color: '#888', fontSize: 13 }}>
                (여러 개 선택 가능)
              </span>
            </div>
            {files.length > 0 && (
              <ul className={styles.fileList}>
                {files.map((file, idx) => (
                  <li className={styles.fileListItem} key={idx}>
                    <span className={styles.fileName}>{file.name}</span>
                    <button
                      onClick={() => handleFileRemove(idx)}
                      className={styles.modalCancelBtn}
                      style={{
                        padding: '2px 10px',
                        fontSize: 13,
                        marginLeft: 8,
                      }}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.modalBtnRow}>
            <button className={styles.modalOkBtn} onClick={handleSend}>
              전송
            </button>
            <button className={styles.modalCancelBtn} onClick={handleClose}>
              취소
            </button>
          </div>
        </div>
      </div>
      <UserSearchModal
        open={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onSelect={handleAddReceiver}
      />
    </>
  );
}

const Message = () => {
  const location = useLocation();

  // 탭: 받은/보낸
  const [tab, setTab] = useState(
    () => localStorage.getItem('messageTab') || 'received',
  );
  // 필터/검색 상태
  const [period, setPeriod] = useState('all');
  const [searchType, setSearchType] = useState('title');
  const [searchValue, setSearchValue] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  // 체크박스/삭제
  const [checked, setChecked] = useState([]);
  // 페이징
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalMsg, setModalMsg] = useState(null);
  const [showWrite, setShowWrite] = useState(false);
  const [replyData, setReplyData] = useState(null);
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [sentMessages, setSentMessages] = useState([]);

  // 데이터 상태
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    if (tab === 'received') {
      fetchReceivedMessages();
    } else {
      fetchSentMessages();
    }
  }, [tab, page]); // page 추가!

  useEffect(() => {
    if (tab === 'received') {
      fetchReceivedMessages();
    }
    // eslint-disable-next-line
  }, [unreadOnly]);

  // URL 파라미터에서 messageId 확인 (페이지 로드 시에만)
  useEffect(() => {
    // 탭 변경 중에는 URL 파라미터 처리하지 않음
    if (isTabChanging) {
      return;
    }

    const urlParams = new URLSearchParams(location.search);
    const messageId = urlParams.get('messageId');

    if (
      messageId &&
      !modalMsg &&
      messageId !== sessionStorage.getItem('lastProcessedMessageId')
    ) {
      sessionStorage.setItem('lastProcessedMessageId', messageId);
      setTimeout(() => {
        fetchMessageDetail(messageId);
      }, 1000); // 데이터 로드 후 열기
    }
  }, [location.search]); // isTabChanging 의존성 제거

  // 받은쪽지 목록 조회
  const fetchReceivedMessages = async () => {
    setIsLoadingData(true);
    setLoading(true);
    try {
      const params = {
        page: page - 1,
        size: PAGE_SIZE,
        period,
        searchType,
        searchValue,
        unreadOnly,
      };

      const response = await axiosInstance.get(
        `${API_BASE_URL}${MESSAGE}/received`,
        { params },
      );

      if (response && response.data) {
        // 응답이 배열인 경우 그대로 사용, 객체인 경우 content 사용
        const messages = Array.isArray(response.data)
          ? response.data
          : response.data.content || [];
        setReceivedMessages(messages);
        // 페이징 정보가 있는 경우에만 설정
        if (response.data.totalElements) {
          setTotalPages(Math.ceil(response.data.totalElements / PAGE_SIZE));
        }
      }
    } catch (error) {
      console.error('받은쪽지 조회 실패:', error);
      alert('받은쪽지 조회에 실패했습니다.');
    } finally {
      setLoading(false);
      setIsLoadingData(false);
    }
  };

  // 보낸쪽지 목록 조회
  const fetchSentMessages = async () => {
    setIsLoadingData(true);
    setLoading(true);
    try {
      const params = {
        page: page - 1,
        size: PAGE_SIZE,
        period,
        searchType,
        searchValue,
      };

      const response = await axiosInstance.get(
        `${API_BASE_URL}${MESSAGE}/sent`,
        { params },
      );

      if (response && response.data) {
        // 응답이 배열인 경우 그대로 사용, 객체인 경우 content 사용
        const messages = Array.isArray(response.data)
          ? response.data
          : response.data.content || [];
        setSentMessages(messages);
        // 페이징 정보가 있는 경우에만 설정
        if (response.data.totalElements) {
          setTotalPages(Math.ceil(response.data.totalElements / PAGE_SIZE));
        }
      }
    } catch (error) {
      console.error('보낸쪽지 조회 실패:', error);
      alert('보낸쪽지 조회에 실패했습니다.');
    } finally {
      setLoading(false);
      setIsLoadingData(false);
    }
  };

  // 쪽지 상세 조회
  const fetchMessageDetail = async (messageId) => {
    // 데이터 로딩 중이거나 탭 변경 중에는 모달 열지 않음
    if (isLoadingData || isTabChanging) {
      return;
    }

    // messageId 유효성 검사
    if (!messageId) {
      console.error('messageId가 없습니다:', messageId);
      alert('메시지 ID가 유효하지 않습니다.');
      return;
    }
    try {
      // 모든 쪽지 상세조회는 동일한 엔드포인트 사용
      const endpoint = `${API_BASE_URL}${MESSAGE}/${messageId}`;

      const response = await axiosInstance.get(endpoint);

      // 응답 데이터 확인
      if (response && response.data) {
        setModalMsg(response.data);
        // 읽음 처리 후 목록 새로고침
        if (tab === 'received') {
          fetchReceivedMessages();
        }
      } else {
        throw new Error('응답 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('쪽지 상세 조회 실패:', error);

      // 403 에러인 경우 권한 문제로 처리
      if (error.response && error.response.status === 403) {
        alert('이 쪽지를 조회할 권한이 없습니다.');
      } else if (error.message === '응답 데이터가 없습니다.') {
        // 이미 처리된 에러는 다시 alert하지 않음
        return;
      } else {
        alert('쪽지 상세 조회에 실패했습니다.');
      }
    }
  };

  // 데이터 선택
  const data = tab === 'received' ? receivedMessages : sentMessages;

  // 페이징 처리 (API에서 페이징 처리하므로 단순히 표시만)
  const paged = data;

  // 체크박스 핸들러
  const handleCheck = (id) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };
  const handleCheckAll = (e) => {
    if (e.target.checked) {
      setChecked(paged.map((msg) => msg.id || msg.messageId));
    } else {
      setChecked([]);
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (checked.length === 0) {
      alert('삭제할 쪽지를 선택해주세요.');
      return;
    }

    // 공지 쪽지 삭제 권한 확인
    const currentUserId = sessionStorage.getItem('USER_EMPLOYEE_NO');
    const selectedMessages = paged.filter((msg) =>
      checked.includes(msg.id || msg.messageId),
    );
    const noticeMessages = selectedMessages.filter(
      (msg) => msg.isNotice === true,
    );

    if (noticeMessages.length > 0) {
      const unauthorizedNotices = noticeMessages.filter(
        (msg) => msg.senderId != currentUserId,
      );
      if (unauthorizedNotices.length > 0) {
        alert('공지 쪽지는 작성자만 삭제할 수 있습니다.');
        return;
      }
    }

    const confirmMessage =
      tab === 'received'
        ? '선택한 쪽지를 삭제하시겠습니까?'
        : '선택한 쪽지를 발신 취소하시겠습니까?';

    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const messageId of checked) {
        try {
          let endpoint;
          if (tab === 'received') {
            // 받은 쪽지함: 일반 삭제
            endpoint = `${API_BASE_URL}${MESSAGE}/${messageId}`;
          } else {
            // 보낸 쪽지함: 발신 취소
            endpoint = `${API_BASE_URL}${MESSAGE}/${messageId}/recall`;
          }

          await axiosInstance.delete(endpoint);
          successCount++;
        } catch (error) {
          console.error(
            `${tab === 'received' ? '삭제' : '발신 취소'} 실패:`,
            messageId,
            error,
          );
          failCount++;
        }
      }

      // 결과 알림
      if (successCount > 0) {
        alert(
          `${successCount}개의 쪽지가 ${tab === 'received' ? '삭제' : '발신 취소'}되었습니다.${failCount > 0 ? `\n${failCount}개 실패했습니다.` : ''}`,
        );
      } else {
        alert(`${tab === 'received' ? '삭제' : '발신 취소'}에 실패했습니다.`);
      }

      // 성공한 경우 목록 새로고침
      if (successCount > 0) {
        setChecked([]);
        if (tab === 'received') {
          fetchReceivedMessages();
        } else {
          fetchSentMessages();
        }
      }
    } catch (error) {
      console.error('삭제 처리 중 오류:', error);
      alert('삭제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 쪽지 전송 완료
  const handleSendComplete = (messageData) => {
    // API 응답 데이터 확인
    if (messageData && messageData.success !== false) {
      alert('쪽지가 성공적으로 전송되었습니다.');
      setShowWrite(false);
      setReplyData(null); // 답장 데이터 초기화

      // 보낸 편지함 탭으로 이동
      setTab('sent');
      setPage(1);
      setChecked([]);

      // 보낸쪽지함 새로고침
      fetchSentMessages();
    } else {
      // API에서 실패 응답을 보낸 경우
      alert('쪽지 전송에 실패했습니다.');
    }
  };

  // 답장 처리
  const handleReply = (message) => {
    // 보낸 사람 정보 구성 - 다양한 필드명 시도
    let deptName = '부서 정보 없음';

    if (message.senderDepartmentName) {
      deptName = message.senderDepartmentName;
    }

    const receiver = {
      id: message.senderId,
      name: message.senderName || '보낸사람 없음',
      dept: deptName,
    };

    // 답장 제목 설정 (원본 제목에 "Re:" 추가)
    const replySubject = message.subject
      ? `Re: ${message.subject}`
      : 'Re: 답장';

    setReplyData({
      receiver,
      subject: replySubject,
    });

    // 쪽지 읽기 모달 닫기
    setModalMsg(null);

    // 쪽지 쓰기 모달 열기
    setShowWrite(true);
  };

  // 모달 닫기 처리
  const handleCloseModal = () => {
    setModalMsg(null);
    // 처리된 messageId 초기화
    sessionStorage.removeItem('lastProcessedMessageId');
  };

  const handleTabChange = (newTab) => {
    localStorage.setItem('messageTab', newTab);
    setIsTabChanging(true);
    setTab(newTab);

    // URL 파라미터 제거
    const url = new URL(window.location);
    url.searchParams.delete('messageId');
    window.history.replaceState({}, '', url);

    // 탭 변경 후 잠시 후 플래그 해제
    setTimeout(() => {
      setIsTabChanging(false);
    }, 100);
  };

  // 검색 처리
  const handleSearch = () => {
    // 페이지를 1로 리셋하고 검색 실행
    setPage(1);
    setChecked([]);

    if (tab === 'received') {
      fetchReceivedMessages();
    } else {
      fetchSentMessages();
    }
  };

  // Enter 키로 검색
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 검색어 변경 시 자동 검색 (선택사항)
  const handleSearchValueChange = (e) => {
    setSearchValue(e.target.value);
    // 검색어가 비어있으면 자동으로 검색 실행
    if (e.target.value === '') {
      handleSearch();
    }
  };

  return (
    <div className={styles.messageWrap}>
      <aside className={styles.sidebar}>
        <div className={styles.title}>쪽지함</div>
        <button className={styles.writeBtn} onClick={() => setShowWrite(true)}>
          쪽지 쓰기
        </button>
        <button
          className={`${styles.sidebarButton} ${tab === 'received' ? styles.activeTab : ''}`}
          style={{
            background: tab === 'received' ? '#eafaf1' : 'none',
            borderLeft: tab === 'received' ? '4px solid #48b96c' : 'none',
            fontWeight: tab === 'received' ? '700' : '500',
          }}
          onClick={() => {
            handleTabChange('received');
            setPage(1);
            setChecked([]);
          }}
        >
          받은쪽지함
        </button>
        <button
          className={`${styles.sidebarButton} ${tab === 'sent' ? styles.activeTab : ''}`}
          style={{
            background: tab === 'sent' ? '#eafaf1' : 'none',
            borderLeft: tab === 'sent' ? '4px solid #48b96c' : 'none',
            fontWeight: tab === 'sent' ? '700' : '500',
          }}
          onClick={() => {
            handleTabChange('sent');
            setPage(1);
            setChecked([]);
          }}
        >
          보낸쪽지함
        </button>
      </aside>
      <div className={styles.content}>
        <div className={styles.topBar}>
          {tab === 'received' && (
            <label className={styles.unreadOnlyLabel}>
              <input
                type='checkbox'
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
              />
              안읽은 쪽지
            </label>
          )}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className={styles.periodSelect}
          >
            {periodOptions.map((opt) => (
              <option value={opt.value} key={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className={styles.searchTypeSelect}
          >
            {(tab === 'received' ? searchOptions : sentSearchOptions).map(
              (opt) => (
                <option value={opt.value} key={opt.value}>
                  {opt.label}
                </option>
              ),
            )}
          </select>
          <input
            className={styles.searchInput}
            value={searchValue}
            onChange={handleSearchValueChange}
            onKeyDown={handleSearchKeyPress}
            placeholder='검색어 입력'
          />
          <button className={styles.searchBtn} onClick={handleSearch}>
            검색
          </button>
        </div>
        <table
          className={`${styles.table} ${tab === 'sent' ? styles.sentTable : styles.receivedTable}`}
        >
          <thead>
            <tr>
              <th>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                    padding: 6,
                  }}
                >
                  <input
                    type='checkbox'
                    checked={
                      paged.length > 0 &&
                      paged.every((msg) =>
                        checked.includes(msg.id || msg.messageId),
                      )
                    }
                    onChange={handleCheckAll}
                    style={{ cursor: 'pointer' }}
                  />
                </label>
              </th>
              <th>{tab === 'received' ? '보낸사람' : '받는사람'}</th>
              <th>제목</th>
              <th>일시</th>
              {tab === 'sent' && <th>수신여부</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={tab === 'sent' ? 5 : 4}
                  className={styles.noData}
                  style={{ height: 120 }}
                >
                  로딩 중...
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td
                  colSpan={tab === 'sent' ? 5 : 4}
                  style={{
                    textAlign: 'center',
                    color: '#bbb',
                    padding: '12px 0',
                    height: '48px',
                  }}
                >
                  쪽지가 없습니다.
                </td>
              </tr>
            ) : (
              (() => {
                // 공지 쪽지와 일반 쪽지 분리
                const noticeMessages = paged.filter(
                  (msg) => msg.isNotice === true,
                );
                const normalMessages = paged.filter(
                  (msg) => msg.isNotice !== true,
                );

                return [...noticeMessages, ...normalMessages].map((msg) => (
                  <tr
                    key={msg.id || msg.messageId}
                    className={`${msg.isRead === false ? styles.unreadRow : ''} ${msg.isNotice ? styles.noticeRow : ''}`}
                    onClick={() => {
                      const messageId = msg.id || msg.messageId;
                      if (messageId) {
                        fetchMessageDetail(messageId);
                      } else {
                        console.error('메시지 ID가 없습니다:', msg);
                        alert('메시지 ID를 찾을 수 없습니다.');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: 'pointer', width: 40, minWidth: 32 }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%',
                          cursor: 'pointer',
                          padding: 6,
                        }}
                      >
                        <input
                          type='checkbox'
                          checked={checked.includes(msg.id || msg.messageId)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleCheck(msg.id || msg.messageId);
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                      </label>
                    </td>
                    <td>
                      {tab === 'received'
                        ? msg.senderName || '보낸사람 없음'
                        : msg.receiverName || '받는사람 없음'}
                    </td>
                    <td>
                      <div className={styles.titleContent}>
                        {msg.isNotice && <span>[공지]</span>}
                        <span className={styles.titleText}>
                          {msg.subject || '제목 없음'}
                        </span>
                      </div>
                    </td>
                    <td>
                      {msg.sentAt
                        ? new Date(msg.sentAt).toLocaleString()
                        : msg.createdAt
                          ? new Date(msg.createdAt).toLocaleString()
                          : msg.createdDate
                            ? new Date(msg.createdDate).toLocaleString()
                            : ''}
                    </td>
                    {tab === 'sent' && (
                      <td>{msg.isRead ? '읽음' : '미확인'}</td>
                    )}
                  </tr>
                ));
              })()
            )}
          </tbody>
        </table>
        <div className={styles.bottomBar}>
          <div className={styles.pagination}>
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className={styles.pageBtn}
            >
              {'<<'}
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setPage(idx + 1)}
                className={
                  page === idx + 1 ? styles.activePage : styles.pageBtn
                }
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className={styles.pageBtn}
            >
              {'>>'}
            </button>
          </div>
          <div className={styles.bottomBarRight}>
            {checked.length > 0 &&
              (() => {
                // 공지 쪽지 삭제 권한 확인
                const currentUserId =
                  sessionStorage.getItem('USER_EMPLOYEE_NO');
                const selectedMessages = paged.filter((msg) =>
                  checked.includes(msg.id || msg.messageId),
                );
                const noticeMessages = selectedMessages.filter(
                  (msg) => msg.isNotice === true,
                );

                // 공지 쪽지가 있는 경우, 현재 사용자가 작성자인 것만 필터링
                if (noticeMessages.length > 0) {
                  const authorizedNotices = noticeMessages.filter(
                    (msg) => msg.senderId == currentUserId,
                  );
                  const normalMessages = selectedMessages.filter(
                    (msg) => msg.isNotice !== true,
                  );

                  // 공지 쪽지는 작성자만 삭제 가능, 일반 쪽지는 모두 삭제 가능
                  const canDeleteMessages = [
                    ...authorizedNotices,
                    ...normalMessages,
                  ];

                  // 선택된 모든 쪽지가 삭제 가능한 것인지 확인
                  if (canDeleteMessages.length !== selectedMessages.length) {
                    return null; // 삭제 버튼 숨김
                  }
                }

                return (
                  <button className={styles.deleteBtn} onClick={handleDelete}>
                    {tab === 'sent'
                      ? // 보낸쪽지함일 때
                        (() => {
                          // 선택된 쪽지 중 하나라도 읽음이면 '삭제', 모두 미확인이면 '취소'
                          const selected = paged.filter((msg) =>
                            checked.includes(msg.id || msg.messageId),
                          );
                          if (
                            selected.length > 0 &&
                            selected.every((msg) => msg.isRead === false)
                          ) {
                            return '취소';
                          } else {
                            return '삭제';
                          }
                        })()
                      : '삭제'}
                  </button>
                );
              })()}
          </div>
        </div>
        <MessageModal
          open={!!modalMsg}
          message={modalMsg}
          onClose={handleCloseModal}
          onReply={handleReply}
        />
        <MessageWriteModal
          open={showWrite}
          onClose={() => {
            setShowWrite(false);
            setReplyData(null); // 답장 데이터 초기화
            // 처리된 messageId 초기화
            sessionStorage.removeItem('lastProcessedMessageId');
          }}
          onSend={handleSendComplete}
          initialReceiver={replyData?.receiver}
          initialSubject={replyData?.subject}
        />
      </div>
    </div>
  );
};

export { MessageWriteModal };
export default Message;
