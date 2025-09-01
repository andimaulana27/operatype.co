// src/app/(main)/account/orders/[invoiceId]/InvoiceDisplay.tsx
'use client';

import type { InvoiceDetails } from '@/app/actions/invoiceActions';
import { DownloadIcon } from '@/components/icons';
import Image from 'next/image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

// Terima invoice sebagai prop
export default function InvoiceDisplay({ invoice }: { invoice: NonNullable<InvoiceDetails> }) {
  
  const handleDownloadPdf = async () => {
    // Logika download PDF tidak berubah, karena ini memang harus berjalan di sisi klien.
    toast.loading('Generating PDF...');
    
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.width;
    const margin = 14;
    let currentY = margin;
    
    try {
      const logoImg = new window.Image();
      logoImg.src = '/logo-operatype.png';

      await new Promise<void>((resolve) => {
        logoImg.onload = () => {
          doc.addImage(logoImg, 'PNG', margin, currentY, 50, 15);
          resolve();
        };
        logoImg.onerror = () => { console.error("Gagal memuat gambar logo."); resolve(); };
      });
      currentY += 18;
    } catch (e) {
      console.error("Error saat menambahkan logo ke PDF:", e);
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Operatype.co', margin, currentY);
    currentY += 5;
    doc.text('Tasikmalaya, West Java, Indonesia', margin, currentY);

    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('INVOICE', pageW - margin, margin + 15, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`#${invoice.invoice_id || 'N/A'}`, pageW - margin, margin + 21, { align: 'right' });
    
    currentY += 15;

    doc.setDrawColor(230, 230, 230);
    doc.line(margin, currentY, pageW - margin, currentY);
    currentY += 15;

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`INVOICE TO:`, margin, currentY);
    doc.text(`DATE ISSUED:`, pageW - margin - 45, currentY);
    
    currentY += 6;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(invoice.user?.full_name || 'N/A', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(invoice.created_at!).toLocaleDateString('en-GB'), pageW - margin, currentY, { align: 'right' });

    currentY += 5;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(invoice.user?.email || 'N/A', margin, currentY);

    currentY += 15;

    const tableColumn = ["Product", "License", "Users", "Price"];
    const tableRows: (string | number)[][] = invoice.order_items.map(item => [
      item.font?.name || 'Unknown Font',
      item.license_type || 'N/A',
      item.user_count || 1,
      `$${item.amount?.toFixed(2) || '0.00'}`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [tableColumn],
      body: tableRows,
      theme: 'plain',
      headStyles: { 
        fillColor: [200, 112, 92], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10,
      },
      styles: { fontSize: 10, textColor: [40, 40, 40] },
      columnStyles: { 3: { halign: 'right' } },
      margin: { left: margin, right: margin }
    });
    
    let finalY = (doc as any).lastAutoTable.finalY;
    
    doc.setFillColor(245, 245, 245);
    doc.rect(pageW - margin - 80, finalY + 8, 80, 12, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', pageW - margin - 75, finalY + 16);
    doc.text(`$${invoice.total_amount?.toFixed(2) || '0.00'}`, pageW - margin - 5, finalY + 16, { align: 'right' });
    
    let footerY = finalY + 35; 
    const pageH = doc.internal.pageSize.height;
    if (footerY > pageH - 20) {
      doc.addPage();
      footerY = margin;
    }

    const footerText = [
      'Thank you for your purchase at Operatype.co.',
      'We’re glad to be part of your creative journey.',
      'Enjoy the font — and feel free to return anytime for more quality type.'
    ];

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(footerText, margin, footerY);
    
    doc.save(`invoice-${invoice.invoice_id}.pdf`);
    toast.dismiss();
    toast.success('PDF downloaded!');
  };

  return (
    <div className="bg-white max-w-4xl mx-auto my-12 p-8 shadow-lg rounded-lg border">
      {/* Tampilan JSX tidak berubah */}
      <div className="flex justify-between items-start pb-6 border-b">
        <div>
          <Image src="/logo-operatype.png" alt="Operatype.co Logo" width={180} height={48} />
          <p className="text-sm text-gray-500 mt-2">Tasikmalaya, West Java, Indonesia</p>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-bold uppercase text-gray-700">Invoice</h1>
          <p className="text-sm text-gray-500 mt-1">#{invoice.invoice_id}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-start pt-6 mb-8">
        <div>
          <p className="font-semibold text-gray-600">INVOICE TO:</p>
          <p className="text-lg font-medium text-brand-black">{invoice.user?.full_name}</p>
          <p className="text-gray-600">{invoice.user?.email}</p>
        </div>
        <div className="text-right">
          <p><span className="font-semibold text-gray-600">Date Issued:</span> {new Date(invoice.created_at!).toLocaleDateString('en-GB')}</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 font-semibold text-sm">Product</th>
              <th className="p-3 font-semibold text-sm">License</th>
              <th className="p-3 font-semibold text-sm text-center">Users</th>
              <th className="p-3 font-semibold text-sm text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {invoice.order_items.map(item => (
              <tr key={item.id} className="border-b">
                <td className="p-3">{item.font?.name || 'Unknown Font'}</td>
                <td className="p-3">{item.license_type}</td>
                <td className="p-3 text-center">{item.user_count}</td>
                <td className="p-3 text-right font-medium">${item.amount?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end mt-6">
        <div className="w-full max-w-xs text-right">
          <div className="flex justify-between text-lg font-bold text-brand-black bg-gray-100 p-3 rounded-md">
            <span>Total</span>
            <span>${invoice.total_amount?.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-12 border-t pt-6">
        <p className="text-sm text-gray-500">Thank you for your business!</p>
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 bg-brand-orange text-white font-medium py-2 px-5 rounded-full hover:bg-brand-orange-hover transition-colors"
        >
          <DownloadIcon className="w-5 h-5" />
          Download PDF
        </button>
      </div>
    </div>
  );
}