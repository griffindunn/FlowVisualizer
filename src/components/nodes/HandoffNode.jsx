import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const HandoffNode = ({ data, selected }) => {
  const flowName = data.details?.handOffFlow?.handOffToName || 'Unknown Flow';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{padding: '0 10px 8px 10px'}}>
         <div style={{fontSize: '10px', color: '#888', textTransform:'uppercase'}}>Go To Flow</div>
         <div style={{fontSize: '12px', fontWeight:'bold', color: '#7B1FA2', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
            {flowName}
         </div>
      </div>

      <div style={row.container}>
         <span style={row.successLabel}>Connected</span>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>
      
      <div style={row.divider} />
      
      {['busy', 'no_answer', 'invalid', 'error'].map(key => (
        <div key={key} style={row.errorContainer}>
           <span style={row.errorLabel}>{key}</span>
           <Handle type="source" position={Position.Right} id={key} style={row.handleError} />
        </div>
      ))}
    </BaseNodeShell>
  );
};
export default memo(HandoffNode);
