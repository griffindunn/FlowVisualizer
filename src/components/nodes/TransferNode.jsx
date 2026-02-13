import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const TransferNode = ({ data, selected }) => (
  <BaseNodeShell data={data} selected={selected}>
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
export default memo(TransferNode);
