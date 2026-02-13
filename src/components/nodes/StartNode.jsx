import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const StartNode = ({ data, selected }) => {
  const event = data.details?.event || 'New Call';

  return (
    <BaseNodeShell data={data} selected={selected} showInput={false}>
       <div style={{padding: '0 10px 8px 10px'}}>
         <div style={{fontSize: '10px', color: '#888', textTransform:'uppercase'}}>Trigger</div>
         <div style={{fontSize: '12px', fontWeight:'bold', color: '#00695C'}}>{event}</div>
       </div>

       <div style={row.container}>
         <span style={row.successLabel}>Start</span>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>
    </BaseNodeShell>
  );
};
export default memo(StartNode);
