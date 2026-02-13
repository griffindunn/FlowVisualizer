import React from 'react';
import { commonStyles as s } from './commonStyles';

const SubflowDetails = ({ details }) => {
  const renderVars = (vars) => {
    if (!vars) return null;
    return vars.map((v, i) => (
       <div key={i} style={{marginBottom: 4, fontSize: 12}}>
         <span style={{color:'#666'}}>{v.target}</span> ← <strong>{v.src}</strong>
       </div>
    ));
  };

  return (
    <>
       <div style={s.section}>
         <div style={s.sectionTitle}>Flow Info</div>
         <div style={s.row}><span style={s.label}>Name</span><span style={s.value}>{details.subflowName}</span></div>
       </div>
       <div style={s.section}><div style={s.sectionTitle}>Inputs</div>{renderVars(details.subflowInputVariables)}</div>
       <div style={s.section}><div style={s.sectionTitle}>Outputs</div>{renderVars(details.subflowOutputVariables)}</div>
    </>
  );
};
export default SubflowDetails;
