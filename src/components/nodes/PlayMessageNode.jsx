import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const PlayMessageNode = ({ data, selected }) => {
  const prompts = data.details?.promptsTts || data.details?.prompts || [];
  const firstPrompt = prompts[0] || {};
  const label = firstPrompt.value || firstPrompt.name || 'No audio configured';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{padding: '0 10px 8px 10px'}}>
         <div style={{
           background: '#E1F5FE', color: '#0277BD', padding: '4px', borderRadius: '4px', 
           fontSize: '11px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', border:'1px solid #B3E5FC'
         }}>
           {label}
         </div>
         {prompts.length > 1 && <div style={{fontSize:'10px', color:'#999', marginTop:2}}>+ {prompts.length - 1} more</div>}
      </div>

      <div style={row.container}>
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
export default memo(PlayMessageNode);
