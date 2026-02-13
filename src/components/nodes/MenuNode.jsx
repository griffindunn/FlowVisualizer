import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const MenuNode = ({ data, selected }) => {
  const { details } = data;
  const links = details?.menuLinks?.map((key, idx) => ({
      id: key,
      label: details['menuLinks:input']?.[idx] || `Option ${key}`
  })) || [];

  return (
    <BaseNodeShell data={data} selected={selected}>
      {links.length > 0 && <div style={row.sectionTitle}>Choices</div>}
      
      {links.map((link, index) => (
        // Conditional Style: If it's the first item (index 0), use the aligned container
        <div key={link.id} style={index === 0 ? row.firstRowContainer : row.container}>
          <div style={row.pill}>{link.id}</div>
          <div style={row.box} title={link.label}>{link.label}</div>
          <Handle type="source" position={Position.Right} id={link.id} style={row.handleRight} />
        </div>
      ))}

      <div style={row.divider} />
      {['timeout', 'invalid', 'error'].map(key => (
        <div key={key} style={row.errorContainer}>
           <span style={row.errorLabel}>{key}</span>
           <Handle type="source" position={Position.Right} id={key} style={row.handleError} />
        </div>
      ))}
    </BaseNodeShell>
  );
};
export default memo(MenuNode);
