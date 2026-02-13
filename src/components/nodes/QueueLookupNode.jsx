import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const QueueLookupNode = ({ data, selected }) => {
  const lookback = data.details?.ewtLookbackMinutes || '5';
  const queue = data.details?.destination || data.details?.['destination:name'] || 'Variable';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{padding: '0 10px 8px 10px'}}>
         <div style={{fontSize: '10px', color: '#888', textTransform:'uppercase'}}>Queue Stats</div>
         <div style={{fontSize: '11px', fontWeight:'bold', color: '#333', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'2px'}}>
            {queue}
         </div>
         <div style={{fontSize: '10px', color: '#666'}}>
            Lookback: <strong>{lookback} min</strong>
         </div>
      </div>

      <div style={row.firstRowContainer}>
         <span style={row.successLabel}>Success</span>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>
      <div style={row.divider} />
      {['insufficient_data', 'failure', 'error'].map(key => (
        <div key={key} style={row.errorContainer}>
           <span style={row.errorLabel}>{key}</span>
           <Handle type="source" position={Position.Right} id={key} style={row.handleError} />
        </div>
      ))}
    </BaseNodeShell>
  );
};
export default memo(QueueLookupNode);
