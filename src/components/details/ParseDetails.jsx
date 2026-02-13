import React from 'react';
import { commonStyles as s } from './commonStyles';

const ParseDetails = ({ details }) => {
  const renderOutputs = (vars) => {
    if (!vars) return null;
    return vars.map((v, i) => (
       <div key={i} style={{marginBottom: 4, fontSize: 12}}>
         <span style={{color:'#666'}}>{v.outputVariable}</span> ← <code>{v.jsonPathExp}</code>
       </div>
    ));
  };

  return (
    <>
      <div style={s.section}>
        <div style={s.sectionTitle}>Parse Configuration</div>
        <div style={s.row}><span style={s.label}>Input Variable</span><span style={s.value}>{details.inputVariable}</span></div>
        <div style={s.row}><span style={s.label}>Format</span><span style={s.value}>{details.contentType}</span></div>
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Output Mapping</div>
        {renderOutputs(details.outputVariableArray)}
      </div>
    </>
  );
};
export default ParseDetails;
