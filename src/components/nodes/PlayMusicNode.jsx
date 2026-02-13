import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const PlayMusicNode = ({ data, selected }) => {
  const file = data.details?.prompt || data.details?.['prompt:name'] || data.details?.musicFile || 'No file';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{padding: '0 10px 8px 10px'}}>
         <div style={{fontSize: '11px', color: '#555', fontStyle:'italic'}}>🎵 {file}</div>
      </div>
      <div style={row.container}>
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
export default memo(PlayMusicNode);
