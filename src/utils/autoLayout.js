// src/utils/autoLayout.js

export const getLayoutedElements = (nodes, edges) => {
  // --- CONFIGURATION ---
  const NODE_WIDTH = 320; 
  const NODE_HEIGHT = 160; // Card height approx
  const X_SPACING = 500;   // WIDER horizontal gap to prevent text overlap
  const Y_SPACING = 40;    // TIGHTER vertical gap between neighboring cards

  // 1. Helper to find root nodes (nodes with no incoming edges in the current set)
  const getRoots = (nodeSet) => {
    const nodeIds = new Set(nodeSet.map(n => n.id));
    const incomingEdges = new Set(edges.filter(e => nodeIds.has(e.target)).map(e => e.target));
    return nodeSet.filter(n => !incomingEdges.has(n.id) || n.type === 'StartNode' || n.data?.isEventNode);
  };

  // 2. Build Hierarchy Map
  const graph = {};
  nodes.forEach(node => {
    graph[node.id] = { ...node, children: [], width: NODE_WIDTH, height: NODE_HEIGHT, subtreeHeight: 0 };
  });

  edges.forEach(edge => {
    // Only map if both nodes exist (sanity check)
    if (graph[edge.source] && graph[edge.target]) {
      graph[edge.source].children.push(edge.target);
    }
  });

  // 3. MEASURE PHASE (Post-Order Traversal)
  // Calculate the height of every node's subtree
  const measureNode = (nodeId, visited) => {
    if (visited.has(nodeId)) return 0; // Prevent infinite loops
    visited.add(nodeId);

    const node = graph[nodeId];
    if (node.children.length === 0) {
      node.subtreeHeight = NODE_HEIGHT + Y_SPACING;
      return node.subtreeHeight;
    }

    // Sum up height of all children
    let totalChildrenHeight = 0;
    node.children.forEach(childId => {
      totalChildrenHeight += measureNode(childId, visited);
    });

    node.subtreeHeight = Math.max(NODE_HEIGHT + Y_SPACING, totalChildrenHeight);
    return node.subtreeHeight;
  };

  // 4. LAYOUT PHASE (Pre-Order Traversal)
  // Assign X/Y coordinates based on measurements
  const layoutNode = (nodeId, x, y, visited) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = graph[nodeId];
    
    // Position Children
    let currentChildY = y;
    
    // If we have children, we want to center the parent relative to them
    if (node.children.length > 0) {
      node.children.forEach(childId => {
        layoutNode(childId, x + X_SPACING, currentChildY, visited);
        currentChildY += graph[childId].subtreeHeight;
      });

      // Center parent Y: (First Child Y + Last Child Y) / 2
      const firstChild = graph[node.children[0]];
      const lastChild = graph[node.children[node.children.length - 1]];
      
      // Calculate center based on the positions we just assigned
      if (firstChild.tempY !== undefined && lastChild.tempY !== undefined) {
         node.tempY = (firstChild.tempY + lastChild.tempY) / 2;
      } else {
         node.tempY = y + (node.subtreeHeight / 2) - (NODE_HEIGHT / 2);
      }
    } else {
      // Leaf node: just place it
      node.tempY = y;
    }
    
    node.tempX = x;
  };

  // --- EXECUTION ---
  const allNodes = [...nodes];
  
  // Split Main vs Event
  const mainFlowNodes = allNodes.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
  const eventFlowNodes = allNodes.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

  // A. Measure & Layout Main Flow
  const mainRoots = getRoots(mainFlowNodes);
  const measureVisited = new Set();
  mainRoots.forEach(root => measureNode(root.id, measureVisited));

  const layoutVisited = new Set();
  let globalCursorY = 0;

  mainRoots.forEach(root => {
    layoutNode(root.id, 0, globalCursorY, layoutVisited);
    globalCursorY += graph[root.id].subtreeHeight + 100; // Gap between disjoint main trees
  });

  // B. Layout Event Flows (Below Main)
  globalCursorY += 300; // Big gap separator

  const eventRoots = getRoots(eventFlowNodes);
  // Reset visited for events
  const eventMeasureVisited = new Set();
  const eventLayoutVisited = new Set();

  eventRoots.forEach(root => {
    if (root.type === 'groupHeader') {
        // Just place headers linearly
        const node = graph[root.id];
        node.tempX = 0;
        node.tempY = globalCursorY;
        globalCursorY += 100; 
    } else {
        // Measure and layout this event tree
        measureNode(root.id, eventMeasureVisited);
        layoutNode(root.id, 0, globalCursorY, eventLayoutVisited);
        globalCursorY += (graph[root.id].subtreeHeight || NODE_HEIGHT) + 100;
    }
  });

  // 5. Apply Final Positions
  const finalNodes = nodes.map(node => {
    const gNode = graph[node.id];
    if (gNode && gNode.tempX !== undefined) {
      return {
        ...node,
        targetPosition: 'left',
        sourcePosition: 'right',
        position: { x: gNode.tempX, y: gNode.tempY },
      };
    }
    return node;
  });

  return { nodes: finalNodes, edges };
};
