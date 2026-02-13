import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const HTTPRequestNode = ({ data, selected }) => {
  const method = data.details?.httpRequestMethod || 'GET';
  const url = data.details?.httpRequestUrl || '';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{padding: '0 10px 8px 10px'}}>
         <div style={{fontSize: '10px', fontWeight:'bold', color: '#555'}}>{method}</div>
         <div style={{fontSize: '11px', color: '#005073', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth: '200px'}}>
            {url}
         </div>
      </div>

      <div style={row.firstRowContainer}>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>
      <div style={row.divider} />
      {['timeout', 'error'].map(key => (
        <div key={key} style={row.errorContainer}>
           <span style={row.errorLabel}>{key}</span>
           <Handle type="source" position={Position.Right} id={key} style={row.handleError} />
        </div>
      ))}
    </BaseNodeShell>
  );
};
export default memo(HTTPRequestNode);
