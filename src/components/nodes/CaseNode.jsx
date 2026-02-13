import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const CaseNode = ({ data, selected }) => {
  const { details } = data;
  const branches = details?.menuLinks?.filter(k => k !== 'default' && k !== '0') || [];

  return (
    <BaseNodeShell data={data} selected={selected}>
      {branches.length > 0 && <div style={row.sectionTitle}>Cases</div>}
      {branches.map((key) => (
         <div key={key} style={row.container}>
           <div style={row.box}>{key}</div>
           <Handle type="source" position={Position.Right} id={key} style={row.handleRight} />
         </div>
      ))}
      <div style={row.container}>
         <div style={row.box}>Default</div>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>
      <div style={row.divider} />
      <div style={row.errorContainer}>
         <span style={row.errorLabel}>Undefined Error</span>
         <Handle type="source" position={Position.Right} id="error" style={row.handleError} />
      </div>
    </BaseNodeShell>
  );
};
export default memo(CaseNode);
