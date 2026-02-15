import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const PlayMessageNode = ({ data, selected }) => {
  // Logic to find the actual message text
  let message = 'No message configured';
  const details = data.details || {};

  // Check TTS array
  if (details.promptsTts && details.promptsTts.length > 0) {
      message = details.promptsTts[0].value || details.promptsTts[0].name;
  } 
  // Check Audio/Standard Prompts array
  else if (details.prompts && details.prompts.length > 0) {
      message = details.prompts[0].value || details.prompts[0].name;
  }
  // Check direct message property
  else if (details.message) {
      message = details.message;
  }

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
