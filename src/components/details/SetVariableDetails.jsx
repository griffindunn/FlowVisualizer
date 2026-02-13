import React from 'react';
import { commonStyles as s } from './commonStyles';

const SetVariableDetails = ({ details }) => {
  const vars = details.setVariablesArray || [];
  return (
    <div style={s.section}>
      <div style={s.sectionTitle}>Variables Configured ({vars.length})</div>
      {vars.length === 0 && <div style={{color: '#999'}}>No variables set.</div>}
      
      {vars.map((v, i) => (
        <div key={i} style={{marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dashed #eee'}}>
           <div style={s.row}><span style={s.label}>Variable</span><span style={{fontWeight: 'bold', color: '#005073'}}>{v.srcVariable || v.name}</span></div>
           <div style={s.row}><span style={s.label}>Value</span><span style={s.value}>{v.literal || v.value}</span></div>
        </div>
      ))}
    </div>
  );
};
export default SetVariableDetails;
