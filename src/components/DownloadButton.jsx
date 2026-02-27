import React, { useState } from 'react';
import { useReactFlow, getRectOfNodes, getTransformForBounds } from 'reactflow';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const DownloadButton = ({ setShowEvents }) => {
  const { getNodes, fitView } = useReactFlow();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPdf = async () => {
    setIsDownloading(true);
    
    // 1. Ensure all nodes are visible
    setShowEvents(true);
    
    // Allow time for render
    await new Promise((resolve) => setTimeout(resolve, 500));

    const nodes = getNodes();
    const mainNodes = nodes.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
    const eventNodes = nodes.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

    // Helper to capture current view
    const captureView = async (targetNodes) => {
      // Fit view to specific nodes
      await fitView({ nodes: targetNodes, duration: 0, padding: 0.2 });
      
      // Wait for renderer to catch up
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const viewport = document.querySelector('.react-flow__viewport');
      // We capture the viewport to get the content, but we need to make sure the background is handled
      // Actually, capturing the renderer (.react-flow) is safer to get the whole visible area
      const element = document.querySelector('.react-flow');
      
      return await toPng(element, {
        backgroundColor: '#f0f0f0',
        style: {
           // Ensure we capture what we see
           width: element.offsetWidth + 'px',
           height: element.offsetHeight + 'px',
        }
      });
    };

    try {
      // --- Page 1: Main Flow ---
      const imgData1 = await captureView(mainNodes);
      
      // --- Page 2: Event Flows ---
      // Only capture if there are event nodes
      let imgData2 = null;
      if (eventNodes.length > 0) {
        imgData2 = await captureView(eventNodes);
      }

      // --- Generate PDF ---
      const pdf = new jsPDF({
        orientation: 'landscape',
      });
      
      const imgProps = pdf.getImageProperties(imgData1);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate fit dimensions for Page 1
      const ratio1 = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
      const width1 = imgProps.width * ratio1;
      const height1 = imgProps.height * ratio1;
      
      // Center the image
      const x1 = (pdfWidth - width1) / 2;
      const y1 = (pdfHeight - height1) / 2;

      pdf.addImage(imgData1, 'PNG', x1, y1, width1, height1);

      if (imgData2) {
        pdf.addPage();
        const imgProps2 = pdf.getImageProperties(imgData2);
        const ratio2 = Math.min(pdfWidth / imgProps2.width, pdfHeight / imgProps2.height);
        const width2 = imgProps2.width * ratio2;
        const height2 = imgProps2.height * ratio2;
        const x2 = (pdfWidth - width2) / 2;
        const y2 = (pdfHeight - height2) / 2;
        
        pdf.addImage(imgData2, 'PNG', x2, y2, width2, height2);
      }

      pdf.save('flow-visualizer-export.pdf');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. See console for details.');
    } finally {
      setIsDownloading(false);
      // Optional: Restore view to main nodes or original state
      fitView({ nodes: mainNodes, duration: 500 });
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
        color: '#d81b60', // Pinkish/Red to stand out
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
