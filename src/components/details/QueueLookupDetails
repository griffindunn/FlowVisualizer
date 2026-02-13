import React from 'react';
import { commonStyles as s } from './commonStyles';

const QueueLookupDetails = ({ details }) => (
  <>
    <div style={s.section}>
      <div style={s.sectionTitle}>Lookup Settings</div>
      <div style={s.row}>
         <span style={s.label}>Lookback Period</span>
         <span style={s.value}>{details.ewtLookbackMinutes} minutes</span>
      </div>
      <div style={s.row}>
         <span style={s.label}>Queue ID/Name</span>
         <span style={s.value}>{details.destination || details['destination:name']}</span>
      </div>
    </div>
  </>
);
export default QueueLookupDetails;
