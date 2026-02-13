import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const BusinessHoursNode = ({ data, selected }) => {
  const schedule = data.details?.['businessHoursId:name'] || data.details?.businessHoursId || 'Static';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{padding: '0 10px 8px 10px'}}>
         <div style={{fontSize: '10px', color: '#888', textTransform:'uppercase'}}>Schedule</div>
         <div style={{fontSize: '11px', fontWeight:'bold', color: '#333', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
            {schedule}
         </div>
      </div>

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
