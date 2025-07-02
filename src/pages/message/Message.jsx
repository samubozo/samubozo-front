import React, { useState } from 'react';
import styles from './Message.module.scss';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

function makeDummyMessages(type = 'received', start = 1, count = 30) {
  const arr = [];
  for (let i = start; i < start + count; i++) {
    let files = [];
    if (i % 5 === 0) {
      files = [
        { name: `첨부파일${i}.pdf`, url: `/dummy/sample${i}.pdf` },
        ...(i % 10 === 0
          ? [
              { name: `추가파일${i}.jpg`, url: `/dummy/sample${i}.jpg` },
              { name: `문서${i}.docx`, url: `/dummy/sample${i}.docx` },
            ]
          : []),
      ];
    }
    arr.push({
      id: type === 'received' ? i : 100 + i,
      sender: type === 'received' ? `보낸사람${i}` : undefined,
      receiver: type === 'sent' ? `받는사람${i}` : undefined,
      title: `${type === 'received' ? '받은' : '보낸'}쪽지 ${i}`,
      date: `2025-06-${String((i % 30) + 1).padStart(2, '0')} ${String(9 + (i % 10)).padStart(2, '0')}:00`,
      read: i % 3 !== 0,
      content: `${type === 'received' ? '받은' : '보낸'}쪽지 내용입니다. 번호: ${i}\n테스트용 더미데이터입니다.`,
      ...(files.length > 0 ? { file: files } : {}),
    });
  }
  return arr;
}

const initialDummyReceived = [
  {
    id: 1,
    sender: '테스터',
    title: '첨부파일 테스트',
    date: '2025-06-21 15:32',
    read: false,
    content: '첨부파일 여러개 테스트입니다.',
    file: [
      { name: '테스트1.pdf', url: '/dummy/test1.pdf' },
      { name: '테스트2.jpg', url: '/dummy/test2.jpg' },
      { name: '테스트3.docx', url: '/dummy/test3.docx' },
    ],
  },
  ...makeDummyMessages('received', 2, 29),
];
const initialDummySent = makeDummyMessages('sent', 1, 30);

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

const dummyUsers = [
  { id: 1, name: '이호영', dept: '개발팀' },
  { id: 2, name: '홍길동', dept: '영업팀' },
  { id: 3, name: '신현국', dept: '인사팀' },
  { id: 4, name: '김철수', dept: '개발팀' },
  { id: 5, name: '박영희', dept: '영업팀' },
  { id: 6, name: '최민수', dept: '인사팀' },
  { id: 7, name: '이수정', dept: '개발팀' },
  { id: 8, name: '정지훈', dept: '영업팀' },
];
const deptOptions = Array.from(new Set(dummyUsers.map((u) => u.dept)));

function UserSearchModal({ open, onClose, onSelect }) {
  const [dept, setDept] = useState('');
  const [name, setName] = useState('');
  const filtered = dummyUsers.filter(
    (u) => (!dept || u.dept === dept) && (!name || u.name.includes(name)),
  );
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
            placeholder='이름'
          />
        </div>
        <div
          style={{ margin: '10px 0 0 0', maxHeight: 160, overflowY: 'auto' }}
        >
          {filtered.length === 0 ? (
            <div style={{ color: '#bbb', padding: '16px 0' }}>
              검색 결과 없음
            </div>
          ) : (
            filtered.map((u) => (
              <div
                key={u.id}
                style={{
                  padding: '7px 0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onClick={() => {
                  onSelect(u);
                  onClose();
                }}
              >
                <span style={{ fontWeight: 600 }}>{u.name}</span>
                <span
                  style={{
                    fontSize: 13,
                    color: '#388e3c',
                    background: '#eafaf1',
                    borderRadius: 4,
                    padding: '2px 7px',
                  }}
                >
                  {u.dept}
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
          <input value={message.sender || message.receiver} readOnly />
        </div>
        <div className={styles.modalField}>
          <label>받은일시</label>
          <input value={message.date} readOnly />
        </div>
        <div className={styles.modalField}>
          <label>제목</label>
          <input value={message.title} readOnly />
        </div>
        <div className={styles.modalField}>
          <label>내용</label>
          <div
            className={styles.messageContentView}
            dangerouslySetInnerHTML={{ __html: message.content || '' }}
          />
        </div>
        {Array.isArray(message.file) && message.file.length > 0 && (
          <div className={styles.modalField}>
            <label>첨부파일</label>
            <div className={styles.fileLinksBox}>
              {message.file.map((f, idx) => (
                <a
                  href={f.url || '#'}
                  download={f.name}
                  className={styles.fileLink}
                  key={idx}
                >
                  {f.name}
                </a>
              ))}
            </div>
          </div>
        )}
        <div className={styles.modalBtnRow}>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            닫기
          </button>
          <button className={styles.modalOkBtn} onClick={onReply}>
            답장
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageWriteModal({ open, onClose, onSend }) {
  const [receivers, setReceivers] = useState([]); // [{id, name, dept}]
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const editorRef = React.useRef();

  // 파일 추가
  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [
      ...prev,
      ...newFiles.filter(
        (f) => !prev.some((pf) => pf.name === f.name && pf.size === f.size),
      ),
    ]);
    e.target.value = '';
  };
  // 파일 삭제
  const handleFileRemove = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };
  // 받는사람 추가/삭제
  const handleAddReceiver = (user) => {
    setReceivers((prev) =>
      prev.some((r) => r.id === user.id) ? prev : [...prev, user],
    );
  };
  const handleRemoveReceiver = (id) => {
    setReceivers((prev) => prev.filter((r) => r.id !== id));
  };

  return !open ? null : (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>쪽지 보내기</span>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalFieldRow}>
          <label>받는사람</label>
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexWrap: 'wrap',
              gap: 6,
              alignItems: 'center',
            }}
          >
            {receivers.map((r) => (
              <span
                key={r.id}
                style={{
                  background: '#eafaf1',
                  color: '#388e3c',
                  borderRadius: 5,
                  padding: '3px 8px',
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {r.name}
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f44336',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 15,
                    padding: 0,
                    marginLeft: 2,
                  }}
                  onClick={() => handleRemoveReceiver(r.id)}
                  title='삭제'
                >
                  ×
                </button>
              </span>
            ))}
            <button
              className={styles.addUserBtn}
              title='받는사람 추가'
              type='button'
              onClick={() => setShowUserSearch(true)}
            >
              <span style={{ fontSize: 22, color: '#48b96c' }}>+</span>
            </button>
          </div>
        </div>
        <UserSearchModal
          open={showUserSearch}
          onClose={() => setShowUserSearch(false)}
          onSelect={handleAddReceiver}
        />
        <div className={styles.modalFieldRow}>
          <label>제목</label>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className={styles.modalField}>
          <label>내용</label>
          <Editor
            ref={editorRef}
            initialValue={content}
            height='180px'
            initialEditType='wysiwyg'
            useCommandShortcut={false}
            onChange={() =>
              setContent(editorRef.current.getInstance().getHTML())
            }
            hideModeSwitch={true}
            toolbarItems={[
              ['bold', 'italic', 'strike'],
              ['hr', 'quote'],
              ['ul', 'ol', 'task'],
              ['table', 'link'],
              ['code', 'codeblock'],
            ]}
          />
        </div>
        <div className={styles.modalFieldRow}>
          <label>첨부파일</label>
          <input type='file' multiple onChange={handleFileAdd} />
        </div>
        {files.length > 0 && (
          <ul className={styles.fileList}>
            {files.map((f, idx) => (
              <li key={idx} className={styles.fileListItem}>
                <span className={styles.fileName}>{f.name}</span>
                <button
                  className={styles.fileRemoveBtn}
                  onClick={() => handleFileRemove(idx)}
                  title='삭제'
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.modalBtnRow}>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            닫기
          </button>
          <button
            className={styles.modalOkBtn}
            onClick={() => onSend({ receivers, title, content, files })}
          >
            보내기
          </button>
        </div>
      </div>
    </div>
  );
}

const Message = () => {
  // 탭: 받은/보낸
  const [tab, setTab] = useState('received');
  // 필터/검색 상태
  const [period, setPeriod] = useState('all');
  const [searchType, setSearchType] = useState('title');
  const [searchValue, setSearchValue] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  // 체크박스/삭제
  const [checked, setChecked] = useState([]);
  // 페이징
  const [page, setPage] = useState(1);
  const [modalMsg, setModalMsg] = useState(null);
  const [showWrite, setShowWrite] = useState(false);

  // 데이터 선택
  const data = tab === 'received' ? initialDummyReceived : initialDummySent;

  // 검색/필터 적용
  const filtered = data.filter((msg) => {
    // 기간 필터(여기선 생략, 실제 구현시 날짜 비교)
    // 읽음/안읽음
    if (tab === 'received' && unreadOnly && msg.read) return false;
    // 검색
    if (searchValue) {
      if (tab === 'received') {
        if (searchType === 'title' && !msg.title.includes(searchValue))
          return false;
        if (searchType === 'sender' && !msg.sender.includes(searchValue))
          return false;
      } else {
        if (searchType === 'title' && !msg.title.includes(searchValue))
          return false;
        if (searchType === 'receiver' && !msg.receiver.includes(searchValue))
          return false;
      }
    }
    return true;
  });

  // 페이징 처리
  const totalPage = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 체크박스 핸들러
  const handleCheck = (id) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };
  const handleCheckAll = (e) => {
    if (e.target.checked) {
      setChecked(paged.map((msg) => msg.id));
    } else {
      setChecked([]);
    }
  };
  // 삭제
  const handleDelete = () => {
    alert('삭제 기능은 더미입니다.');
    setChecked([]);
  };

  return (
    <div className={styles.messageWrap}>
      <aside className={styles.sidebar}>
        <div className={styles.title}>쪽지함</div>
        <button className={styles.writeBtn} onClick={() => setShowWrite(true)}>
          쪽지 쓰기
        </button>
        <button
          className={tab === 'received' ? styles.activeTab : ''}
          onClick={() => {
            setTab('received');
            setPage(1);
            setChecked([]);
          }}
        >
          받은쪽지함
        </button>
        <button
          className={tab === 'sent' ? styles.activeTab : ''}
          onClick={() => {
            setTab('sent');
            setPage(1);
            setChecked([]);
          }}
        >
          보낸쪽지함
        </button>
      </aside>
      <div className={styles.content}>
        <div className={styles.topBar}>
          {/* <select value={PAGE_SIZE} className={styles.pageSizeSelect} disabled>
            <option value={10}>10</option>
          </select> */}
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
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder='검색어 입력'
          />
          <button className={styles.searchBtn}>검색</button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <input
                  type='checkbox'
                  checked={
                    paged.length > 0 &&
                    paged.every((msg) => checked.includes(msg.id))
                  }
                  onChange={handleCheckAll}
                />
              </th>
              {tab === 'received' ? (
                <>
                  <th>보낸사람</th>
                  <th>제목</th>
                  <th>일시</th>
                </>
              ) : (
                <>
                  <th>받는사람</th>
                  <th>제목</th>
                  <th>일시</th>
                  <th>수신여부</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={tab === 'received' ? 4 : 5}
                  className={styles.noData}
                >
                  쪽지가 없습니다.
                </td>
              </tr>
            ) : (
              paged.map((msg) => (
                <tr
                  key={msg.id}
                  className={msg.read === false ? styles.unreadRow : ''}
                  onClick={() => setModalMsg(msg)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <input
                      type='checkbox'
                      checked={checked.includes(msg.id)}
                      onChange={() => handleCheck(msg.id)}
                    />
                  </td>
                  {tab === 'received' ? (
                    <>
                      <td>{msg.sender}</td>
                      <td>{msg.title}</td>
                      <td>{msg.date}</td>
                    </>
                  ) : (
                    <>
                      <td>{msg.receiver}</td>
                      <td>{msg.title}</td>
                      <td>{msg.date}</td>
                      <td>{msg.read ? '읽음' : '미확인'}</td>
                    </>
                  )}
                </tr>
              ))
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
            {[...Array(totalPage)].map((_, idx) => (
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
              onClick={() => setPage(totalPage)}
              disabled={page === totalPage}
              className={styles.pageBtn}
            >
              {'>>'}
            </button>
          </div>
          {checked.length > 0 && (
            <button className={styles.deleteBtn} onClick={handleDelete}>
              삭제
            </button>
          )}
        </div>
        <MessageModal
          open={!!modalMsg}
          message={modalMsg}
          onClose={() => setModalMsg(null)}
          onReply={() => alert('답장 기능은 추후 구현')}
        />
        <MessageWriteModal
          open={showWrite}
          onClose={() => setShowWrite(false)}
          onSend={(msg) => {
            alert('쪽지 전송: ' + JSON.stringify(msg));
            setShowWrite(false);
          }}
        />
      </div>
    </div>
  );
};

export default Message;
