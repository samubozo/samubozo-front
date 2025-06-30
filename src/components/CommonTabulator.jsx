// components/CommonTabulator.js
import React, { useRef } from 'react';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/css/tabulator.min.css';

const CommonTabulator = ({
  data = [],
  columns = [],
  onRowClick = () => {},
  downloadOptions = {},
  height = 'auto',
  selectable = 1,
  otherOptions = {},
}) => {
  const tableRef = useRef(null);

  const handleDownload = (type = 'csv') => {
    if (tableRef.current) {
      const table = tableRef.current.table;
      const filename = `${downloadOptions.filename || 'data'}_${new Date()
        .toISOString()
        .slice(0, 10)}.${type}`;

      table.download(
        type,
        filename,
        type === 'xlsx'
          ? { sheetName: downloadOptions.sheetName || 'Sheet1' }
          : {},
      );
    }
  };

  return (
    <div className='common-tabulator-wrap'>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}>
        <button onClick={() => handleDownload('csv')}>📥 CSV 다운로드</button>
        <button onClick={() => handleDownload('xlsx')}>
          📥 Excel 다운로드
        </button>
      </div>
      <ReactTabulator
        ref={tableRef}
        data={data}
        columns={columns}
        options={{
          layout: 'fitColumns',
          pagination: false,
          selectable,
          rowClick: onRowClick,
          ...otherOptions,
        }}
        style={{ height }}
      />
    </div>
  );
};

export default CommonTabulator;
