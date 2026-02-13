import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const SimpleActionNode = ({ data, selected, exits = ['error'] }) => (
  <BaseNodeShell data={data} selected={selected}>
    <div style={row.container}>
       <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
    </div>
    <div style={row.divider} />
    {exits.map(key => (
      <div key={key} style={row.errorContainer}>
         <span style={row.errorLabel}>{key === 'error' ? 'Undefined Error' : key}</span>
         <Handle type="source" position={Position.Right} id={key} style={row.handleError} />
      </div>
    ))}
  </BaseNodeShell>
);
export default memo(SimpleActionNode);
