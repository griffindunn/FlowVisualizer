import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const StartNode = ({ data, selected }) => (
  <BaseNodeShell data={data} selected={selected} showInput={false}>
     <div style={row.container}>
       <span style={row.successLabel}>New Call</span>
       <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
    </div>
  </BaseNodeShell>
);
export default memo(StartNode);
