import SimpleActionNode from './SimpleActionNode';
import React, { memo } from 'react';

// Force 'exits' to be empty
export default memo((props) => <SimpleActionNode {...props} exits={[]} />);
