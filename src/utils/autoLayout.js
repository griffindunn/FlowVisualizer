// src/utils/autoLayout.js

export const getLayoutedElements = (nodes, edges) => {
  // --- TUNING KNOBS ---
  const NODE_WIDTH = 300; 
  const NODE_HEIGHT = 160; 
  const X_SPACING = 600;   // Wide horizontal gap for lines
  const Y_SPACING = 120;   // Vertical gap for separation

  // 1. Build the Graph
  const graph = {};
  nodes.forEach(n => {
    graph[n.id] = { 
      ...n, 
      children: [], 
      allChildren: [],
      x: 0, 
      y: 0 
    };
  });

  // Helper to get edge labels for sorting
  const getEdgeLabel = (source, target) => {
    const edge = edges.find(e => e.source === source && e.target === target);
    return edge?.sourceHandle || 'default';
  };

  edges.forEach(edge => {
    if (graph[edge.source] && graph[edge.target]) {
      graph[edge.source].children.push(edge.target);
    }
  });

  // 2. Sort Children (Success on Top, Error on Bottom)
  Object.values(graph).forEach(node => {
    if (node.children.length > 1) {
      node.children.sort((aId, bId) => {
        const typeA = getEdgeLabel(node.id, aId);
        const typeB = getEdgeLabel(node.id, bId);

        const isSuccessA = ['success', 'default', 'true', '1', '2', '3'].some(t => typeA.includes(t));
        const isSuccessB = ['success', 'default', 'true', '1', '2', '3'].some(t => typeB.includes(t));
        
        if (isSuccessA && !isSuccessB) return -1;
        if (!isSuccessA && isSuccessB) return 1;

        const isBadA = ['error', 'timeout', 'invalid', 'failure'].some(t => typeA.includes(t));
        const isBadB = ['error', 'timeout', 'invalid', 'failure'].some(t => typeB.includes(t));
        
        if (isBadA && !isBadB) return 1;
        if (!isBadA && isBadB) return -1;

        return 0;
      });
    }
  });

  // 3. Identify Roots
  const targets = new Set(edges.map(e => e.target));
  const roots = nodes.filter(n => !targets.has(n.id) || n.type === 'StartNode' || n.data?.isEventNode);

  // 4. MEMOIZATION SETUP
  // calculatedHeights: Stores the total height of a node's subtree so we never calc it twice
  const calculatedHeights = {}; 
  // visiting: Tracks recursion stack to break infinite loops (cycles)
  const visiting = new Set();

  // MEASURE FUNCTION (Returns height)
  const getSubtreeHeight = (nodeId) => {
    // A. Cycle Detected? Return minimal height and stop recursing.
    if (visiting.has(nodeId)) return NODE_HEIGHT + Y_SPACING;
    
    // B. Already Calculated? Return cached value. (Fixes the crash)
    if (calculatedHeights[nodeId] !== undefined) return calculatedHeights[nodeId];

    visiting.add(nodeId);
    
    const node = graph[nodeId];
    
    // Base Case: Leaf Node
    if (!node || node.children.length === 0) {
      visiting.delete(nodeId);
      calculatedHeights[nodeId] = NODE_HEIGHT + Y_SPACING;
      return calculatedHeights[nodeId];
    }

    // Recursive Step: Sum height of all children
    let totalHeight = 0;
    node.children.forEach(childId => {
      totalHeight += getSubtreeHeight(childId);
    });

    visiting.delete(nodeId);
    
    // Height is either the children's total height OR the node's own height (whichever is bigger)
    // We add Y_SPACING to ensure separation between blocks
    calculatedHeights[nodeId] = Math.max(NODE_HEIGHT + Y_SPACING, totalHeight);
    return calculatedHeights[nodeId];
  };

  // 5. LAYOUT FUNCTION (Assigns X/Y)
  // placedNodes: Tracks nodes we have already assigned coordinates to (handles merge points)
  const placedNodes = new Set();

  const placeNode = (nodeId, x, y) => {
    if (placedNodes.has(nodeId)) return; // Don't move a node if it's already placed
    placedNodes.add(nodeId);

    const node = graph[nodeId];
    node.x = x;

    // 1. Place Children
    if (node.children.length > 0) {
      let currentChildY = y;
      
      // If we have multiple children, center the parent relative to the children block
      // If the parent is TALLER than the children block (rare), center children relative to parent.
      
      node.children.forEach(childId => {
        placeNode(childId, x + X_SPACING, currentChildY);
        // Step down by the child's pre-calculated height
        currentChildY += calculatedHeights[childId];
      });

      // Calculate Center Y for the Parent
      const firstChild = graph[node.children[0]];
      const lastChild = graph[node.children[node.children.length - 1]];
      
      if (firstChild && lastChild) {
        // Simple centering between first and last child top positions
        // This is safe because we just placed them.
        node.y = (firstChild.y + lastChild.y) / 2;
      } else {
        node.y = y;
      }
    } else {
      // Leaf Node
      node.y = y;
    }
  };

  // --- EXECUTION ---
  
  // Sort roots: Main Flow first, then Events
  const sortedRoots = roots.sort((a, b) => {
    if (a.type === 'StartNode') return -1;
    if (a.data?.isEventNode && !b.data?.isEventNode) return 1;
    if (a.type === 'groupHeader') return 1;
    return 0;
  });

  const mainRoots = sortedRoots.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
  const eventRoots = sortedRoots.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

  let globalCursorY = 0;

  // A. Measure & Place Main Flow
  mainRoots.forEach(root => {
    if(graph[root.id]) {
      // 1. Measure First (Populates calculatedHeights)
      getSubtreeHeight(root.id);
      // 2. Place Second (Uses calculatedHeights)
      placeNode(root.id, 0, globalCursorY);
      // 3. Move cursor down
      globalCursorY += (calculatedHeights[root.id] || NODE_HEIGHT) + 300; 
    }
  });

  // B. Measure & Place Event Flows
  // Ensure we start below any main flow content (including nodes pushed down by layout)
  let maxMainY = 0;
  Object.values(graph).forEach(n => {
    if (n.y > maxMainY) maxMainY = n.y;
  });
  
  globalCursorY = Math.max(globalCursorY, maxMainY + 400);

  eventRoots.forEach(root => {
    if (!graph[root.id]) return;

    if (root.type === 'groupHeader') {
      graph[root.id].x = 0;
      graph[root.id].y = globalCursorY;
      placedNodes.add(root.id);
      globalCursorY += 150;
    } else {
      getSubtreeHeight(root.id);
      placeNode(root.id, 0, globalCursorY);
      globalCursorY += (calculatedHeights[root.id] || NODE_HEIGHT) + 200;
    }
  });

  // 6. Map back to React Flow
  const layoutedNodes = nodes.map(node => {
    const gNode = graph[node.id];
    // Safety: if a node wasn't reached (orphan loop), place it at the bottom
    const x = gNode.x || 0;
    const y = placedNodes.has(node.id) ? gNode.y : (globalCursorY += 200);

    return {
      ...node,
      targetPosition: 'left',
      sourcePosition: 'right',
      position: { x, y },
    };
  });

  return { nodes: layoutedNodes, edges };
};
