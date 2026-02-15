import React from 'react';
import BaseNodeShell from './BaseNodeShell';

const HandoffNode = ({ data, selected }) => {
  const details = data.details || {};
  const flowData = details.handOffFlow || {};
  
  // Logic: Use Name if available, otherwise ID/Variable
  const destination = flowData.handOffToName || flowData.handOffTo || 'Target Flow';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 'bold', color: '#666' }}>
        Go To: <span style={{ color: '#005073' }}>{destination}</span>
      </div>
      {/* No outputs for GoTo node */}
    </BaseNodeShell>
  );
};

export default HandoffNode;
