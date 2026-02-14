// src/utils/autoLayout.js

export const getLayoutedElements = (nodes, edges) => {
  // --- SETTINGS: Tightened for PDF Density ---
  const NODE_WIDTH = 300; 
  const NODE_HEIGHT = 100; // Assumed average height
  const X_SPACING = 350;   // Horizontal gap (Reduced)
  const Y_SPACING = 110;   // Vertical gap (Reduced significantly)

  // 1. Helper: Identify Roots
  const getRoots = () => {
    const targets = new Set(edges.map(e => e.target));
    return nodes.filter(n => 
      !targets.has(n.id) || 
      n.type === 'StartNode' || 
      n.data?.isEventNode
    );
  };

  // 2. Build Tree
  const graph = {};
  nodes.forEach(node => {
    graph[node.id] = { ...node, children: [], width: NODE_WIDTH, height: NODE_HEIGHT };
  });

  edges.forEach(edge => {
    if (graph[edge.source] && graph[edge.target]) {
      graph[edge.source].children.push(edge.target);
    }
  });

  // 3. Recursive Layout Walker
  const layoutTree = (nodeId, x, startY, visited) => {
    if (visited.has(nodeId)) return { minY: startY, maxY: startY + NODE_HEIGHT };
    visited.add(nodeId);

    const node = graph[nodeId];
    
    // Assign position
    node.tempX = x;
    node.tempY = startY; 
    
    let currentChildY = startY;
    let mySubtreeMaxY = startY + NODE_HEIGHT;

    if (node.children.length > 0) {
      node.children.forEach(childId => {
        const childBounds = layoutTree(childId, x + X_SPACING, currentChildY, visited);
        // Tighter Stacking: Next child starts immediately after previous child's bounds + gap
        currentChildY = childBounds.maxY + (Y_SPACING / 2); // Smaller gap between immediate siblings
        mySubtreeMaxY = Math.max(mySubtreeMaxY, childBounds.maxY);
      });

      // Centering Parent:
      const firstChild = graph[node.children[0]];
      const lastChild = graph[node.children[node.children.length - 1]];
      node.tempY = (firstChild.tempY + lastChild.tempY) / 2;
    }

    return { minY: startY, maxY: mySubtreeMaxY };
  };

  // 4. Execution
  const allRoots = getRoots();
  const mainRoots = allRoots.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
  const eventRoots = allRoots.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

  let globalCursorY = 0;
  const processedNodes = new Set();

  // Layout Main Flow
  mainRoots.forEach(root => {
    const bounds = layoutTree(root.id, 0, globalCursorY, processedNodes);
    globalCursorY = bounds.maxY + 200; 
  });

  // Layout Event Flows (Below Main)
  globalCursorY += 200; 
  eventRoots.forEach(root => {
    if (root.type === 'groupHeader') {
      // Hardcode header position
      const finalNode = nodes.find(n => n.id === root.id);
      if(finalNode) {
          finalNode.position = { x: 0, y: globalCursorY };
      }
      globalCursorY += 100;
      return;
    }
    const bounds = layoutTree(root.id, 0, globalCursorY, processedNodes);
    globalCursorY = bounds.maxY + 150;
  });

  // 5. Apply
  const layoutedNodes = nodes.map(node => {
    const gNode = graph[node.id];
    // If auto-layout touched it, use temp coords. Otherwise keep original (orphans).
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

  return { nodes: layoutedNodes, edges };
};
