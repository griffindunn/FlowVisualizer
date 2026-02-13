import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const CollectDigitsNode = ({ data, selected }) => {
  // We use specific labels per your request
  const exitLabels = {
    timeout: 'No-Input Timeout',
    invalid: 'Unmatched Entry',
    error: 'Undefined Error',
    interrupted: 'Interrupted'
  };

  const exits = ['timeout', 'invalid', 'error'];

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={row.container}>
         <span style={row.successLabel}>Success</span>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>
      <div style={row.divider} />
      {exits.map(key => (
        <div key={key} style={row.errorContainer}>
           <span style={row.errorLabel}>{exitLabels[key] || key}</span>
           <Handle type="source" position={Position.Right} id={key} style={row.handleError} />
        </div>
      ))}
    </BaseNodeShell>
  );
};
export default memo(CollectDigitsNode);
