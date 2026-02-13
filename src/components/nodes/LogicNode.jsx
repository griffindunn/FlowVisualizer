import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const LogicNode = memo(({ data, selected }) => {
  const { details, nodeType } = data;
  const t = nodeType.toLowerCase();
  let branches = [];
  if (details?.menuLinks) {
     branches = details.menuLinks.filter(k => k !== 'default' && k !== '0').map(k => ({ id: k, label: k }));
  }
  if (t.includes('business')) {
     branches = [{ id: 'workingHours', label: 'Open' }, { id: 'holidays', label: 'Holiday' }, { id: 'override', label: 'Override' }];
  }

  return (
    <BaseNodeShell data={data} selected={selected}>
      {branches.length > 0 && <div style={row.sectionTitle}>Conditions</div>}
      {branches.map((branch) => (
         <div key={branch.id} style={row.container}>
           <div style={row.box}>{branch.label}</div>
           <Handle type="source" position={Position.Right} id={branch.id} style={row.handleRight} />
         </div>
      ))}
      <div style={row.container}>
         <div style={row.box}>Default / False</div>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
         <Handle type="source" position={Position.Right} id="0" style={{...row.handleRight, opacity: 0}} />
         <Handle type="source" position={Position.Right} id="false" style={{...row.handleRight, opacity: 0}} />
      </div>
      <div style={row.divider} />
      <div style={row.errorContainer}>
         <span style={row.errorLabel}>Undefined Error</span>
         <Handle type="source" position={Position.Right} id="error" style={row.handleError} />
      </div>
    </BaseNodeShell>
  );
});
export default LogicNode;
