import React from 'react';
import { commonStyles as s } from './commonStyles';

const BRERequestDetails = ({ details }) => {
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
        <div style={s.sectionTitle}>Business Rules Engine</div>
        <div style={s.row}><span style={s.label}>URL</span><span style={s.value}>{details.httpRequestUrl || 'System Default'}</span></div>
        <div style={s.row}><span style={s.label}>Timeout</span><span style={s.value}>{details.httpResponseTimeout}ms</span></div>
      </div>
      
      <div style={s.section}>
        <div style={s.sectionTitle}>Input Parameters</div>
        {details.httpQueryParameters && Object.entries(details.httpQueryParameters).map(([k, v], i) => (
           <div key={i} style={s.row}>
             <span style={s.label}>{k}</span>
             <span style={s.value}>{String(v)}</span>
           </div>
        ))}
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Output Parsing</div>
        {renderOutputs(details.outputVariableArray)}
      </div>
    </>
  );
};
export default BRERequestDetails;
