import React from 'react';
import { commonStyles as s } from './commonStyles';

const BusinessHoursDetails = ({ details }) => (
  <div style={s.section}>
    <div style={s.sectionTitle}>Schedule</div>
    <div style={s.row}><span style={s.label}>Name</span><span style={s.value}>{details['businessHoursId:name'] || details.businessHoursId}</span></div>
    <div style={s.row}><span style={s.label}>Mode</span><span style={s.value}>{details.businessHoursRadioGroup}</span></div>
  </div>
);
export default BusinessHoursDetails;
