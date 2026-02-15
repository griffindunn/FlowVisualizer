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

    const { activities, links } = flowData;
    const activityList = Object.values(activities);

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
      
      // Determine Node Type
      let nodeType = config.nodeType || 'DefaultNode';
      
      // --- MANUAL OVERRIDE for SetCallerID ---
      if (rawType === 'SetCallerID') {
          nodeType = 'SetCallerIDNode';
      }

      let details = { ...activity.properties };
      const props = activity.properties || {};

      // MENU & CASE CHOICES
      const extractChoices = (propKeys, propLabels) => {
          const extracted = [];
          const keys = props[propKeys] || [];
          const labels = props[propLabels] || props[propLabels.replace(':', '_')] || [];
          
          if (Array.isArray(keys) && keys.length > 0) {
              keys.forEach((key, i) => {
                  extracted.push({
                      id: key,
                      label: labels[i] || key 
                  });
              });
          }
          return extracted;
      };

      if (nodeType === 'MenuNode') {
          let choices = extractChoices('menuLinks', 'menuLinks:input');
          if (choices.length === 0) {
             const myLinks = (links || []).filter(l => l.sourceActivityId === activity.id);
             myLinks.forEach(l => {
                 const k = l.interactionCondition || l.name;
                 if(k && !['error','timeout','invalid'].some(s=>String(k).includes(s))) {
                     choices.push({id: k, label: l.label || l.displayName || k});
                 }
             });
          }
          details.choices = choices;
      }

      if (nodeType === 'CaseNode') {
          let cases = extractChoices('menuLinks', 'menuLinks:input');
          if (cases.length === 0) cases = extractChoices('queueLinks', 'queueLinks:input');
          details.cases = cases;
      }

      // PLAY MESSAGE TTS
      if (nodeType === 'PlayMessageNode' && !details.message) {
          if (details.promptsTts && details.promptsTts.length > 0) {
              details.message = details.promptsTts[0].value || details.promptsTts[0].name;
          } else if (details.prompts && details.prompts.length > 0) {
              details.message = details.prompts[0].value || details.prompts[0].name;
          }
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
        let rawHandleId = link.interactionCondition || link.name || link.conditionExpr;
        
        const sourceNode = activities[link.sourceActivityId];
        const sourceNodeTypeString = sourceNode 
            ? (sourceNode.properties?.activityName || sourceNode.activityName || 'unknown') 
            : 'unknown';
        const config = getNodeConfig(sourceNodeTypeString);
        const componentType = config.nodeType;

        let finalHandleId = 'default';

        const isErrorPath = ['error', 'failure', 'invalid', 'false', 'insufficient', 'busy', 'no_answer', 'exception'].some(k => String(rawHandleId).toLowerCase().includes(k));
        const isTimeout = String(rawHandleId).toLowerCase().includes('timeout');

        // --- PREVENT EDGES FROM SET CALLER ID ---
        if (sourceNodeTypeString === 'SetCallerID') {
            return; // Skip edge creation for this node
        }

        if (componentType === 'BusinessHoursNode') {
            const lowerName = String(rawHandleId).toLowerCase();
            const lowerLabel = String(link.label || '').toLowerCase();
            if (lowerName.includes('open') || lowerName.includes('working') || lowerLabel.includes('open')) finalHandleId = 'workingHours';
            else if (lowerName.includes('holiday') || lowerLabel.includes('holiday')) finalHandleId = 'holiday';
            else if (lowerName.includes('force') || lowerName.includes('override') || lowerLabel.includes('override')) finalHandleId = 'override';
            else if (isErrorPath) finalHandleId = 'error';
            else finalHandleId = 'default';
        } 
        else if (componentType === 'ConditionNode') {
            const lower = String(rawHandleId).toLowerCase();
            if (lower === 'true' || lower === '1') finalHandleId = 'true';
            else if (lower === 'false' || lower === '0') finalHandleId = 'false';
            else if (isErrorPath) finalHandleId = 'error';
            else finalHandleId = 'default';
        }
        else if (isErrorPath) {
            if (String(rawHandleId).toLowerCase().includes('busy')) finalHandleId = 'busy';
            else if (String(rawHandleId).toLowerCase().includes('no_answer')) finalHandleId = 'no_answer';
            else if (String(rawHandleId).toLowerCase().includes('invalid')) finalHandleId = 'invalid';
            else if (String(rawHandleId).toLowerCase().includes('insufficient')) finalHandleId = 'insufficient_data';
            else if (String(rawHandleId).toLowerCase().includes('failure')) finalHandleId = 'failure';
            else finalHandleId = 'error'; 
        } else if (isTimeout) {
            finalHandleId = 'timeout';
        } else {
            if (componentType === 'MenuNode' || componentType === 'CaseNode') {
                finalHandleId = rawHandleId; 
            } else {
                finalHandleId = 'default';
            }
        }

        const isRedLine = isErrorPath || isTimeout;
        const color = isRedLine ? '#D32F2F' : '#555';
        const zIndex = isRedLine ? 1999 : 2000;

        rawEdges.push({
          id: `${prefix}${link.id}`,
          source: `${prefix}${link.sourceActivityId}`,
          target: `${prefix}${link.targetActivityId}`,
          sourceHandle: finalHandleId, 
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

  if (json.process) {
    processFlowScope(json.process, json.diagram, '', false, 0);
  }

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

  const sortedEdges = rawEdges.sort((a, b) => {
      const scoreA = a.data.isRedLine ? 0 : 1; 
      const scoreB = b.data.isRedLine ? 0 : 1;
      return scoreA - scoreB; 
  });

  return { nodes, edges: sortedEdges };
};
