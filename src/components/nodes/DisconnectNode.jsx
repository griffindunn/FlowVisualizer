import React, { memo } from 'react';
import BaseNodeShell from './BaseNodeShell';
// Disconnect has NO exits.
const DisconnectNode = ({ data, selected }) => (
  <BaseNodeShell data={data} selected={selected}>
    <div style={{padding: '10px', color: '#999', fontSize: '12px', textAlign: 'center'}}>
      End of Flow
    </div>
  </BaseNodeShell>
);
export default memo(DisconnectNode);
