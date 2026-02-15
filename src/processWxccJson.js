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

    const { activities, links } = flowData;
    const activityList = Object.values(activities);

    // --- 1. PROCESS NODES ---
    activityList.forEach((activity, index) => {
      const widget = getWidget(activity.id, diagramData);
      
      let x = 0;
      let y = 0;

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
      
      let details = { ...activity.properties };
      const props = activity.properties || {};

      // --- COMMON LOGIC: Extract "menuLinks" (Used by Menu AND Case nodes) ---
      // We process this into an ordered Array: [{ id: "1", label: "Sales" }, ...]
      const processMenuLinks = () => {
          const extracted = [];
          // 1. Try Parallel Arrays (The "Smoking Gun" Pattern)
          // Note: Case nodes in your file use 'menuLinks' too!
          const keys = props.menuLinks || [];
          const labels = props["menuLinks:input"] || props.menuLinks_input || []; 

          if (Array.isArray(keys) && keys.length > 0) {
              keys.forEach((key, i) => {
                  extracted.push({
                      id: key,
                      label: labels[i] || `Option ${key}`
                  });
              });
          } else {
              // 2. Fallback: Global Wires (if properties are empty)
              const myLinks = (links || []).filter(l => l.sourceActivityId === activity.id);
              myLinks.forEach(link => {
                  const key = link.interactionCondition || link.name;
                  // Filter errors
                  const isSystem = ['error', 'timeout', 'invalid', 'failure'].some(k => String(key).includes(k));
                  if (key && !isSystem && key !== 'default') {
                      extracted.push({
                          id: key,
                          label: link.label || link.displayName || key
                      });
                  }
              });
          }
          return extracted;
      };

      // Apply to Menu Node
      if (nodeType === 'MenuNode') {
          details.choices = processMenuLinks();
      }

      // Apply to Case Node (Now uses same logic!)
      if (nodeType === 'CaseNode') {
          details.cases = processMenuLinks();
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

    // --- 2. PROCESS EDGES ---
    if (links) {
      links.forEach((link) => {
        let rawHandleId = link.interactionCondition || link.name || link.conditionExpr;
        
        // --- HANDLE NORMALIZATION FIX ---
        const sourceNode = activities[link.sourceActivityId];
        const sourceNodeTypeString = sourceNode 
            ? (sourceNode.properties?.activityName || sourceNode.activityName || 'unknown') 
            : 'unknown';
        const config = getNodeConfig(sourceNodeTypeString);
        const componentType = config.nodeType;

        let finalHandleId = 'default'; 

        // Error detection
        const isErrorPath = ['error', 'failure', 'invalid', 'false', 'insufficient_data', 'busy', 'no_answer', 'exception'].some(k => String(rawHandleId).toLowerCase().includes(k));
        const isTimeout = String(rawHandleId).toLowerCase().includes('timeout');

        if (isErrorPath) {
            if (String(rawHandleId).toLowerCase().includes('busy')) finalHandleId = 'busy';
            else if (String(rawHandleId).toLowerCase().includes('no_answer')) finalHandleId = 'no_answer';
            else if (String(rawHandleId).toLowerCase().includes('invalid')) finalHandleId = 'invalid';
            else if (String(rawHandleId).toLowerCase().includes('insufficient')) finalHandleId = 'insufficient_data';
            else if (String(rawHandleId).toLowerCase().includes('failure')) finalHandleId = 'failure';
            else finalHandleId = 'error'; 
        } else if (isTimeout) {
            finalHandleId = 'timeout';
        } else {
            // HAPPY PATH LOGIC
            // If it is a decision node (Menu/Case), use the specific key (1, 2, Test, Dev)
            if (componentType === 'MenuNode' || componentType === 'CaseNode') {
                finalHandleId = rawHandleId; 
            } else {
                // FORCE EVERYTHING ELSE TO DEFAULT
                // This fixes the "Missing Lines" on Set Variable nodes.
                // Even if the JSON link is named "Done" or "True", we force it to connect to 'default'.
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
