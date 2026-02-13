import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const ParseNode = ({ data, selected }) => {
  const inputVar = data.details?.inputVariable || 'Unknown';
  const outputs = data.details?.outputVariableArray || [];

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{padding: '0 10px 8px 10px'}}>
         <div style={{fontSize: '10px', color: '#888'}}>Input: <strong>{inputVar}</strong></div>
         {outputs.length > 0 && (
           <div style={{fontSize: '10px', color: '#555', marginTop: '4px'}}>
             Parsing {outputs.length} fields
           </div>
         )}
      </div>

      <div style={row.firstRowContainer}>
         <span style={row.successLabel}>Success</span>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
      </div>
      {/* Parse has NO error handle per your requirements */}
    </BaseNodeShell>
  );
};
export default memo(ParseNode);
