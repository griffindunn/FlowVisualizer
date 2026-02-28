import React, { useState, useEffect, useRef } from 'react';
import { getNodeConfig } from '../wxccConfig';
import PdfWorker from '../workers/pdfWorker.js?worker';

const DownloadButton = ({ nodes, edges }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new PdfWorker();
    return () => { workerRef.current?.terminate(); };
  }, []);

  const downloadPdf = async () => {
    setIsDownloading(true);
    setStatusText('Preparing...');
    await new Promise(r => setTimeout(r, 10));

    try {
      const mainNodes = nodes.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
      const eventNodes = nodes.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

      const prepareNodes = (list) => list.map(n => {
        if (n.type === 'groupHeader') {
          return {
            id: n.id, x: n.position.x, y: n.position.y,
            type: 'groupHeader', label: n.data.label, isGroupHeader: true,
            headerColor: '#E0E0E0', borderColor: '#BDBDBD', fontColor: '#292929',
            subtitle: '', details: {},
          };
        }
        const config = getNodeConfig(n.data.nodeType);
        return {
          id: n.id, x: n.position.x, y: n.position.y,
          type: config.nodeType,
          label: n.data.label,
          subtitle: config.label,
          headerColor: config.header,
          borderColor: config.border,
          fontColor: config.font || '#292929',
          details: n.data.details || {},
        };
      });

      const prepareEdges = (nodeIds, allEdges) => {
        const idSet = new Set(nodeIds);
        return allEdges
          .filter(e => idSet.has(e.source) && idSet.has(e.target))
          .map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            color: e.style?.stroke || '#555',
          }));
      };

      setStatusText('Building PDF...');
      await new Promise(r => setTimeout(r, 10));

      const mainIds = mainNodes.map(n => n.id);
      const eventIds = eventNodes.map(n => n.id);

      const pages = [
        { nodes: prepareNodes(mainNodes), edges: prepareEdges(mainIds, edges) },
        { nodes: prepareNodes(eventNodes), edges: prepareEdges(eventIds, edges) },
      ].filter(p => p.nodes.length > 0);

      workerRef.current.postMessage({ pages });

      await new Promise((resolve, reject) => {
        const handler = (e) => {
          workerRef.current.removeEventListener('message', handler);
          if (e.data.type === 'success') {
            const url = URL.createObjectURL(e.data.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'flow-visualizer-export.pdf';
            a.click();
            URL.revokeObjectURL(url);
            resolve();
          } else if (e.data.type === 'error') {
            reject(new Error(e.data.error));
          }
        };
        workerRef.current.addEventListener('message', handler);
      });

      setStatusText('Done!');
      await new Promise(r => setTimeout(r, 500));

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. See console for details.');
    } finally {
      setIsDownloading(false);
      setStatusText('');
    }
  };

  return (
    <button
      onClick={downloadPdf}
      disabled={isDownloading}
      style={{
        background: isDownloading ? '#f5f5f5' : 'white',
        border: '1px solid #ccc',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: isDownloading ? 'default' : 'pointer',
        fontWeight: 'bold',
        color: isDownloading ? '#888' : '#000000',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: '140px',
        justifyContent: 'center',
      }}
    >
      <span>{isDownloading ? '⏳' : '📄'}</span>
      {isDownloading ? statusText : 'Export PDF'}
    </button>
  );
};

export default DownloadButton;
