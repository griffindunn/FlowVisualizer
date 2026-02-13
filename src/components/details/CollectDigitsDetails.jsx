import React from 'react';
import { commonStyles as s } from './commonStyles';

const CollectDigitsDetails = ({ details }) => (
  <>
    <div style={s.section}>
      <div style={s.sectionTitle}>Input Configuration</div>
      <div style={s.row}><span style={s.label}>Variable Name</span><span style={s.value}>{details.variable}</span></div>
      <div style={s.row}><span style={s.label}>Max Digits</span><span style={s.value}>{details.maxDigits}</span></div>
      <div style={s.row}><span style={s.label}>Min Digits</span><span style={s.value}>{details.minDigits || '1'}</span></div>
      <div style={s.row}><span style={s.label}>Terminator Char</span><span style={s.value}>{details.terminatorSymbol || 'None'}</span></div>
    </div>
    <div style={s.section}>
      <div style={s.sectionTitle}>Timers</div>
      <div style={s.row}><span style={s.label}>Entry Timeout</span><span style={s.value}>{details.entryTimeout}s</span></div>
      <div style={s.row}><span style={s.label}>Inter-Digit Timeout</span><span style={s.value}>{details.interDigitTimeout}s</span></div>
    </div>
  </>
);
export default CollectDigitsDetails;
