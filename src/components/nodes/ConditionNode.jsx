import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const ConditionNode = ({ data, selected }) => {
  const desc = data.details?.description;
  const expr = data.details?.expression || '';
  const label = desc || expr || 'Condition';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{padding: '0 10px 8px 10px'}}>
         <div style={{fontSize: '11px', color: '#555', fontStyle: 'italic', maxHeight: '36px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
            {label}
         </div>
      </div>

      <div style={row.divider} />

      <div style={row.container}>
         <div style={row.box}>True</div>
         <Handle type="source" position={Position.Right} id="true" style={row.handleRight} />
      </div>
      <div style={row.container}>
         <div style={row.box}>False</div>
         <Handle type="source" position={Position.Right} id="false" style={row.handleRight} />
         <Handle type="source" position={Position.Right} id="default" style={{...row.handleRight, opacity: 0, pointerEvents: 'none'}} />
      </div>
      
      <div style={row.divider} />
      <div style={row.errorContainer}>
         <span style={row.errorLabel}>Undefined Error</span>
         <Handle type="source" position={Position.Right} id="error" style={row.handleError} />
      </div>
    </BaseNodeShell>
  );
};
export default memo(ConditionNode);
