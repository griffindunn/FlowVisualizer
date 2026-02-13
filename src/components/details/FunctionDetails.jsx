import React from 'react';
import { commonStyles as s } from './commonStyles';

const FunctionDetails = ({ details }) => {
  const renderMapping = (vars, arrow = '←') => {
    if (!vars) return null;
    return vars.map((v, i) => (
       <div key={i} style={{marginBottom: 4, fontSize: 12}}>
         <span style={{color:'#666'}}>{v.target || v.outputVariable}</span> {arrow} <strong>{v.src || v.jsonPathExp}</strong>
       </div>
    ));
  };

  return (
    <>
      <div style={s.section}>
        <div style={s.sectionTitle}>Custom Function</div>
        <div style={s.row}><span style={s.label}>Function Name</span><span style={s.value}>{details.fnName}</span></div>
        <div style={s.row}><span style={s.label}>Version</span><span style={s.value}>{details.fnVersionConfig?.version}</span></div>
      </div>
      
      <div style={s.section}>
        <div style={s.sectionTitle}>Inputs</div>
        {renderMapping(details.fnInputVariables, '←')}
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Outputs</div>
        {renderMapping(details.fnOutputVariables, '→')}
      </div>
    </>
  );
};
export default FunctionDetails;
