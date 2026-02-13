import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const ConditionNode = ({ data, selected }) => {
  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={row.sectionTitle}>Paths</div>
      <div style={row.container}>
         <div style={row.box}>True</div>
         <Handle type="source" position={Position.Right} id="true" style={row.handleRight} />
      </div>
      <div style={row.container}>
         <div style={row.box}>False</div>
         <Handle type="source" position={Position.Right} id="false" style={row.handleRight} />
         {/* Mapping False to Default internally sometimes, so add a hidden handle just in case */}
         <Handle type="source" position={Position.Right} id="default" style={{...row.handleRight, opacity: 0}} />
      </div>
      <div style={row.divider} />
      <div style={row.errorContainer}>
         <span style={row.errorLabel}>Undefined Error</span>
         <Handle type="source" position={Position.Right} id="error" style={row.handleError} />
      </div>
    </BaseNodeShell>
  );
};
export default memo(ConditionNode);
