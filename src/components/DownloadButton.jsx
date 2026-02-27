import React, { useState } from 'react';
import { useReactFlow, getRectOfNodes } from 'reactflow';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const DownloadButton = ({ setShowEvents }) => {
  const { getNodes } = useReactFlow();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPdf = async () => {
    setIsDownloading(true);
    
    // 1. Ensure all nodes are visible (logic-wise)
    setShowEvents(true);
    
    // Allow time for React to render any hidden nodes
    await new Promise((resolve) => setTimeout(resolve, 500));

    const nodes = getNodes();
    const mainNodes = nodes.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
    const eventNodes = nodes.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

    // Helper to capture a specific set of nodes
    const captureNodes = async (targetNodes) => {
      if (targetNodes.length === 0) return null;

      // 1. Calculate the bounding box of the nodes
      const bounds = getRectOfNodes(targetNodes);
      
      // Add some padding
      const padding = 50;
      const x = bounds.x - padding;
      const y = bounds.y - padding;
      const width = bounds.width + (padding * 2);
      const height = bounds.height + (padding * 2);

      // 2. Select the viewport element (contains nodes/edges, but NO controls/panels)
      const viewportElem = document.querySelector('.react-flow__viewport');

      // 3. Capture high-res PNG
      // We use a transform to shift the content so the top-left of the bounding box is at (0,0)
      return await toPng(viewportElem, {
        backgroundColor: '#ffffff', // White background, no gray dots
        width: width,
        height: height,
        style: {
          width: width + 'px',
          height: height + 'px',
          // Translate content to bring target area into view at (0,0)
          transform: `translate(${-x}px, ${-y}px) scale(1)`, 
        },
        pixelRatio: 1.5, // 1.5x resolution for clarity but manageable file size
      });
    };

    try {
      // --- Page 1: Main Flow ---
      let imgData1 = null;
      if (mainNodes.length > 0) {
        imgData1 = await captureNodes(mainNodes);
      }
      
      // --- Page 2: Event Flows ---
      let imgData2 = null;
      if (eventNodes.length > 0) {
        imgData2 = await captureNodes(eventNodes);
      }

      // --- Generate PDF ---
      const pdf = new jsPDF({
        orientation: 'landscape',
        compress: true, // Enable compression to reduce file size
      });
      
      const addToPdf = (imgData) => {
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Calculate fit dimensions
        const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
        const width = imgProps.width * ratio;
        const height = imgProps.height * ratio;
        
        // Center the image
        const x = (pdfWidth - width) / 2;
        const y = (pdfHeight - height) / 2;

        pdf.addImage(imgData, 'PNG', x, y, width, height, null, 'FAST'); // 'FAST' compression
      };

      if (imgData1) {
        addToPdf(imgData1);
      }

      if (imgData2) {
        if (imgData1) pdf.addPage();
        addToPdf(imgData2);
      }

      pdf.save('flow-visualizer-export.pdf');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. See console for details.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button 
      onClick={downloadPdf}
      disabled={isDownloading}
      style={{
        background: isDownloading ? '#e0e0e0' : 'white',
        border: '1px solid #ccc',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: isDownloading ? 'wait' : 'pointer',
        fontWeight: 'bold',
        color: '#d81b60', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <span>{isDownloading ? '⏳' : '📄'}</span> 
      {isDownloading ? 'Exporting...' : 'Export PDF'}
    </button>
  );
};

export default DownloadButton;
