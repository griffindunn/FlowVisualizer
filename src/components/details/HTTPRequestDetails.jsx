import React from 'react';
import { commonStyles as s } from './commonStyles';

const HTTPRequestDetails = ({ details }) => {
  // Helper to render query params or headers
  const renderMap = (obj, title) => {
    if (!obj || Object.keys(obj).length === 0) return null;
    return (
      <div style={s.section}>
        <div style={s.sectionTitle}>{title}</div>
        {Object.entries(obj).map(([k, v], i) => (
           <div key={i} style={s.row}>
             <span style={s.label}>{k}</span>
             <span style={s.value}>{String(v)}</span>
           </div>
        ))}
      </div>
    );
  };

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
        <div style={s.sectionTitle}>Request Config</div>
        <div style={s.row}><span style={s.label}>Method</span><span style={s.value}>{details.httpRequestMethod}</span></div>
        <div style={s.row}><span style={s.label}>URL</span><span style={s.value}>{details.httpRequestUrl}</span></div>
        <div style={s.row}><span style={s.label}>Content Type</span><span style={s.value}>{details.httpContentType}</span></div>
        <div style={s.row}><span style={s.label}>Timeout</span><span style={s.value}>{details.httpResponseTimeout}ms</span></div>
      </div>
      {renderMap(details.httpQueryParameters, "Query Parameters")}
      {renderMap(details.httpRequestHeaders, "Headers")}
      
      <div style={s.section}>
        <div style={s.sectionTitle}>Output Parsing</div>
        {renderOutputs(details.outputVariableArray)}
      </div>
    </>
  );
};
export default HTTPRequestDetails;
