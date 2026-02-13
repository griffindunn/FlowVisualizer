const EDGE_TYPE = 'smoothstep'; 

export const transformWxccJson = (json) => {
  const nodes = [];
  const edges = [];
  let currentYOffset = 2500; 

  // Helper to process a specific flow scope
  const processFlowScope = (flowData, prefix = '', isEvent = false) => {
    if (!flowData || !flowData.activities) return;

    const { activities, links } = flowData;
    // CRITICAL FIX: Ensure we are reading the widget data from the correct path
    const widgets = flowData.diagram?.widgets || {}; 

    Object.values(activities).forEach((activity, index) => {
      // Look up the layout widget using the activity ID
      const widget = widgets[activity.id];
      
      // If widget exists, use its X/Y. If not, use a basic grid fallback (index * 150)
      // so they don't stack on top of each other.
      const x = widget?.point?.x || (index * 250); 
      const y = widget?.point?.y || (index * 100);

      nodes.push({
        id: `${prefix}${activity.id}`,
        type: 'wxccNode', 
        position: { x: x, y: y + (isEvent ? currentYOffset : 0) },
        data: {
          label: activity.name,
          nodeType: activity.activityName, 
          details: activity.properties,    
          isEventNode: isEvent             
        },
      });
    });

    if (links) {
      links.forEach((link) => {
        edges.push({
          id: `${prefix}${link.id}`,
          source: `${prefix}${link.sourceActivityId}`,
          target: `${prefix}${link.targetActivityId}`,
          type: EDGE_TYPE, 
          label: link.conditionExpr, 
          style: { stroke: isEvent ? '#999' : '#555', strokeWidth: 1.5 }, 
          data: { isEventEdge: isEvent }
        });
      });
    }
  };

  // --- Process Main Flow ---
  if (json.process) {
    processFlowScope(json.process, '', false);
  }

  // --- Process Event Flows ---
  if (json.eventFlows && json.eventFlows.eventsMap) {
    Object.entries(json.eventFlows.eventsMap).forEach(([eventName, eventData]) => {
      // Add Header
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
      // Increase offset for the next cluster
      currentYOffset += 2000;
    });
  }

  return { nodes, edges };
};
