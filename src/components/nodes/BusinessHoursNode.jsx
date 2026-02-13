import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const BusinessHoursNode = ({ data, selected }) => {
  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={row.sectionTitle}>Status</div>
      {[
        { id: 'workingHours', label: 'Open' },
        { id: 'holidays', label: 'Holiday' },
        { id: 'override', label: 'Override' },
        { id: 'default', label: 'Closed/Default' }
      ].map(branch => (
         <div key={branch.id} style={row.container}>
           <div style={row.box}>{branch.label}</div>
           <Handle type="source" position={Position.Right} id={branch.id} style={row.handleRight} />
         </div>
      ))}
      <div style={row.divider} />
      <div style={row.errorContainer}>
         <span style={row.errorLabel}>Undefined Error</span>
         <Handle type="source" position={Position.Right} id="error" style={row.handleError} />
      </div>
    </BaseNodeShell>
  );
};
export default memo(BusinessHoursNode);
