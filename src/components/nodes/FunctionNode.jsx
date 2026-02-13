import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const FunctionNode = ({ data, selected }) => {
  const fnName = data.details?.fnName || 'Custom Function';

  return (
    <BaseNodeShell data={data} selected={selected}>
      {/* Configuration Detail */}
      <div style={{padding: '0 10px 8px 10px'}}>
         <div style={{fontSize: '10px', color: '#888', textTransform:'uppercase'}}>Function Name</div>
         <div style={{fontSize: '11px', fontWeight:'bold', color: '#333', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'220px'}}>
            {fnName}
         </div>
      </div>

      {/* Success Exit */}
      <div style={row.firstRowContainer}>
         <span style={row.successLabel}>Success</span>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>

      <div style={row.divider} />

      {/* Error Exit */}
      <div style={row.errorContainer}>
         <span style={row.errorLabel}>Undefined Error</span>
         <Handle type="source" position={Position.Right} id="error" style={row.handleError} />
      </div>
    </BaseNodeShell>
  );
};
export default memo(FunctionNode);
