// src/processWxccJson.js
import { MarkerType } from 'reactflow';
import { getNodeConfig } from './wxccConfig';

const EDGE_TYPE = 'curvedLoop'; 
const SPACING_FACTOR_X = 2.2; 
const SPACING_FACTOR_Y = 2.2;

export const transformWxccJson = (json) => {
  const nodes = [];
  let rawEdges = []; 
  let maxMainY = 0;

  const getWidget = (id, currentDiagram) => {
    return currentDiagram?.widgets?.[id];
  };

  const processFlowScope = (flowData, diagramData, prefix = '', isEvent = false, startYOffset = 0) => {
    if (!flowData || !flowData.activities) return;

    const { activities, links } = flowData; // 'links' here is the global wiring
    const activityList = Object.values(activities);

    // --- HELPER: Hybrid Link Finder ---
    // Looks for links inside the node AND in the global list to ensure we find choices
    const getLinksForActivity = (activity) => {
        // 1. Internal Definition (Preferred for Labels)
        const internal = activity.links || activity.outcomes || [];
        
        // 2. Global Wiring (Fallback if internal is missing/empty)
        const globalMatches = (links || []).filter(l => l.sourceActivityId === activity.id);
        
        // If we have internal links, return them (they usually have better labels).
        // If not, use the global wires.
        return internal.length > 0 ? internal : globalMatches;
    };

    // --- 1. NODES ---
    activityList.forEach((activity, index) => {
      const widget = getWidget(activity.id, diagramData);
      let x = 0, y = 0;

      if (widget?.point) {
        x = widget.point.x * SPACING_FACTOR_X;
        y = widget.point.y * SPACING_FACTOR_Y;
      } else {
        if (isEvent) {
           x = (index % 2 === 0) ? 0 : 400; 
           y = index * 250;
        } else {
           const col = index % 5;
           const row = Math.floor(index / 5);
           x = col * 450;
           y = row * 300;
        }
      }
      y += startYOffset;
      if (!isEvent && y > maxMainY) maxMainY = y;

      const rawType = activity.properties?.activityName || activity.activityName || 'unknown';
      const config = getNodeConfig(rawType);
      const nodeType = config.nodeType || 'DefaultNode';

      // --- PARSE DETAILS ---
      let details = { ...activity.properties };
      
      // Get all relevant links for this node
      const nodeLinks = getLinksForActivity(activity);

      // LOGIC: Menu Node Choices
      if (nodeType === 'MenuNode') {
        const extractedChoices = {};
        nodeLinks.forEach(link => {
            // Priority: interactionCondition > name > conditionExpr
            const key = link.interactionCondition || link.name || link.conditionExpr;
            
            // Fallback Label: Label > Name > Key
            const label = link.label || link.name || key;

            const isSystem = ['error', 'timeout', 'invalid', 'failure', 'busy', 'no_answer', 'exception'].some(k => String(key).toLowerCase().includes(k));
            
            if (key && !isSystem) {
                extractedChoices[key] = label;
            }
        });
        details.choices = extractedChoices;
      }

      // LOGIC: Case Node Outcomes
      if (nodeType === 'CaseNode') {
        const extractedCases = {};
        nodeLinks.forEach(link => {
            const key = link.interactionCondition || link.name || link.conditionExpr;
            const label = link.label || link.name || key;
            const isSystem = ['error', 'timeout', 'failure', 'default'].some(k => String(key).toLowerCase().includes(k));

            // For Case nodes, "default" is a standard exit, not a case value
            if (key && !isSystem && key !== 'default') {
                extractedCases[key] = label;
            }
        });
        details.cases = extractedCases;
      }

      nodes.push({
        id: `${prefix}${activity.id}`,
        type: nodeType, 
        position: { x, y },
        data: {
          label: activity.name,
          nodeType: rawType,
          details: details, 
          isEventNode: isEvent             
        },
        zIndex: 10 
      });
    });

    // --- 2. EDGES ---
    if (links) {
      links.forEach((link) => {
        // We use the exact same logic to determine the Source Handle ID
        // so the edge connects to the port we just created above.
        let sourceHandleId = link.interactionCondition || link.name || link.conditionExpr;
        
        // Normalize "Success" paths
        if (!sourceHandleId || sourceHandleId === 'true' || sourceHandleId === 'success') {
             sourceHandleId = 'default';
        }

        const isErrorPath = ['error', 'failure', 'invalid', 'false', 'insufficient_data', 'busy', 'no_answer', 'exception'].some(k => String(sourceHandleId).toLowerCase().includes(k));
        const isTimeout = String(sourceHandleId).toLowerCase().includes('timeout');
        
        const isRedLine = isErrorPath || isTimeout;
        const color = isRedLine ? '#D32F2F' : '#555';
        
        // Z-INDEX: 2000 for all edges to sit on top of nodes
        // We lower red lines slightly (1999) so black lines draw over them if they overlap
        const zIndex = isRedLine ? 1999 : 2000; 

        rawEdges.push({
          id: `${prefix}${link.id}`,
          source: `${prefix}${link.sourceActivityId}`,
          target: `${prefix}${link.targetActivityId}`,
          sourceHandle: sourceHandleId, 
          type: EDGE_TYPE, 
          zIndex: zIndex, 
          markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: color },
          style: { stroke: color, strokeWidth: 2 }, 
          data: { 
            isEventEdge: isEvent,
            isRedLine: isRedLine, 
            isHideable: isErrorPath && !isTimeout 
          }
        });
      });
    }
  };

  // Process Main
  // Handle structure: { flow: { process: ... } } OR { process: ... }
  const rootProcess = json.flow ? json.flow.process : json.process;
  const rootDiagram = json.flow ? json.flow.diagram : json.diagram;

  if (rootProcess) {
    processFlowScope(rootProcess, rootDiagram, '', false, 0);
  }

  // Process Events
  let eventCursorY = maxMainY + 2000; 
  if (json.eventFlows && json.eventFlows.eventsMap) {
    Object.entries(json.eventFlows.eventsMap).forEach(([eventName, eventData]) => {
      nodes.push({
        id: `header-${eventName}`,
        type: 'groupHeader',
        position: { x: 0, y: eventCursorY - 150 },
        data: { label: `Event: ${eventName}` },
        draggable: false,
      });

      if (eventData.process) {
        processFlowScope(eventData.process, eventData.diagram, `${eventName}-`, true, eventCursorY);
      }
      
      let blockHeight = 600;
      if(eventData.process?.activities) {
          blockHeight = (Object.keys(eventData.process.activities).length * 150) + 500;
      }
      eventCursorY += blockHeight; 
    });
  }

  // Sort edges so Red lines draw first (behind black lines)
  const sortedEdges = rawEdges.sort((a, b) => {
      const scoreA = a.data.isRedLine ? 0 : 1; 
      const scoreB = b.data.isRedLine ? 0 : 1;
      return scoreA - scoreB; 
  });

  return { nodes, edges: sortedEdges };
};
