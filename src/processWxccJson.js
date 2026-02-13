// src/processWxccJson.js
const EDGE_TYPE = 'smoothstep'; // 'default', 'straight', 'step', 'smoothstep'

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
      
      // 1. Coordinates
      let x = widget?.point?.x;
      let y = widget?.point?.y;

      if (!x && !y) {
        const row = Math.floor(index / 5);
        const col = index % 5;
        x = col * 350; 
        y = row * 200;
      }
      y = y + (isEvent ? currentYOffset : 0);

      // 2. Node Type Extraction (CRITICAL FIX)
      // We look in activity.properties first, then fallback to activity root
      const rawType = activity.properties?.activityName || activity.activityName || 'unknown';

      nodes.push({
        id: `${prefix}${activity.id}`,
        type: 'wxccNode', 
        position: { x, y },
        data: {
          label: activity.name,
          nodeType: rawType, // Corrected Path
          details: activity.properties,    
          isEventNode: isEvent             
        },
      });
    });

    if (links) {
      links.forEach((link) => {
        // We use conditionExpr (e.g., "1", "timeout") as the handle ID
        // This allows the line to start from the specific "1" port on the node
        const sourceHandleId = link.conditionExpr || 'default';
        
        edges.push({
          id: `${prefix}${link.id}`,
          source: `${prefix}${link.sourceActivityId}`,
          target: `${prefix}${link.targetActivityId}`,
          sourceHandle: sourceHandleId, // <--- Connects to specific right-side port
          type: EDGE_TYPE, 
          label: link.conditionExpr, 
          style: { stroke: isEvent ? '#999' : '#555', strokeWidth: 1.5 }, 
          data: { isEventEdge: isEvent }
        });
      });
    }
  };

  if (json.process) {
    console.log("Processing Main Flow...");
    processFlowScope(json.process, '', false);
  }

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
      currentYOffset += 1500;
    });
  }

  return { nodes, edges };
};
