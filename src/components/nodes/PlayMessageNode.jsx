import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const PlayMessageNode = ({ data, selected }) => {
  const message = data.details?.message || 'No message configured';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 12px' }}>
        <div style={{ 
          background: '#E1F5FE', 
          color: '#0277BD', 
          padding: '6px', 
          borderRadius: '4px', 
          fontSize: '11px',
          border: '1px solid #B3E5FC',
          maxHeight: '60px',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {message}
        </div>
      </div>

      <div className="node-exit-row" style={{ marginTop: '5px' }}>
        <span className="exit-label">Success</span>
        <Handle type="source" position={Position.Right} id="default" className="source" />
      </div>

      <div style={{ height: '1px', background: '#eee', margin: '6px 0' }} />

      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#999' }}>Undefined Error</span>
        <Handle type="source" position={Position.Right} id="error" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default PlayMessageNode;
