import React, { useRef } from 'react';
import jsPDF from 'jspdf';

const PDFGenerator = ({ chartRef, filename }) => {
  // generate pdf from chart
  const generatePDF = () => {
    const canvas = chartRef.current;
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0);
    pdf.save(`${filename}.pdf`);
  }

  return (
    <button onClick={generatePDF}>Download PDF</button>
  );
};

export default PDFGenerator;



