import React from 'react';
import { commonStyles as s } from './commonStyles';

const ConditionDetails = ({ details }) => (
  <>
    <div style={s.section}>
      <div style={s.sectionTitle}>Configuration</div>
      <div style={s.row}><span style={s.label}>Description</span><span style={s.value}>{details.description}</span></div>
    </div>
    {details.expression && (
        <div style={s.section}>
           <div style={s.sectionTitle}>Expression</div>
           <div style={s.codeBlock}>{details.expression}</div>
        </div>
    )}
  </>
);
export default ConditionDetails;
