const EDGE_TYPE = 'smoothstep'; 

export const transformWxccJson = (json) => {
  const nodes = [];
  const edges = [];
  let currentYOffset = 2500; 

  const processFlowScope = (flowData, prefix = '', isEvent = false) => {
    if (!flowData || !flowData.activities) return;
    const { activities, links } = flowData;
    const widgets = flowData.diagram?.widgets || {};

    Object.values(activities).forEach((activity) => {
      const widget = widgets[activity.id];
      const x = widget?.point?.x || 0;
      const y = widget?.point?.y || 0;

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

  if (json.process) {
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
      currentYOffset += 2000;
    });
  }

  return { nodes, edges };
};
