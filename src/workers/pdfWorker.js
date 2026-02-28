import { jsPDF } from 'jspdf';

self.onmessage = (e) => {
  const { pages } = e.data;

  if (!pages || pages.length === 0) {
    self.postMessage({ type: 'error', error: 'No content provided' });
    return;
  }

  try {
    // Initialize PDF with the dimensions of the first page
    const firstPage = pages[0];
    const pdf = new jsPDF({
      orientation: firstPage.width > firstPage.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [firstPage.width, firstPage.height],
      compress: true,
    });

    // Helper to draw a page
    const drawPage = (page) => {
      page.tiles.forEach(tile => {
        const data = new Uint8Array(tile.data);
        pdf.addImage(data, 'PNG', tile.x, tile.y, tile.width, tile.height, null, 'FAST');
      });
    };

    // Draw first page
    drawPage(firstPage);

    // Draw subsequent pages
    for (let i = 1; i < pages.length; i++) {
      const page = pages[i];
      const orientation = page.width > page.height ? 'landscape' : 'portrait';
      
      pdf.addPage([page.width, page.height], orientation);
      drawPage(page);
    }

    const pdfBlob = pdf.output('blob');
    self.postMessage({ type: 'success', blob: pdfBlob });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};
