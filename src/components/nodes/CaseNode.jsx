import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const CaseNode = ({ data, selected }) => {
  const { details } = data;
  
  const linkKeys = details?.menuLinks || [];
  const linkLabels = details?.['menuLinks:input'] || [];

  // Map keys to labels. Don't filter '0'.
  // Filter out 'default' because we handle it explicitly at the bottom
  const branches = linkKeys.map((key, index) => ({
      id: key,
      label: linkLabels[index] || `Case ${key}`
  })).filter(b => b.id !== 'default'); 

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={row.sectionTitle}>Cases</div>
      
      {branches.map((branch, index) => (
         // Conditional Style: If it's the first item (index 0), use the aligned container
         <div key={branch.id} style={index === 0 ? row.firstRowContainer : row.container}>
           <div style={row.pill}>{branch.id}</div>
           {/* Allow box to be flexible but max width prevents overflow */}
           <div style={{...row.box, maxWidth: '140px'}} title={branch.label}>{branch.label}</div>
           <Handle type="source" position={Position.Right} id={branch.id} style={row.handleRight} />
         </div>
      ))}

      {/* Default Path */}
      <div style={row.divider} />
      
      {/* Fallback: If there are NO cases (rare), the Default row becomes the first row */}
      <div style={branches.length === 0 ? row.firstRowContainer : row.container}>
         <div style={row.box}>Default</div>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>

      {/* Undefined Error */}
      <div style={row.divider} />
      <div style={row.errorContainer}>
         <span style={row.errorLabel}>Undefined Error</span>
         <Handle type="source" position={Position.Right} id="error" style={row.handleError} />
      </div>
    </BaseNodeShell>
  );
};
export default memo(CaseNode);
