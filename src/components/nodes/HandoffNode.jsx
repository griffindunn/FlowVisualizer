import React from 'react';
import BaseNodeShell from './BaseNodeShell';

const HandoffNode = ({ data, selected }) => {
  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 'bold', color: '#666' }}>
        Go To: {data.details?.destination || 'Target Flow'}
      </div>
      {/* No outputs */}
    </BaseNodeShell>
  );
};

export default HandoffNode;
