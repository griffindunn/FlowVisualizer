import SimpleActionNode from './SimpleActionNode';
import React, { memo } from 'react';

// Force 'exits' to be empty to prevent the "Undefined Error" handle
export default memo((props) => <SimpleActionNode {...props} exits={[]} />);
