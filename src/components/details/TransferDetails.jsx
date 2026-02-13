import React from 'react';
import { commonStyles as s } from './commonStyles';

const TransferDetails = ({ details }) => {
  const isHandOff = !!details.handOffFlow;
  return (
    <div style={s.section}>
      <div style={s.sectionTitle}>{isHandOff ? 'Flow Handoff' : 'Blind Transfer'}</div>
      {isHandOff ? (
          <>
          <div style={s.row}><span style={s.label}>Flow Name</span><span style={s.value}>{details.handOffFlow?.handOffToName}</span></div>
          <div style={s.row}><span style={s.label}>Flow ID</span><span style={s.value}>{details.handOffFlow?.handOffTo}</span></div>
          </>
      ) : (
          <div style={s.row}><span style={s.label}>Destination</span><span style={s.value}>{details.transfertodn || details['transfertodn:name']}</span></div>
      )}
    </div>
  );
};
export default TransferDetails;
