import React from 'react';
import styles from './Approval.module.scss';

function ApprovalTable({
  columns,
  data,
  selected,
  setSelected,
  onEditVacation,
  onApprove,
  onReject,
  isHR = false,
  onEditCert, // 추가
  onPrintCert, // 추가
  typeToKor, // 추가
  statusToKor, // 추가
  urgencyToKor, // 긴급도 변환 함수 추가
  onRowClick, // 행 클릭 이벤트 추가
}) {
  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  return (
    <table className={styles.table}>
      <colgroup>
        <col style={{ width: '50px' }} /> {/* 체크박스 */}
        {columns.map((col) => (
          <col
            key={col.key}
            style={{
              width:
                col.key === 'reason'
                  ? '200px'
                  : col.key === 'type'
                    ? '100px'
                    : col.key === 'applicant'
                      ? '80px'
                      : col.key === 'applicantDepartment'
                        ? '100px'
                        : col.key === 'applyDate'
                          ? '100px'
                          : col.key === 'period'
                            ? '120px'
                            : col.key === 'approver'
                              ? '80px'
                              : col.key === 'processedAt'
                                ? '100px'
                                : col.key === 'expirationDate'
                                  ? '90px'
                                  : col.key === 'status'
                                    ? '80px'
                                    : col.key === 'urgency'
                                      ? '80px'
                                      : 'auto',
            }}
          />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th>
            <input
              type='checkbox'
              checked={selected.length === data.length && data.length > 0}
              onChange={(e) =>
                setSelected(e.target.checked ? data.map((d) => d.id) : [])
              }
            />
          </th>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
          {/* 작업 칼럼 제거 */}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr
            key={row.id}
            onClick={() => onRowClick && onRowClick(row)}
            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
          >
            <td onClick={(e) => e.stopPropagation()}>
              <input
                type='checkbox'
                checked={selected.includes(row.id)}
                onChange={() => toggle(row.id)}
              />
            </td>
            {columns.map((col) => (
              <td key={`${row.id}-${col.key}`}>
                {col.key === 'reason' ? (
                  <div className={styles.reasonCell} title={row[col.key]}>
                    {row[col.key]}
                  </div>
                ) : col.key === 'type' && typeToKor ? (
                  typeToKor(row[col.key])
                ) : col.key === 'urgency' && urgencyToKor ? (
                  urgencyToKor(row[col.key])
                ) : col.key === 'status' && statusToKor ? (
                  <span
                    className={`${styles.statusBadge} ${styles[`status${statusToKor(row[col.key])}`]}`}
                  >
                    {statusToKor(row[col.key])}
                  </span>
                ) : (
                  row[col.key]
                )}
              </td>
            ))}
            {/* 작업 버튼 칼럼 제거 */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ApprovalTable;
