import React from 'react';
import { commonStyles as s } from './commonStyles';

const StartDetails = ({ details }) => (
  <div style={s.section}>
    <div style={s.sectionTitle}>Trigger Information</div>
    <div style={s.row}><span style={s.label}>Event Name</span><span style={s.value}>{details.event}</span></div>
    <div style={s.row}><span style={s.label}>Channel</span><span style={s.value}>{details.channel || 'Telephony'}</span></div>
    <div style={s.row}><span style={s.label}>Specification</span><span style={s.value}>{details.eventSpecificationName}</span></div>
  </div>
);
export default StartDetails;
