import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const SetCallerIDNode = ({ data, selected }) => {
  const details = data.details || {};
  
  // Extract the ID being set
  const val = details.callerId || 'Unknown ID';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 12px' }}>
        <div style={{ 
            fontSize: '9px', 
            fontWeight: 'bold', 
            color: '#aaa', 
            marginBottom: '4px', 
            textTransform: 'uppercase' 
        }}>
          Setting Caller ID
        </div>
        
        <div style={{ 
            fontSize: '11px', 
            color: '#005073', 
            fontWeight: 'bold',
            fontFamily: 'Consolas, Monaco, monospace',
            background: '#E1F5FE',
            padding: '4px',
            borderRadius: '4px',
            border: '1px solid #B3E5FC'
        }}>
            {val}
        </div>
      </div>
      
      {/* User requested NO Success/Error outputs. 
         This treats the node as a visual endpoint.
      */}
    </BaseNodeShell>
  );
};

export default SetCallerIDNode;
