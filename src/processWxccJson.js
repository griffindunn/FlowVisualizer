// src/processWxccJson.js
import { MarkerType } from 'reactflow';

// 'default' = Bezier Curve (prevents lines from merging into one trunk)
const EDGE_TYPE = 'default'; 
const SPACING_FACTOR = 1.5; // Spreads nodes out to give lines room

export const transformWxccJson = (json) => {
  const nodes = [];
  const edges = [];
  let currentYOffset = 2500; 

  const processFlowScope = (flowData, prefix = '', isEvent = false) => {
    if (!flowData || !flowData.activities) return;

    const { activities, links } = flowData;
    const widgets = flowData.diagram?.widgets || json.diagram?.widgets || {}; 

    Object.values(activities).forEach((activity, index) => {
      const widget = widgets[activity.id];
      
      // 1. Coordinates with Spacing Factor
      let x = 0;
      let y = 0;

      if (widget?.point) {
        x = widget.point.x * SPACING_FACTOR;
        y = widget.point.y * SPACING_FACTOR;
      } else {
        // Fallback grid if no widgets found
        const row = Math.floor(index / 5);
        const col = index % 5;
        x = col * 400; 
        y = row * 300;
      }
      
      // Offset event flows vertically so they don't overlap main flow
      y = y + (isEvent ? currentYOffset : 0);

      // 2. Node Type Extraction
      const rawType = activity.properties?.activityName || activity.activityName || 'unknown';

      nodes.push({
        id: `${prefix}${activity.id}`,
        type: 'wxccNode', 
        position: { x, y },
        data: {
          label: activity.name,
          nodeType: rawType,
          details: activity.properties,    
          isEventNode: isEvent             
        },
      });
    });

    if (links) {
      links.forEach((link) => {
        const sourceHandleId = link.conditionExpr || 'default';
        
        edges.push({
          id: `${prefix}${link.id}`,
          source: `${prefix}${link.sourceActivityId}`,
          target: `${prefix}${link.targetActivityId}`,
          sourceHandle: sourceHandleId, 
          type: EDGE_TYPE,
          // Removed 'label' property per request
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: isEvent ? '#999' : '#555',
          },
          style: { 
            stroke: isEvent ? '#bbb' : '#555', 
            strokeWidth: 2 
          }, 
          data: { isEventEdge: isEvent }
        });
      });
    }
  };

  // --- Process Main Flow ---
  if (json.process) {
    console.log("Processing Main Flow...");
    processFlowScope(json.process, '', false);
  }

  // --- Process Event Flows ---
  if (json.eventFlows && json.eventFlows.eventsMap) {
    Object.entries(json.eventFlows.eventsMap).forEach(([eventName, eventData]) => {
      nodes.push({
        id: `header-${eventName}`,
        type: 'groupHeader',
        position: { x: 0, y: currentYOffset - 150 },
        data: { label: `Event: ${eventName}` },
        draggable: false,
      });

      if (eventData.process) {
        processFlowScope(eventData.process, `${eventName}-`, true);
      }
      currentYOffset += 2000;
    });
  }

  return { nodes, edges };
};
