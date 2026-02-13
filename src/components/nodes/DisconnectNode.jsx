import React, { memo } from 'react';
import BaseNodeShell from './BaseNodeShell';

const DisconnectNode = ({ data, selected }) => {
  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{padding: '12px 10px', textAlign: 'center'}}>
         <div style={{
             display: 'inline-block', padding: '4px 12px', background: '#FFEBEE', 
             color: '#D32F2F', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
             border: '1px solid #FFCDD2'
         }}>
            ⛔ End of Flow
         </div>
      </div>
    </BaseNodeShell>
  );
};
export default memo(DisconnectNode);
