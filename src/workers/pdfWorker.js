import { jsPDF } from 'jspdf';

self.onmessage = (e) => {
  const { images } = e.data;

  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      compress: true,
    });

    images.forEach((image, index) => {
      if (index > 0) pdf.addPage();
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit page
      const ratio = Math.min(pdfWidth / image.width, pdfHeight / image.height);
      const w = image.width * ratio;
      const h = image.height * ratio;
      const x = (pdfWidth - w) / 2;
      const y = (pdfHeight - h) / 2;

      // Create Uint8Array from ArrayBuffer
      const data = new Uint8Array(image.data);
      
      // Add image to PDF
      pdf.addImage(data, 'PNG', x, y, w, h, null, 'FAST');
    });

    const pdfBlob = pdf.output('blob');
    self.postMessage({ type: 'success', blob: pdfBlob });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};
