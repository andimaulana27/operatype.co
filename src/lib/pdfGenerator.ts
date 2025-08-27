// src/lib/pdfGenerator.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { InvoiceDetails } from "@/app/actions/invoiceActions"; // Kita gunakan lagi tipe data ini

// Fungsi ini akan membuat PDF dan mengembalikannya sebagai Buffer
export async function generateInvoicePdf(invoice: InvoiceDetails): Promise<Buffer> {
  if (!invoice || !invoice.user) {
    throw new Error("Invalid invoice data provided.");
  }

  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.width;
  const margin = 14;
  let currentY = margin;

  // Kita tidak bisa memuat gambar dari path lokal di server, jadi kita lewati logo untuk saat ini.
  // Jika logo di-host di URL publik, Anda bisa menggunakan teknik fetch untuk mendapatkannya.
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Operatype.co", margin, currentY + 18);
  doc.text("Tasikmalaya, West Java, Indonesia", margin, currentY + 23);
  
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("INVOICE", pageW - margin, margin + 15, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text(`#${invoice.invoice_id || "N/A"}`, pageW - margin, margin + 21, { align: "right" });
  
  currentY += 40;

  doc.setDrawColor(230, 230, 230);
  doc.line(margin, currentY, pageW - margin, currentY);
  currentY += 15;

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`INVOICE TO:`, margin, currentY);
  doc.text(`DATE ISSUED:`, pageW - margin - 45, currentY);
  currentY += 6;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text(invoice.user?.full_name || "N/A", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(invoice.created_at!).toLocaleDateString("en-GB"), pageW - margin, currentY, { align: "right" });
  currentY += 5;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(invoice.user?.email || "N/A", margin, currentY);
  currentY += 15;

  const tableColumn = ["Product", "License", "Users", "Price"];
  const tableRows = invoice.order_items.map(item => [
    item.font?.name || "Unknown Font",
    item.license_type || "N/A",
    item.user_count || 1,
    `$${item.amount?.toFixed(2) || "0.00"}`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [tableColumn],
    body: tableRows,
    theme: "plain",
    headStyles: { 
      fillColor: [200, 112, 92],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: { fontSize: 10, textColor: [40, 40, 40] },
    columnStyles: { 3: { halign: "right" } },
    margin: { left: margin, right: margin }
  });

  let finalY = (doc as any).lastAutoTable.finalY;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total:", pageW - margin - 40, finalY + 15);
  doc.text(`$${invoice.total_amount?.toFixed(2) || "0.00"}`, pageW - margin, finalY + 15, { align: "right" });
  finalY += 30;

  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Thank you for your business!", margin, finalY);

  // Mengembalikan PDF sebagai Buffer
  return Buffer.from(doc.output("arraybuffer"));
}