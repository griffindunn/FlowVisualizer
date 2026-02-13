import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const CollectDigitsNode = ({ data, selected }) => {
  const variable = data.details?.variable || 'Digits';

  const exitLabels = {
    timeout: 'No-Input Timeout',
    invalid: 'Unmatched Entry',
    error: 'Undefined Error',
    interrupted: 'Interrupted'
  };

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{padding: '0 10px 8px 10px'}}>
         <div style={{fontSize: '10px', color: '#888', textTransform:'uppercase'}}>Store In</div>
         <div style={{fontSize: '12px', fontWeight:'bold', color: '#005073'}}>{variable}</div>
      </div>

      <div style={row.container}>
         <span style={row.successLabel}>Success</span>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>
      
      <div style={row.divider} />
      
      {['timeout', 'invalid', 'error'].map(key => (
        <div key={key} style={row.errorContainer}>
           <span style={row.errorLabel}>{exitLabels[key] || key}</span>
           <Handle type="source" position={Position.Right} id={key} style={row.handleError} />
        </div>
      ))}
    </BaseNodeShell>
  );
};
export default memo(CollectDigitsNode);
