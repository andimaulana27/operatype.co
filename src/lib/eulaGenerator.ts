// src/lib/eulaGenerator.ts
import jsPDF from "jspdf";
import { InvoiceDetails } from "@/app/actions/invoiceActions";
import fs from 'fs';
import path from 'path';

// (Konten licenseTerms tetap sama...)
const licenseTerms = {
  'Desktop': {
    title: 'Desktop License Agreement',
    allowed: [
      "Personal projects such as school work, student assignments, personal portfolios, resumes, or hobby-based designs.",
      "Non-commercial prints such as posters for personal use, greeting cards, or home decoration.",
      "Use on personal devices with no commercial intent."
    ],
    notAllowed: [
      "Any commercial use (selling products, business branding, advertisements).",
      "Use for creating logos, trademarks, websites, apps, or client projects.",
      "Usage by more than one individual.",
      "Embedding into websites, apps, games, or digital platforms.",
      "Redistribution, reselling, or sharing of the font files.",
      "Modification of the font with intent to redistribute."
    ]
  },
  'Standard Commercial': {
    title: 'Standard Commercial License Agreement',
    allowed: [
      "Client work including branding, logo design, packaging, stationery, and marketing materials.",
      "Social media content for business accounts (static images, banners, thumbnails).",
      "Print-based materials such as books, magazines, brochures, flyers, stickers, t-shirts, posters, and product packaging.",
      "Static website use (images such as JPG, PNG, or PDF).",
      "Installation on a maximum of 2 devices for 1 user only."
    ],
    notAllowed: [
      "Webfont embedding (.woff, .woff2, .eot, .svg) for live text on websites.",
      "Use in mobile applications or video games.",
      "Usage by multiple users, agencies, or teams without additional licenses.",
      "Incorporation into software, templates, or digital products for resale.",
      "Broadcasting or advertising campaigns on TV, streaming platforms, or large-scale media."
    ]
  },
  'Extended Commercial': {
    title: 'Extended Commercial License Agreement',
    allowed: [
      "All usage rights granted under the Standard Commercial License.",
      "Web embedding (using .woff / .woff2 formats) with up to 1,000,000 pageviews per month across a single domain.",
      "Use in mobile applications and games, up to 100,000 downloads.",
      "Creation and sale of paid digital products such as e-books, design templates, or asset bundles (the font itself cannot be included as an installable file).",
      "Broadcast and advertising campaigns, including TV commercials, YouTube ads, TikTok, Instagram Reels, and other social media video ads.",
      "Installation for up to 5 users across 5 devices."
    ],
    notAllowed: [
      "Use in AI training, machine learning datasets, or generative tools.",
      "Inclusion in open-source platforms, repositories, or shared asset libraries.",
      "Redistribution, resale, or claiming the font as your own.",
      "Unlimited app or web embedding (requires Corporate License)."
    ]
  },
  'Corporate': {
    title: 'Corporate License Agreement',
    allowed: [
      "All usage rights granted under the Extended Commercial License.",
      "Corporate branding on a large scale: company logos, trademarks, product packaging, environmental design, interior signage, uniforms, and full brand systems.",
      "Use on primary websites, microsites, and corporate intranet or internal systems.",
      "Unlimited use in applications, games, and software with no download restrictions.",
      "Unlimited web embedding across multiple domains with no pageview limits.",
      "Broadcasting and advertising across all media: television, cinema, billboards, digital out-of-home (DOOH), streaming services, and global campaigns.",
      "Installation for up to 20 active users within the company."
    ],
    notAllowed: [
        "The purchasing company must provide its legal company name at the time of licensing.",
        "The license is valid only for the named company and cannot be transferred.",
        "For multinational corporations or enterprises exceeding 20 users, a custom or enterprise license may be required."
    ]
  }
};
type LicenseType = keyof typeof licenseTerms;

// --- PERBAIKAN 1: Ubah return type menjadi Promise<ArrayBuffer> ---
export async function generateEulaPdf(invoice: InvoiceDetails): Promise<ArrayBuffer> {
  if (!invoice || !invoice.user || !invoice.order_items.length) {
    throw new Error("Invalid invoice data for EULA generation.");
  }
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.width;
  const margin = 14;
  let currentY = margin;
  try {
    const logoPath = path.resolve(process.cwd(), 'public/logo-operatype.png');
    const logoBuffer = fs.readFileSync(logoPath);
    doc.addImage(logoBuffer, 'PNG', margin, currentY, 50, 15);
  } catch (e) {
    console.error("Failed to load logo for EULA PDF:", e);
  }
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("End-User License Agreement", pageW - margin, margin + 15, { align: "right" });
  currentY += 40;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, currentY, pageW - margin, currentY);
  currentY += 15;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`LICENSEE:`, margin, currentY);
  doc.text(`DATE ISSUED:`, pageW / 2, currentY);
  doc.text(`INVOICE ID:`, pageW - margin, currentY, { align: "right" });
  currentY += 6;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text(invoice.user?.full_name || "N/A", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(invoice.created_at!).toLocaleDateString("en-GB"), pageW / 2, currentY);
  doc.text(`#${invoice.invoice_id || "N/A"}`, pageW - margin, currentY, { align: "right" });
  currentY += 15;
  for (const item of invoice.order_items) {
    const licenseType = item.license_type as LicenseType;
    const terms = licenseTerms[licenseType];
    if (!terms) continue;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(`Font: ${item.font?.name || "Unknown"} - ${terms.title}`, margin, currentY);
    currentY += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 150, 0);
    doc.text('ALLOWED USES:', margin, currentY);
    currentY += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    terms.allowed.forEach(rule => {
        const splitText = doc.splitTextToSize(`• ${rule}`, pageW - (margin * 2));
        doc.text(splitText, margin + 4, currentY);
        currentY += (Array.isArray(splitText) ? splitText.length : 1) * 5;
    });
    currentY += 4;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(200, 0, 0);
    doc.text('NOT ALLOWED:', margin, currentY);
    currentY += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    terms.notAllowed.forEach(rule => {
        const splitText = doc.splitTextToSize(`• ${rule}`, pageW - (margin * 2));
        doc.text(splitText, margin + 4, currentY);
        currentY += (Array.isArray(splitText) ? splitText.length : 1) * 5;
    });
    currentY += 10;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, currentY, pageW - margin, currentY);
    currentY += 10;
  }
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  const footerText = `This document confirms the license rights for the products listed above. For full terms, please visit operatype.co/license.`;
  const splitFooter = doc.splitTextToSize(footerText, pageW - (margin*2));
  doc.text(splitFooter, margin, doc.internal.pageSize.height - 20);

  // --- PERBAIKAN 2: Kembalikan ArrayBuffer secara langsung ---
  return doc.output("arraybuffer");
}