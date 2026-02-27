import React, { useState } from 'react';
import { useReactFlow, getRectOfNodes } from 'reactflow';
import { jsPDF } from 'jspdf';
import { getNodeConfig } from '../wxccConfig';

const VectorDownloadButton = ({ setShowEvents }) => {
  const { getNodes, getEdges } = useReactFlow();
  const [isExporting, setIsExporting] = useState(false);

  const exportVectorPdf = async () => {
    setIsExporting(true);
    
    // 1. Ensure all nodes are visible
    setShowEvents(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const nodes = getNodes();
    const edges = getEdges();
    
    const mainNodes = nodes.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
    const eventNodes = nodes.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt', // Use points for easier mapping
    });

    const drawFlowToPage = (targetNodes) => {
      if (targetNodes.length === 0) return;

      const bounds = getRectOfNodes(targetNodes);
      const padding = 50;
      
      // PDF Page Dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate Scale to fit
      const contentWidth = bounds.width + (padding * 2);
      const contentHeight = bounds.height + (padding * 2);
      
      const scaleX = pageWidth / contentWidth;
      const scaleY = pageHeight / contentHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up if smaller
      
      // Center content
      const finalWidth = contentWidth * scale;
      const finalHeight = contentHeight * scale;
      const offsetX = (pageWidth - finalWidth) / 2;
      const offsetY = (pageHeight - finalHeight) / 2;

      // Transform helper
      const transform = (x, y) => {
        return {
          x: (x - bounds.x + padding) * scale + offsetX,
          y: (y - bounds.y + padding) * scale + offsetY
        };
      };

      // --- DRAW EDGES ---
      // Simple straight lines for test vector export
      // To do curves properly requires bezier calculation which is complex without React Flow's internal path logic
      pdf.setLineWidth(1 * scale);
      
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (!sourceNode || !targetNode) return;
        
        // Check if edge belongs to current set (source or target is in targetNodes)
        const isRelevant = targetNodes.some(n => n.id === sourceNode.id || n.id === targetNode.id);
        if (!isRelevant) return;

        // Simple center-to-center or handle approximation
        // React Flow nodes have width/height. Handles are usually at sides/bottom.
        // Let's approximate: Source (Right/Bottom), Target (Left/Top)
        
        const start = transform(sourceNode.position.x + (sourceNode.width || 150) / 2, sourceNode.position.y + (sourceNode.height || 50));
        const end = transform(targetNode.position.x + (targetNode.width || 150) / 2, targetNode.position.y);

        const isError = edge.data?.isRedLine;
        if (isError) {
          pdf.setDrawColor(211, 47, 47); // Red
        } else {
          pdf.setDrawColor(85, 85, 85); // Grey
        }

        pdf.line(start.x, start.y, end.x, end.y);
      });

      // --- DRAW NODES ---
      targetNodes.forEach(node => {
        if (node.type === 'groupHeader') {
           const pos = transform(node.position.x, node.position.y);
           pdf.setFontSize(24 * scale);
           pdf.setTextColor(100);
           pdf.text(node.data.label, pos.x, pos.y);
           return;
        }

        const { x, y } = transform(node.position.x, node.position.y);
        const w = (node.width || 280) * scale;
        const h = (node.height || 100) * scale; // Approximate if not measured

        // Get Config for colors
        const config = getNodeConfig(node.data?.nodeType);
        
        // Header Background
        // jsPDF colors are 0-255 or hex
        pdf.setFillColor(config.header); 
        pdf.setDrawColor(0); // Black border
        pdf.setLineWidth(0.5);
        
        // Draw Header Rect
        const headerHeight = 48 * scale;
        pdf.rect(x, y, w, headerHeight, 'FD'); // Fill and Draw

        // Draw Body Rect
        pdf.setFillColor(255, 255, 255);
        pdf.rect(x, y + headerHeight, w, h - headerHeight, 'FD');

        // Draw Text
        pdf.setTextColor(0);
        pdf.setFontSize(12 * scale);
        // Title
        const title = node.data?.label || 'Node';
        // Simple truncation check?
        pdf.text(title, x + (10 * scale), y + (30 * scale));
        
        // Subtitle
        pdf.setFontSize(9 * scale);
        pdf.setTextColor(80);
        pdf.text(config.label, x + (10 * scale), y + (42 * scale));

        // Body Text (Details)
        // Just listing some details as a test
        if (node.data?.details) {
            let lineY = y + headerHeight + (15 * scale);
            const details = node.data.details;
            // Just print first 2-3 keys
            Object.keys(details).slice(0, 3).forEach(key => {
                if (key === 'activityName') return;
                const val = String(details[key]).substring(0, 30);
                pdf.text(`${key}: ${val}`, x + (10 * scale), lineY);
                lineY += (12 * scale);
            });
        }
      });
    };

    // Page 1
    if (mainNodes.length > 0) {
        drawFlowToPage(mainNodes);
    }

    // Page 2
    if (eventNodes.length > 0) {
        if (mainNodes.length > 0) pdf.addPage();
        drawFlowToPage(eventNodes);
    }

    pdf.save('flow-visualizer-vector-test.pdf');
    setIsExporting(false);
  };

  return (
    <button 
      onClick={exportVectorPdf}
      disabled={isExporting}
      style={{
        background: isExporting ? '#f0f0f0' : 'white',
        border: '1px solid #ccc',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        color: '#333',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <span>{isExporting ? '⏳' : '🔤'}</span> 
      Test Vector Export
    </button>
  );
};

export default VectorDownloadButton;
