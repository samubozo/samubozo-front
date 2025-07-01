// OrgChart.jsx
import React, { useState, useEffect } from 'react';
import styles from './OrgChart.module.scss';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL } from '../../configs/host-config';
import { ChromePicker } from 'react-color';

// 예시용 조직도 데이터
const orgData = [
  {
    name: '김예은',
    position: '대표이사',
    role: 'CEO',
    roleColor: 'ceo',
    department: '경영지원부',
    children: [
      {
        name: '구현희',
        position: '개발팀장',
        role: 'Engineering',
        roleColor: 'engineering',
        department: '개발부',
        children: [
          {
            name: '팔현희',
            position: '선임개발자',
            role: 'Engineering',
            roleColor: 'engineering',
            department: '개발부',
          },
        ],
      },
      {
        name: '이호영',
        position: '마케팅팀장',
        role: 'Marketing',
        roleColor: 'marketing',
        department: '마케팅부',
        children: [
          {
            name: '삼호영',
            position: '마케팅 매니저',
            role: 'Marketing',
            roleColor: 'marketing',
            department: '마케팅부',
            email: 'bbb@samubozo.com',
            phone: '02-1234-5678',
          },
        ],
      },
      {
        name: '주영찬',
        position: '영업팀장',
        role: 'Sales',
        roleColor: 'sales',
        department: '영업부',
      },
      {
        name: '신현국',
        position: '인사팀장',
        role: 'Hr',
        roleColor: 'hr',
        department: '경영지원부',
      },
    ],
  },
];

const DEFAULT_DEPARTMENTS = [
  { name: '개발부', color: '#e6f0fb' },
  { name: '마케팅부', color: '#dafbe5' },
  { name: '영업부', color: '#fff0cc' },
  { name: '경영지원부', color: '#ffe6e6' },
];

const COLOR_OPTIONS = [
  { name: '파랑', value: '#e6f0fb' },
  { name: '초록', value: '#dafbe5' },
  { name: '노랑', value: '#fff0cc' },
  { name: '빨강', value: '#ffe6e6' },
  { name: '보라', value: '#e0c3f7' },
  { name: '회색', value: '#e0e0e0' },
  { name: '연두', value: '#eaffd0' },
];

function DepartmentFilter({ selected, onChange, departments, onAddClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handleSelect = (dept) => {
    if (!selected.includes(dept.name)) {
      onChange([...selected, dept.name]);
    }
  };
  const handleRemove = (dept) => {
    onChange(selected.filter((d) => d !== dept));
  };
  return (
    <div className={styles.deptFilterWrap}>
      <div className={styles.multiSelectWrap}>
        <div
          className={styles.multiSelectBox}
          onClick={() => setDropdownOpen((v) => !v)}
        >
          {selected.length === 0 ? (
            <span className={styles.placeholder}>전 부서</span>
          ) : (
            selected.map((dept) => {
              const deptObj = departments.find((d) => d.name === dept);
              return (
                <span
                  className={styles.deptTag}
                  key={dept}
                  style={
                    deptObj
                      ? {
                          background: deptObj.color,
                          borderColor: deptObj.color,
                        }
                      : {}
                  }
                >
                  {dept}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(dept);
                    }}
                    className={styles.deptRemoveBtn}
                  >
                    ×
                  </button>
                </span>
              );
            })
          )}
          <span className={styles.arrowIcon}>▼</span>
        </div>
        {dropdownOpen && (
          <div className={styles.dropdownList}>
            {departments.map((dept) => (
              <div className={styles.dropdownItem} key={dept.name}>
                <span onClick={() => handleSelect(dept)}>{dept.name}</span>
                <button
                  onClick={() => handleRemove(dept.name)}
                  className={styles.deptRemoveBtn}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button className={styles.addDeptBtn} onClick={onAddClick}>
        부서의 조직도 <span className={styles.plusIcon}>+</span>
      </button>
    </div>
  );
}

function AddDeptModal({ open, onClose, onAdd }) {
  const [color, setColor] = useState('#e6f0fb');
  const [name, setName] = useState('');
  if (!open) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalTitle}>부서 추가</div>
        <div className={styles.modalField}>
          <label>색상</label>
          <div className={styles.colorPickerWrap}>
            <ChromePicker
              color={color}
              onChange={(c) => setColor(c.hex)}
              disableAlpha
            />
          </div>
        </div>
        <div className={styles.modalField}>
          <label>부서명</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='부서명 입력'
          />
        </div>
        <div className={styles.modalBtnRow}>
          <button
            className={styles.modalOkBtn}
            onClick={() => {
              if (name) {
                onAdd({ name, color });
                setName('');
                setColor('#e6f0fb');
              }
            }}
          >
            확인
          </button>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

function OrgNode({ node, onCardClick, selectedId, deptColorMap }) {
  const [hover, setHover] = useState(false);
  const isSelected = selectedId === node.name + node.position;
  const hasChildren = node.children && node.children.length > 0;
  // 부서 색상 적용
  const badgeColor = deptColorMap[node.department];
  return (
    <div className={styles.nodeTreeWrap}>
      <div className={styles.nodeGroup}>
        <div
          className={styles.profileCard}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => onCardClick(node)}
          style={{ zIndex: isSelected ? 20 : 1 }}
        >
          <div className={styles.profilePhoto}></div>
          <div className={styles.profileName}>{node.name}</div>
          <div className={styles.profilePosition}>{node.position}</div>
          <div
            className={styles.roleBadge}
            style={badgeColor ? { background: badgeColor, color: '#222' } : {}}
          >
            {node.role}
          </div>
          {(hover || isSelected) && node.email && (
            <div className={styles.detailBox}>
              <div>{node.department}</div>
              <div>{node.email}</div>
              <div>{node.phone}</div>
              <button className={styles.messageBtn}>쪽지 보내기</button>
            </div>
          )}
        </div>
        {/* 자식이 있을 때만 수직선 */}
        {hasChildren && <div className={styles.verticalLine}></div>}
      </div>
      {/* 자식이 있을 때만 하위 트리 렌더 */}
      {hasChildren && (
        <div className={styles.childrenRowWrap}>
          {/* 여러 자식이 있을 때만 수평선 */}
          {node.children.length > 1 && (
            <div className={styles.horizontalLine}></div>
          )}
          <div className={styles.childrenRow}>
            {node.children.map((child) => (
              <OrgNode
                node={child}
                key={child.name + child.position}
                onCardClick={onCardClick}
                selectedId={selectedId}
                deptColorMap={deptColorMap}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const filterOrgData = (data, selectedDepts) => {
  if (!selectedDepts.length) return data;
  return data.map((ceo) => ({
    ...ceo,
    children: ceo.children?.filter((c) => selectedDepts.includes(c.department)),
  }));
};

const OrgChart = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 부서 목록 불러오기
  useEffect(() => {
    axiosInstance
      .get(`${API_BASE_URL}/organization-service/department`)
      .then((res) => {
        setDepartments(res.data);
      });
  }, []);

  // 부서명-색상 매핑
  const deptColorMap = departments.reduce((acc, cur) => {
    acc[cur.name] = cur.color;
    return acc;
  }, {});

  // 부서 추가
  const handleAddDept = (dept) => {
    axiosInstance
      .post(`${API_BASE_URL}/organization-service/department`, dept)
      .then(() => {
        // 추가 후 목록 새로고침
        return axiosInstance.get(
          `${API_BASE_URL}/organization-service/department`,
        );
      })
      .then((res) => {
        setDepartments(res.data);
        setModalOpen(false);
      });
  };

  const filteredData = filterOrgData(orgData, selectedDepts);

  return (
    <div className={styles.orgChartPage}>
      <DepartmentFilter
        selected={selectedDepts}
        onChange={setSelectedDepts}
        departments={departments}
        onAddClick={() => setModalOpen(true)}
      />
      <AddDeptModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddDept}
      />
      <div className={styles.chartContainer}>
        {filteredData.map((root) => (
          <OrgNode
            node={root}
            key={root.name + root.position}
            onCardClick={setSelectedCard}
            selectedId={selectedCard?.name + selectedCard?.position}
            deptColorMap={deptColorMap}
          />
        ))}
      </div>
    </div>
  );
};

export default OrgChart;
