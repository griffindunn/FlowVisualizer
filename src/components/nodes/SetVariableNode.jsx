import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const SetVariableNode = ({ data, selected }) => {
  const details = data.details || {};
  
  // 1. Identify Assignments
  let assignments = [];
  if (details.setVariablesArray && Array.isArray(details.setVariablesArray) && details.setVariablesArray.length > 0) {
    assignments = details.setVariablesArray;
  } else if (details.srcVariable) {
    assignments = [details];
  }

  // Helper to truncate long values
  const truncate = (str, n = 25) => {
    if (!str) return '';
    const s = String(str);
    return s.length > n ? s.substr(0, n - 1) + '...' : s;
  };

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '6px 12px 4px 12px' }}>
        <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#aaa', marginBottom: '4px', textTransform: 'uppercase' }}>
          Assignments
        </div>
        
        {/* 2. List Each Assignment (Compact Mode) */}
        {assignments.map((item, index) => {
            // Find value
            let fullVal = item.expr || item.literal || item.tgtVariable || 'null';
            let displayVal = truncate(fullVal);

            return (
                <div key={index} 
                     style={{ 
                        marginBottom: '2px', 
                        fontSize: '10px', 
                        fontFamily: 'Consolas, Monaco, monospace', 
                        lineHeight: '1.2',
                        whiteSpace: 'nowrap',       // Force single line
                        overflow: 'hidden',         // Hide overflow
                        textOverflow: 'ellipsis'    // Add ... if container shrinks
                     }}
                     title={`${item.srcVariable} = ${fullVal}`} // Hover to see full value
                >
                    <span style={{ color: '#005073', fontWeight: 'bold' }}>{item.srcVariable}</span>
                    <span style={{ color: '#999', margin: '0 3px' }}>=</span>
                    <span style={{ color: '#E65100' }}>{displayVal}</span>
                </div>
            );
        })}

        {assignments.length === 0 && (
            <div style={{ fontSize: '10px', color: '#bbb', fontStyle: 'italic' }}>
                No variables set
            </div>
        )}
      </div>

      {/* Success Output */}
      <div className="node-exit-row" style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #eee' }}>
        <span className="exit-label">Success</span>
        <Handle type="source" position={Position.Right} id="default" className="source" />
      </div>
      
      {/* Error Output */}
      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#D32F2F' }}>Undefined Error</span>
        <Handle type="source" position={Position.Right} id="error" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default SetVariableNode;
