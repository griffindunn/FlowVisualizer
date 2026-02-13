import React from 'react';
import { commonStyles as s } from './commonStyles';

const BusinessHoursDetails = ({ details }) => (
  <div style={s.section}>
    <div style={s.sectionTitle}>Schedule Configuration</div>
    <div style={s.row}>
       <span style={s.label}>Schedule Name</span>
       <span style={s.value}>{details['businessHoursId:name'] || details.businessHoursId}</span>
    </div>
    <div style={s.row}>
       <span style={s.label}>Input Mode</span>
       <span style={s.value}>{details.businessHoursRadioGroup === 'staticBusinessHours' ? 'Static Schedule' : 'Variable'}</span>
    </div>
  </div>
);
export default BusinessHoursDetails;
