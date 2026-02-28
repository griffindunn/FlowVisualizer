import { jsPDF } from 'jspdf';

self.onmessage = (e) => {
  const { images } = e.data;

  if (!images || images.length === 0) {
    self.postMessage({ type: 'error', error: 'No images provided' });
    return;
  }

  try {
    // Initialize PDF with the dimensions of the first image
    // Using 'px' unit ensures 1:1 mapping if we want, or at least consistent scaling
    // We use the first image's dimensions for the initial page
    const firstImg = images[0];
    const pdf = new jsPDF({
      orientation: firstImg.width > firstImg.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [firstImg.width, firstImg.height],
      compress: true,
    });

    // Add first image
    const data0 = new Uint8Array(firstImg.data);
    pdf.addImage(data0, 'PNG', 0, 0, firstImg.width, firstImg.height, null, 'FAST');

    // Add subsequent images
    for (let i = 1; i < images.length; i++) {
      const img = images[i];
      const orientation = img.width > img.height ? 'landscape' : 'portrait';
      
      // Add new page with specific dimensions for this image
      pdf.addPage([img.width, img.height], orientation);
      
      const data = new Uint8Array(img.data);
      pdf.addImage(data, 'PNG', 0, 0, img.width, img.height, null, 'FAST');
    }

    const pdfBlob = pdf.output('blob');
    self.postMessage({ type: 'success', blob: pdfBlob });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};
