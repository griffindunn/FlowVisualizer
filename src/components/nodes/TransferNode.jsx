import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const TransferNode = ({ data, selected }) => {
  const dest = data.details?.transfertodn || data.details?.['transfertodn:name'] || 'Unknown';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{padding: '0 10px 8px 10px'}}>
         <div style={{fontSize: '10px', color: '#888', textTransform:'uppercase'}}>Blind Transfer To</div>
         <div style={{fontSize: '12px', fontWeight: 'bold', color: '#2E7D32'}}>
            {dest}
         </div>
      </div>
      <div style={row.container}>
         <span style={row.successLabel}>Connected</span>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>
      <div style={row.divider} />
      {['busy', 'no_answer', 'invalid', 'error'].map(key => (
        <div key={key} style={row.errorContainer}>
           <span style={row.errorLabel}>{key}</span>
           <Handle type="source" position={Position.Right} id={key} style={row.handleError} />
        </div>
      ))}
    </BaseNodeShell>
  );
};
export default memo(TransferNode);
