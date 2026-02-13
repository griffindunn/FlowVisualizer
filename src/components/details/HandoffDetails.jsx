import React from 'react';
import { commonStyles as s } from './commonStyles';

const HandoffDetails = ({ details }) => {
  const flow = details.handOffFlow || {};

  return (
    <>
      <div style={s.section}>
        <div style={s.sectionTitle}>Flow Handoff</div>
        <div style={s.row}><span style={s.label}>Flow Name</span><span style={s.value}>{flow.handOffToName}</span></div>
        <div style={s.row}><span style={s.label}>Flow ID</span><span style={s.value}>{flow.handOffTo}</span></div>
        <div style={s.row}><span style={s.label}>Tag</span><span style={s.value}>{flow.flowTagName || 'Latest'}</span></div>
      </div>

      {/* If there are variable mappings for the handoff, they usually appear here */}
      {flow.mappedVariableArray && (
         <div style={s.section}>
            <div style={s.sectionTitle}>Variable Mapping</div>
            <div style={s.codeBlock}>{flow.mappedVariableArray}</div>
         </div>
      )}
    </>
  );
};
export default HandoffDetails;
