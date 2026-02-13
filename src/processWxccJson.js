const EDGE_TYPE = 'smoothstep'; 

export const transformWxccJson = (json) => {
  const nodes = [];
  const edges = [];
  let currentYOffset = 2500; 

  // Helper to process a specific flow scope
  const processFlowScope = (flowData, prefix = '', isEvent = false) => {
    if (!flowData || !flowData.activities) return;

    const { activities, links } = flowData;
    // Safely attempt to read widgets. Some exports nest them differently.
    const widgets = flowData.diagram?.widgets || json.diagram?.widgets || {}; 

    // Convert Object to Array for iteration
    Object.values(activities).forEach((activity, index) => {
      // 1. Try to find the layout widget for this activity
      const widget = widgets[activity.id];
      
      // 2. Determine Coordinates
      // Primary: Use the JSON coordinates
      // Fallback: If missing (0,0), calculate a Grid Position (Index * Offset)
      let x = widget?.point?.x;
      let y = widget?.point?.y;

      if (!x && !y) {
        // Fallback Layout: 5 nodes per row
        const row = Math.floor(index / 5);
        const col = index % 5;
        x = col * 300; 
        y = row * 150;
      }

      // Apply the Global Y Offset (for Event flows)
      y = y + (isEvent ? currentYOffset : 0);

      nodes.push({
        id: `${prefix}${activity.id}`,
        type: 'wxccNode', 
        position: { x: x, y: y },
        data: {
          label: activity.name,
          nodeType: activity.activityName, // Pass the raw type for styling
          details: activity.properties,    
          isEventNode: isEvent             
        },
      });
    });

    // 3. Process Edges
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
    console.log("Processing Main Flow...");
    processFlowScope(json.process, '', false);
  }

  // --- Process Event Flows ---
  if (json.eventFlows && json.eventFlows.eventsMap) {
    console.log("Processing Event Flows...", Object.keys(json.eventFlows.eventsMap));
    Object.entries(json.eventFlows.eventsMap).forEach(([eventName, eventData]) => {
      // Add Header Node
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
      currentYOffset += 1500;
    });
  }

  return { nodes, edges };
};
