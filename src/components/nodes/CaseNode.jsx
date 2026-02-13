import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';
import { nodeRowStyles as row } from './nodeRowStyles';

const CaseNode = ({ data, selected }) => {
  const { details } = data;
  
  // Case nodes map conditionExpr keys to output branches
  // We filter out 'default' and '0' from the dynamic list because we handle Default explicitly at the bottom
  const branches = details?.menuLinks?.filter(k => k !== 'default' && k !== '0') || [];

  return (
    <BaseNodeShell data={data} selected={selected}>
      {branches.length > 0 && <div style={row.sectionTitle}>Cases</div>}
      
      {branches.map((key) => (
         <div key={key} style={row.container}>
           <div style={row.box}>{key}</div>
           <Handle type="source" position={Position.Right} id={key} style={row.handleRight} />
         </div>
      ))}

      {/* Explicit Default Path at the bottom */}
      <div style={row.container}>
         <div style={row.box}>Default</div>
         <Handle type="source" position={Position.Right} id="default" style={row.handleRight} />
         
         {/* Hidden fallback handle for '0' or 'false' if the JSON uses that instead of default */}
         <Handle type="source" position={Position.Right} id="0" style={{...row.handleRight, opacity: 0, pointerEvents: 'none'}} />
      </div>
      
      {/* Divider and Error (if any exists, though getValidExits usually hides this for Case) */}
      {/* We leave this generic check just in case validExits changes later */}
    </BaseNodeShell>
  );
};
export default memo(CaseNode);
