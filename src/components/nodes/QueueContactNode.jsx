import SimpleActionNode from './SimpleActionNode';
import React, { memo } from 'react';
export default memo((props) => <SimpleActionNode {...props} exits={['failure', 'error']} />);
