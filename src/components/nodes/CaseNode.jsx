import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const CaseNode = ({ data, selected }) => {
  const { details } = data;
  
  const linkKeys = details?.menuLinks || [];
  const linkLabels = details?.['menuLinks:input'] || [];

  // Map keys to labels. Don't filter '0'.
  const branches = linkKeys.map((key, index) => ({
      id: key,
      // If label exists use it, otherwise fallback to "Case X"
      label: linkLabels[index] || `Case ${key}`
  })).filter(b => b.id !== 'default'); 

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={row.sectionTitle}>Cases</div>
      
      {branches.map((branch) => (
         <div key={branch.id} style={row.container}>
           <div style={row.pill}>{branch.id}</div>
           {/* Allow the box to grow to fit the text 'Name', 'Phone', etc */}
           <div style={{...row.box, maxWidth: '140px'}} title={branch.label}>{branch.label}</div>
           <Handle type="source" position={Position.Right} id={branch.id} style={row.handleRight} />
         </div>
      ))}

      {/* Default Path */}
      <div style={row.divider} />
      <div style={row.container}>
         <div style={row.box}>Default</div>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>

      {/* Undefined Error - Explicitly added as requested */}
      <div style={row.divider} />
      <div style={row.errorContainer}>
         <span style={row.errorLabel}>Undefined Error</span>
         <Handle type="source" position={Position.Right} id="error" style={row.handleError} />
      </div>
    </BaseNodeShell>
  );
};
export default memo(CaseNode);
