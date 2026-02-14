// src/utils/autoLayout.js

export const getLayoutedElements = (nodes, edges) => {
  const NODE_WIDTH = 300;
  const NODE_HEIGHT = 100;
  const X_SPACING = 400; // Horizontal gap between columns
  const Y_SPACING = 120; // Vertical gap between siblings

  // 1. Helper: Identify Roots (Nodes with no incoming edges within their group)
  // We treat the Main Start Node and every Event Node as distinct "Roots"
  const getRoots = () => {
    const targets = new Set(edges.map(e => e.target));
    // A root is any node that:
    // 1. Is a "Start" type
    // 2. Is an "Event" header or trigger
    // 3. Or simply has no incoming connections (orphans)
    return nodes.filter(n => 
      !targets.has(n.id) || 
      n.type === 'StartNode' || 
      n.data?.isEventNode
    );
  };

  // 2. Build the Tree Structure (Children/Parents)
  const graph = {};
  nodes.forEach(node => {
    graph[node.id] = { ...node, children: [], width: NODE_WIDTH, height: NODE_HEIGHT };
  });

  edges.forEach(edge => {
    if (graph[edge.source] && graph[edge.target]) {
      graph[edge.source].children.push(edge.target);
    }
  });

  // 3. The Recursive Layout Function (Walker)
  // Returns the bounding box { minY, maxY } of the tree it just laid out
  const layoutTree = (nodeId, x, startY, visited) => {
    if (visited.has(nodeId)) return { minY: startY, maxY: startY + NODE_HEIGHT };
    visited.add(nodeId);

    const node = graph[nodeId];
    
    // Position current node (temporarily, will center later)
    node.tempX = x;
    node.tempY = startY; 
    
    let currentChildY = startY;
    let mySubtreeMaxY = startY + NODE_HEIGHT;

    if (node.children.length > 0) {
      // Sort children to try and keep "Yes/True" on top, "No/False" on bottom (optional polish)
      // Recurse for children
      node.children.forEach(childId => {
        const childBounds = layoutTree(childId, x + X_SPACING, currentChildY, visited);
        // The next child starts where this child finished
        currentChildY = childBounds.maxY + Y_SPACING; 
        mySubtreeMaxY = Math.max(mySubtreeMaxY, childBounds.maxY);
      });

      // Centering Logic:
      // Move this parent node to the average Y of its first and last child
      const firstChild = graph[node.children[0]];
      const lastChild = graph[node.children[node.children.length - 1]];
      node.tempY = (firstChild.tempY + lastChild.tempY) / 2;
    }

    return { minY: startY, maxY: mySubtreeMaxY };
  };

  // 4. Execution: Layout "Forest" (Multiple distinct trees)
  
  // Separate Main Flow Roots from Event Roots
  const allRoots = getRoots();
  const mainRoots = allRoots.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
  const eventRoots = allRoots.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

  // We track global Y to stack the trees
  let globalCursorY = 0;
  const processedNodes = new Set();
  const finalLayout = {};

  // A. Process Main Flow First
  mainRoots.forEach(root => {
    const bounds = layoutTree(root.id, 0, globalCursorY, processedNodes);
    globalCursorY = bounds.maxY + 400; // Add big gap between independent main flows
  });

  // B. Process Event Flows Below
  globalCursorY += 200; // Extra spacing before Events section
  
  eventRoots.forEach(root => {
    // If it's a Header, just place it
    if (root.type === 'groupHeader') {
      finalLayout[root.id] = { x: 0, y: globalCursorY };
      globalCursorY += 150;
      return;
    }

    // Layout the Event Tree
    const bounds = layoutTree(root.id, 0, globalCursorY, processedNodes);
    globalCursorY = bounds.maxY + 300; // Spacing between different events
  });

  // 5. Apply positions to actual nodes
  const layoutedNodes = nodes.map(node => {
    const gNode = graph[node.id];
    // If the node was reachable, use calculated pos. If orphan, push to bottom.
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
