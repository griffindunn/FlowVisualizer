import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const HTTPRequestNode = ({ data, selected }) => {
  const details = data.details || {};
  
  // JSON keys from your file
  const method = details.httpRequestMethod || 'GET'; 
  const url = details.httpRequestUrl || 'http://...';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 12px' }}>
         <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#555', marginBottom: '2px' }}>
            {method}
         </div>
         <div 
            style={{ 
                fontSize: '10px', 
                color: '#005073', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                maxWidth: '220px'
            }} 
            title={url}
         >
            {url}
         </div>
      </div>

      {/* Success Output Only */}
      <div className="node-exit-row">
        <span className="exit-label">Success</span>
        <Handle type="source" position={Position.Right} id="default" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default HTTPRequestNode;
