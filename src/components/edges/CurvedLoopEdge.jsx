import React from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer } from 'reactflow';

const CurvedLoopEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  id
}) => {
  // Check if the target is behind the source (Backward Loop)
  // We add a buffer (e.g., 50px) to handle nodes that are stacked directly vertically too
  const isBackward = targetX < sourceX + 50;

  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (isBackward) {
    // --- CUSTOM LOOP PATH LOGIC ---
    // We want to curve UP and OVER.
    // Logic: 
    // 1. Move Right from Source
    // 2. Curve Up high above the highest point
    // 3. Curve Down to Target
    
    // Determine the "ceiling" for the loop. 
    // It should be higher than both points.
    const highestY = Math.min(sourceY, targetY);
    const loopHeight = 80; // How high the loop goes above the nodes
    
    // Control Points
    const c1x = sourceX + 80; // Out to the right
    const c1y = highestY - loopHeight; // Up
    const c2x = targetX - 80; // Out to the left
    const c2y = highestY - loopHeight; // Up

    edgePath = `M ${sourceX} ${sourceY} C ${c1x} ${c1y} ${c2x} ${c2y} ${targetX} ${targetY}`;
    
    // Approximate center for label (if needed)
    labelX = (sourceX + targetX) / 2;
    labelY = c1y; 

  } else {
    // --- STANDARD FORWARD PATH ---
    // Use React Flow's built-in bezier for normal left-to-right flow
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      curvature: 0.35 // Slightly tighter curve than default
    });
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
    </>
  );
};

export default CurvedLoopEdge;
