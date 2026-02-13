import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const CaseNode = ({ data, selected }) => {
  const { details } = data;
  
  const linkKeys = details?.menuLinks || [];
  const linkLabels = details?.['menuLinks:input'] || [];

  // Combine Keys with their Labels (e.g., "1" : "Sales")
  const branches = linkKeys.map((key, index) => ({
      id: key,
      label: linkLabels[index] || `Case ${key}`
  })).filter(b => b.id !== 'default'); // Only filter 'default', keep everything else including '0'

  return (
    <BaseNodeShell data={data} selected={selected}>
      {/* Case Options */}
      {branches.length > 0 && <div style={row.sectionTitle}>Cases</div>}
      
      {branches.map((branch) => (
         <div key={branch.id} style={row.container}>
           <div style={row.pill}>{branch.id}</div>
           <div style={row.box} title={branch.label}>{branch.label}</div>
           <Handle type="source" position={Position.Right} id={branch.id} style={row.handleRight} />
         </div>
      ))}

      {/* Default Path */}
      <div style={row.divider} />
      <div style={row.container}>
         <div style={row.box}>Default</div>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>

      {/* Undefined Error (Explicitly requested) */}
      <div style={row.divider} />
      <div style={row.errorContainer}>
         <span style={row.errorLabel}>Undefined Error</span>
         <Handle type="source" position={Position.Right} id="error" style={row.handleError} />
      </div>
    </BaseNodeShell>
  );
};
export default memo(CaseNode);
