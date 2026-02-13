import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const SetVariableNode = ({ data, selected }) => {
  const vars = data.details?.setVariablesArray || [];

  return (
    <BaseNodeShell data={data} selected={selected}>
      {/* Show Variable List */}
      <div style={{padding: '0 10px 8px 10px'}}>
        {vars.slice(0, 4).map((v, i) => (
          <div key={i} style={{fontSize: '11px', color: '#555', marginBottom: '2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
            <span style={{fontWeight:'bold'}}>{v.srcVariable || v.name}</span> = {v.literal || v.value}
          </div>
        ))}
        {vars.length > 4 && <div style={{fontSize:'10px', color:'#999'}}>+ {vars.length - 4} more</div>}
      </div>

      <div style={row.firstRowContainer}>
         <span style={row.successLabel}>Success</span>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>
      <div style={row.divider} />
      <div style={row.errorContainer}>
         <span style={row.errorLabel}>Undefined Error</span>
         <Handle type="source" position={Position.Right} id="error" style={row.handleError} />
      </div>
    </BaseNodeShell>
  );
};
export default memo(SetVariableNode);
