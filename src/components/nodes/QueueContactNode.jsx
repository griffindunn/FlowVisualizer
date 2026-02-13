import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const QueueContactNode = ({ data, selected }) => {
  const dest = data.details?.destination || data.details?.['destination:name'] || data.details?.destinationVariable || 'Not configured';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{padding: '0 10px 8px 10px'}}>
         <div style={{fontSize: '10px', color: '#888', textTransform:'uppercase'}}>Queue</div>
         <div style={{fontSize: '12px', fontWeight: 'bold', color: '#333', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
            {dest}
         </div>
      </div>

      <div style={row.container}>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>
      <div style={row.divider} />
      {['failure', 'error'].map(key => (
        <div key={key} style={row.errorContainer}>
           <span style={row.errorLabel}>{key}</span>
           <Handle type="source" position={Position.Right} id={key} style={row.handleError} />
        </div>
      ))}
    </BaseNodeShell>
  );
};
export default memo(QueueContactNode);
