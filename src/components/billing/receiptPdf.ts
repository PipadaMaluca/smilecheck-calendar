import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ReceiptData {
  id: string;
  date: string;
  description: string;
  amount: number;
  method: string;
  clientName?: string;
  clientNif?: string;
  clientEmail?: string;
}

export function generateReceiptPdf(data: ReceiptData): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246); // primary blue
  doc.text('SmileCheck', margin, 25);

  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text('RECIBO', pageWidth - margin, 25, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Nº: ${data.id}`, pageWidth - margin, 33, { align: 'right' });
  doc.text(`Data: ${data.date}`, pageWidth - margin, 39, { align: 'right' });

  // Blue separator
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.8);
  doc.line(margin, 45, pageWidth - margin, 45);

  // Issuer info (left)
  let y = 55;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('EMITENTE', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('SmileCheck, Lda.', margin, y); y += 4.5;
  doc.text('NIF: 509 123 456', margin, y); y += 4.5;
  doc.text('Av. da Liberdade 123, 1250-096 Lisboa', margin, y); y += 4.5;
  doc.text('info@smilecheck.pt', margin, y);

  // Client info (right)
  y = 55;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('CLIENTE', pageWidth - margin, y, { align: 'right' });
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(data.clientName || 'João Silva', pageWidth - margin, y, { align: 'right' }); y += 4.5;
  if (data.clientNif) {
    doc.text(`NIF: ${data.clientNif}`, pageWidth - margin, y, { align: 'right' }); y += 4.5;
  }
  doc.text(data.clientEmail || 'joao.silva@email.com', pageWidth - margin, y, { align: 'right' });

  // Service table
  const subtotal = data.amount / 1.23;
  const iva = data.amount - subtotal;

  y = 95;
  (doc as any).autoTable({
    startY: y,
    head: [['Descrição', 'Qtd', 'Valor Unit.', 'IVA', 'Total']],
    body: [
      [data.description, '1', `€${subtotal.toFixed(2)}`, `23% (€${iva.toFixed(2)})`, `€${data.amount.toFixed(2)}`],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  // Totals
  const tableEndY = (doc as any).lastAutoTable?.finalY || y + 25;
  let ty = tableEndY + 10;

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('Subtotal (s/ IVA):', pageWidth - margin - 40, ty);
  doc.text(`€${subtotal.toFixed(2)}`, pageWidth - margin, ty, { align: 'right' });
  ty += 6;
  doc.text('IVA (23%):', pageWidth - margin - 40, ty);
  doc.text(`€${iva.toFixed(2)}`, pageWidth - margin, ty, { align: 'right' });
  ty += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text('Total:', pageWidth - margin - 40, ty);
  doc.text(`€${data.amount.toFixed(2)}`, pageWidth - margin, ty, { align: 'right' });

  // Payment info
  ty += 15;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, ty, pageWidth - margin, ty);
  ty += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Método de pagamento: ${data.method}`, margin, ty);
  doc.text('Estado: Pago ✓', pageWidth - margin, ty, { align: 'right' });
  ty += 5;
  doc.text(`Data do pagamento: ${data.date}`, margin, ty);

  // Footer
  ty = doc.internal.pageSize.getHeight() - 25;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, ty - 5, pageWidth - margin, ty - 5);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Este documento serve como comprovativo de pagamento.', pageWidth / 2, ty, { align: 'center' });
  doc.text('SmileCheck, Lda. — NIF 509 123 456 — www.smilecheck.pt', pageWidth / 2, ty + 5, { align: 'center' });

  return doc;
}

export function downloadReceipt(data: ReceiptData) {
  const doc = generateReceiptPdf(data);
  doc.save(`recibo-${data.id}.pdf`);
}

export function printReceipt(data: ReceiptData) {
  const doc = generateReceiptPdf(data);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const win = window.open(url);
  if (win) {
    win.onload = () => win.print();
  }
}
