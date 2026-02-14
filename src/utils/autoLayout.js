// src/utils/autoLayout.js

export const getLayoutedElements = (nodes, edges) => {
  // --- CONFIGURATION ---
  const NODE_WIDTH = 300; 
  const NODE_HEIGHT = 150; 
  const X_SPACING = 600;   // Wide horizontal gap to prevent line overlap
  const Y_SPACING = 120;   // Vertical gap for clear branch separation

  // 1. Initialize Graph Nodes
  const graph = {};
  nodes.forEach(n => {
    graph[n.id] = { 
      ...n, 
      treeChildren: [], // Only the "official" children for layout
      measuredHeight: 0, 
      x: 0, 
      y: 0 
    };
  });

  // 2. Build a "Strict Spanning Tree"
  // We process edges to ensure every node has exactly ONE primary parent.
  // This prevents double-counting heights (the "Diamond Problem") and cycles.
  
  const visited = new Set();
  const nodeHasParent = new Set();
  
  // Sort edges to prioritize "Happy Path" as the primary layout connection
  // We want the 'success' or 'default' line to define the straight tree structure.
  const sortedEdges = [...edges].sort((a, b) => {
    const isGoodA = ['success', 'default', 'true'].some(t => (a.sourceHandle||'').includes(t));
    const isGoodB = ['success', 'default', 'true'].some(t => (b.sourceHandle||'').includes(t));
    return isGoodB - isGoodA; // True first
  });

  // Helper to connect tree
  const connectTree = (parentId, childId) => {
    if (graph[parentId] && graph[childId] && !nodeHasParent.has(childId)) {
      graph[parentId].treeChildren.push(childId);
      nodeHasParent.add(childId);
    }
  };

  // Identify Roots (Start Node or Events)
  const targets = new Set(edges.map(e => e.target));
  const roots = nodes.filter(n => !targets.has(n.id) || n.type === 'StartNode' || n.data?.isEventNode);

  // Traverse from roots to build the tree
  const queue = [...roots.map(n => n.id)];
  const reachable = new Set(queue);

  // First pass: Connect roots' children
  while(queue.length > 0) {
    const parentId = queue.shift();
    
    // Find all outgoing edges from this parent
    const myEdges = sortedEdges.filter(e => e.source === parentId);
    
    myEdges.forEach(edge => {
      const childId = edge.target;
      if (!reachable.has(childId)) {
        connectTree(parentId, childId);
        reachable.add(childId);
        queue.push(childId);
      } else if (!nodeHasParent.has(childId)) {
        // Child was reachable but didn't have a parent yet (e.g. merge point)
        connectTree(parentId, childId);
      }
    });
  }

  // 3. MEASURE PHASE (Post-Order Traversal)
  // Calculate height of the *strict* tree only.
  const measureNode = (nodeId) => {
    const node = graph[nodeId];
    if (!node) return 0;
    
    if (node.treeChildren.length === 0) {
      node.measuredHeight = NODE_HEIGHT + Y_SPACING;
      return node.measuredHeight;
    }

    let totalHeight = 0;
    node.treeChildren.forEach(childId => {
      totalHeight += measureNode(childId);
    });

    node.measuredHeight = Math.max(NODE_HEIGHT + Y_SPACING, totalHeight);
    return node.measuredHeight;
  };

  // 4. PLACE PHASE (Pre-Order Traversal)
  const placeNode = (nodeId, x, y) => {
    const node = graph[nodeId];
    if (!node) return;

    node.x = x;
    
    // Position Children
    if (node.treeChildren.length > 0) {
      let currentChildY = y;
      
      // If parent has multiple children, center parent relative to them
      node.treeChildren.forEach(childId => {
        placeNode(childId, x + X_SPACING, currentChildY);
        currentChildY += graph[childId].measuredHeight;
      });

      const firstChild = graph[node.treeChildren[0]];
      const lastChild = graph[node.treeChildren[node.treeChildren.length - 1]];
      
      node.y = (firstChild.y + lastChild.y) / 2;
    } else {
      node.y = y;
    }
  };

  // --- EXECUTION ---
  
  // Sort roots: Main Flow first, then Events
  const sortedRoots = roots.sort((a, b) => {
    if (a.type === 'StartNode') return -1;
    if (a.data?.isEventNode && !b.data?.isEventNode) return 1;
    return 0;
  });

  const mainRoots = sortedRoots.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
  const eventRoots = sortedRoots.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

  let globalCursorY = 0;

  // Layout Main Flow
  mainRoots.forEach(root => {
    if(graph[root.id]) {
      measureNode(root.id);
      placeNode(root.id, 0, globalCursorY);
      globalCursorY += graph[root.id].measuredHeight + 400; // Big gap
    }
  });

  // Gap for Events
  globalCursorY += 200;

  // Layout Events
  eventRoots.forEach(root => {
    if (!graph[root.id]) return;

    if (root.type === 'groupHeader') {
      graph[root.id].x = 0;
      graph[root.id].y = globalCursorY;
      globalCursorY += 150;
    } else {
      measureNode(root.id);
      placeNode(root.id, 0, globalCursorY);
      globalCursorY += graph[root.id].measuredHeight + 200;
    }
  });

  // 5. Map to React Flow
  const layoutedNodes = nodes.map(node => {
    const gNode = graph[node.id];
    // Use calculated pos, or fallback to 0 if node was unreachable (orphan)
    const x = gNode.x || 0;
    const y = gNode.y !== undefined ? gNode.y : (globalCursorY += 200);

    return {
      ...node,
      targetPosition: 'left',
      sourcePosition: 'right',
      position: { x, y },
    };
  });

  return { nodes: layoutedNodes, edges };
};
