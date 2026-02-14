// src/utils/autoLayout.js

export const getLayoutedElements = (nodes, edges) => {
  // --- CONFIGURATION ---
  const NODE_WIDTH = 300; 
  const NODE_HEIGHT = 120; // Tighter height for PDF density
  const X_SPACING = 350;   // Horizontal gap
  const Y_SPACING = 50;    // Vertical gap between neighbors

  // 1. Initialize Graph Data
  const graph = {};
  nodes.forEach(n => {
    graph[n.id] = { 
      ...n, 
      children: [], // Only "Tree" children (for layout)
      allChildren: [], // All actual connections
      measuredHeight: 0, 
      x: 0, 
      y: 0 
    };
  });

  // 2. Identify Roots (Start Node + Event Headers)
  // We use a set to track all targets to find true roots
  const targets = new Set(edges.map(e => e.target));
  const roots = nodes.filter(n => !targets.has(n.id) || n.type === 'StartNode' || n.data?.isEventNode);

  // 3. Build a Strict Spanning Tree (BFS)
  // This prevents the crash by ensuring every node is visited exactly ONCE for layout purposes.
  // Merges and cycles become "cross-edges" which are drawn but don't affect layout spacing.
  const visited = new Set();
  const queue = [];

  // Sort roots to put Main Flow first
  const sortedRoots = roots.sort((a, b) => {
    if (a.type === 'StartNode') return -1;
    if (a.data?.isEventNode) return 1;
    return 0;
  });

  sortedRoots.forEach(root => {
    if (!visited.has(root.id)) {
      queue.push(root.id);
      visited.add(root.id);
    }
  });

  // Map of all forward edges for traversal lookup
  const forwardEdges = {};
  edges.forEach(e => {
    if (!forwardEdges[e.source]) forwardEdges[e.source] = [];
    forwardEdges[e.source].push(e.target);
  });

  while (queue.length > 0) {
    const parentId = queue.shift();
    const childrenIds = forwardEdges[parentId] || [];

    // Heuristic: Sort children to put "True/Yes" paths on top (optional polish)
    // childrenIds.sort(); 

    childrenIds.forEach(childId => {
      // Check if child exists in our node list (edges might point to missing nodes)
      if (graph[childId]) {
        if (!visited.has(childId)) {
          // First time seeing this node? It becomes a direct child in the Layout Tree.
          visited.add(childId);
          graph[parentId].children.push(childId);
          queue.push(childId);
        }
        // Always track connections for context, even if not structural children
        graph[parentId].allChildren.push(childId);
      }
    });
  }

  // 4. MEASURE PHASE (Post-Order DFS)
  // Calculates how tall each branch is.
  const measureNode = (nodeId) => {
    const node = graph[nodeId];
    if (node.children.length === 0) {
      node.measuredHeight = NODE_HEIGHT + Y_SPACING;
      return node.measuredHeight;
    }

    let totalHeight = 0;
    node.children.forEach(childId => {
      totalHeight += measureNode(childId);
    });

    // Parent height is max of (children stack) OR (node height)
    node.measuredHeight = Math.max(NODE_HEIGHT + Y_SPACING, totalHeight);
    return node.measuredHeight;
  };

  // 5. LAYOUT PHASE (Pre-Order DFS)
  // Assigns actual X, Y coordinates
  const placeNode = (nodeId, x, y) => {
    const node = graph[nodeId];
    node.tempX = x;

    if (node.children.length === 0) {
      node.tempY = y;
      return;
    }

    let currentChildY = y;
    
    // Stack children vertically
    node.children.forEach(childId => {
      placeNode(childId, x + X_SPACING, currentChildY);
      currentChildY += graph[childId].measuredHeight;
    });

    // Center parent relative to its specific layout children
    const firstChild = graph[node.children[0]];
    const lastChild = graph[node.children[node.children.length - 1]];
    
    if (firstChild && lastChild) {
      node.tempY = (firstChild.tempY + lastChild.tempY) / 2;
    } else {
      node.tempY = y;
    }
  };

  // --- EXECUTE ON DISCONNECTED TREES ---
  let globalCursorY = 0;

  // Split Main vs Event roots for visual separation
  const mainFlowRoots = sortedRoots.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
  const eventFlowRoots = sortedRoots.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

  // Layout Main Flow
  mainFlowRoots.forEach(root => {
    // Only layout if it was part of the BFS (it should be, since it's a root)
    if(graph[root.id]) {
      measureNode(root.id);
      placeNode(root.id, 0, globalCursorY);
      globalCursorY += graph[root.id].measuredHeight + 200; // Gap between separate main flows
    }
  });

  // Gap before Events
  globalCursorY += 200;

  // Layout Events
  eventFlowRoots.forEach(root => {
    if (!graph[root.id]) return;

    if (root.type === 'groupHeader') {
      graph[root.id].tempX = 0;
      graph[root.id].tempY = globalCursorY;
      globalCursorY += 100;
    } else {
      measureNode(root.id);
      placeNode(root.id, 0, globalCursorY);
      globalCursorY += graph[root.id].measuredHeight + 100;
    }
  });

  // 6. Map to React Flow
  const layoutedNodes = nodes.map(node => {
    const gNode = graph[node.id];
    // If a node wasn't visited (orphan), put it at the bottom
    const x = gNode.tempX !== undefined ? gNode.tempX : 0;
    const y = gNode.tempY !== undefined ? gNode.tempY : (globalCursorY += 150);

    return {
      ...node,
      targetPosition: 'left',
      sourcePosition: 'right',
      position: { x, y },
    };
  });

  return { nodes: layoutedNodes, edges };
};
