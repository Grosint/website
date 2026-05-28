/**
 * GROSINT — Premium Case Study PDF Generator
 * Ministry-grade, light-theme, print-ready PDFs
 * Shared across Anveshak, Grosint, and Drishti product pages.
 */

/* ─── jsPDF Loader ──────────────────────────────────────────── */

let jsPDFLoaded = null;

function loadJsPDF() {
  if (jsPDFLoaded) return jsPDFLoaded;
  jsPDFLoaded = new Promise((resolve, reject) => {
    if (window.jspdf && window.jspdf.jsPDF) {
      resolve(window.jspdf.jsPDF);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js';
    s.crossOrigin = 'anonymous';
    s.onload = () => {
      if (window.jspdf && window.jspdf.jsPDF) resolve(window.jspdf.jsPDF);
      else reject(new Error('jsPDF failed to initialize'));
    };
    s.onerror = () => reject(new Error('Failed to load jsPDF CDN'));
    document.head.appendChild(s);
  });
  return jsPDFLoaded;
}

/* ─── Colours ───────────────────────────────────────────────── */

const BRAND = {
  anveshak: { r: 232, g: 125, b: 20, name: 'Anveshak', tagline: 'AI-Powered OSINT Analysis Platform' },
  grosint:  { r: 0,   g: 200, b: 255, name: 'Grosint SMINT', tagline: 'Identifier to Intelligence Platform' },
  drishti:  { r: 123, g: 47,  b: 190, name: 'Drishti', tagline: 'Sovereign Intelligence Fusion Platform' },
};

/* ─── Drawing Helpers ───────────────────────────────────────── */

function setColor(doc, r, g, b) {
  doc.setTextColor(r, g, b);
}

function drawLine(doc, x1, y1, x2, y2, r, g, b, width) {
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(width || 0.5);
  doc.line(x1, y1, x2, y2);
}

function wrapText(doc, text, x, y, maxW, lh, pageBreakY) {
  const lines = doc.splitTextToSize(text, maxW);
  for (const line of lines) {
    if (y > (pageBreakY || 272)) {
      doc.addPage();
      y = 30;
    }
    doc.text(line, x, y);
    y += lh;
  }
  return y;
}

function ensureSpace(doc, y, needed) {
  if (y + needed > 272) {
    doc.addPage();
    return 30;
  }
  return y;
}

/* ─── Page Components ───────────────────────────────────────── */

function drawHeader(doc, brand, pw, margin) {
  // Top accent bar
  doc.setFillColor(brand.r, brand.g, brand.b);
  doc.rect(0, 0, pw, 3, 'F');

  // Company header area
  doc.setFillColor(248, 249, 250);
  doc.rect(0, 3, pw, 22, 'F');

  // Logo area: GROSINT wordmark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  setColor(doc, 30, 30, 30);
  doc.text('GROSINT', margin, 16);

  // Product name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setColor(doc, brand.r, brand.g, brand.b);
  doc.text(brand.name.toUpperCase(), margin + 40, 16);

  // Right side: classification
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setColor(doc, 140, 140, 140);
  doc.text('CASE STUDY', pw - margin, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('FOR OFFICIAL USE ONLY', pw - margin, 18, { align: 'right' });

  // Separator line
  drawLine(doc, margin, 25, pw - margin, 25, brand.r, brand.g, brand.b, 0.8);
}

function drawFooter(doc, brand, pw, margin, pageNum, totalPages) {
  const y = 285;

  // Separator
  drawLine(doc, margin, y - 5, pw - margin, y - 5, 220, 220, 220, 0.3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setColor(doc, 150, 150, 150);

  // Left: company info
  doc.text('Garud Research & Tech Pvt. Ltd.  |  grosint.in  |  +91 9901 938 800', margin, y);

  // Center: classification
  doc.setFont('helvetica', 'bold');
  setColor(doc, brand.r, brand.g, brand.b);
  doc.text('CONFIDENTIAL', pw / 2, y, { align: 'center' });

  // Right: page number
  doc.setFont('helvetica', 'normal');
  setColor(doc, 150, 150, 150);
  doc.text(`Page ${pageNum} of ${totalPages}`, pw - margin, y, { align: 'right' });
}

function drawCoverPage(doc, data, brand, pw, margin, contentW) {
  drawHeader(doc, brand, pw, margin);

  let y = 42;

  // Agency badge
  doc.setFillColor(brand.r, brand.g, brand.b);
  const agencyW = doc.getStringUnitWidth(data.agency) * 8 / doc.internal.scaleFactor + 12;
  doc.roundedRect(margin, y, agencyW, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setColor(doc, 255, 255, 255);
  doc.text(data.agency, margin + 6, y + 5);

  y += 18;

  // Operation title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  setColor(doc, 25, 25, 25);
  y = wrapText(doc, data.title, margin, y, contentW, 11);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  setColor(doc, 100, 100, 100);
  y = wrapText(doc, data.subtitle, margin, y + 3, contentW, 6);

  y += 10;

  // Product tagline
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  setColor(doc, brand.r, brand.g, brand.b);
  doc.text(`Powered by ${brand.name} — ${brand.tagline}`, margin, y);

  y += 12;

  // Metrics bar
  doc.setFillColor(245, 246, 248);
  doc.roundedRect(margin, y, contentW, 28, 3, 3, 'F');
  drawLine(doc, margin, y, margin + contentW, y, brand.r, brand.g, brand.b, 0.8);

  const metricKeys = Object.keys(data.metrics);
  const metricW = contentW / metricKeys.length;
  metricKeys.forEach((k, i) => {
    const mx = margin + i * metricW + metricW / 2;

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    setColor(doc, brand.r, brand.g, brand.b);
    doc.text(data.metrics[k], mx, y + 12, { align: 'center' });

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setColor(doc, 120, 120, 120);
    doc.text(k.toUpperCase(), mx, y + 20, { align: 'center' });

    // Vertical separator (not on last)
    if (i < metricKeys.length - 1) {
      drawLine(doc, margin + (i + 1) * metricW, y + 4, margin + (i + 1) * metricW, y + 24, 220, 220, 220, 0.3);
    }
  });

  return y + 38;
}

function drawSectionTitle(doc, title, y, margin, brand) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setColor(doc, brand.r, brand.g, brand.b);
  doc.text(title, margin, y);

  // Underline
  const tw = doc.getStringUnitWidth(title) * 11 / doc.internal.scaleFactor;
  drawLine(doc, margin, y + 1.5, margin + tw, y + 1.5, brand.r, brand.g, brand.b, 0.5);

  return y + 8;
}

function drawSituation(doc, data, y, margin, contentW, brand) {
  y = ensureSpace(doc, y, 40);
  y = drawSectionTitle(doc, 'THE SITUATION', y, margin, brand);

  // Light grey background box
  doc.setFillColor(250, 250, 252);
  const sitLines = doc.splitTextToSize(data.situation, contentW - 16);
  const sitH = sitLines.length * 4.5 + 12;
  doc.roundedRect(margin, y, contentW, sitH, 2, 2, 'F');

  // Left accent bar
  doc.setFillColor(brand.r, brand.g, brand.b);
  doc.rect(margin, y, 2, sitH, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  setColor(doc, 50, 50, 50);
  y = wrapText(doc, data.situation, margin + 8, y + 8, contentW - 16, 4.5);

  return y + 6;
}

function drawTimeline(doc, data, y, margin, contentW, brand) {
  y = ensureSpace(doc, y, 30);
  y = drawSectionTitle(doc, 'OPERATIONAL TIMELINE', y, margin, brand);

  data.timeline.forEach(([time, desc]) => {
    y = ensureSpace(doc, y, 18);

    // Time badge
    doc.setFillColor(brand.r, brand.g, brand.b);
    const tw = doc.getStringUnitWidth(time) * 7.5 / doc.internal.scaleFactor + 8;
    doc.roundedRect(margin, y - 3, tw, 5.5, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    setColor(doc, 255, 255, 255);
    doc.text(time, margin + 4, y);

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(doc, 50, 50, 50);
    const descX = margin + tw + 6;
    y = wrapText(doc, desc, descX, y, contentW - tw - 6, 4.2);
    y += 3;
  });

  return y + 4;
}

function drawImpact(doc, data, y, margin, contentW, brand) {
  y = ensureSpace(doc, y, 35);
  y = drawSectionTitle(doc, 'OPERATIONAL IMPACT', y, margin, brand);

  // Impact box with accent border
  const impLines = doc.splitTextToSize(data.impact, contentW - 16);
  const impH = impLines.length * 4.5 + 14;

  doc.setFillColor(255, 252, 245);
  doc.roundedRect(margin, y, contentW, impH, 2, 2, 'F');

  // Left accent bar
  doc.setFillColor(brand.r, brand.g, brand.b);
  doc.rect(margin, y, 3, impH, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  setColor(doc, 40, 40, 40);
  wrapText(doc, data.impact, margin + 10, y + 8, contentW - 16, 4.5);

  return y + impH + 8;
}

function drawContactPage(doc, brand, pw, margin, contentW) {
  doc.addPage();

  drawHeader(doc, brand, pw, margin);

  let y = 45;

  // "Next Steps" heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  setColor(doc, 25, 25, 25);
  doc.text('Next Steps', margin, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setColor(doc, 60, 60, 60);
  y = wrapText(doc, 'If this case study resonates with your operational requirements, we invite you to schedule a classified briefing with our team. All demonstrations are conducted on-premise with no data leaving your facility.', margin, y, contentW, 5);

  y += 12;

  // Contact card
  doc.setFillColor(245, 246, 248);
  doc.roundedRect(margin, y, contentW, 65, 3, 3, 'F');
  drawLine(doc, margin, y, margin + contentW, y, brand.r, brand.g, brand.b, 1);

  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  setColor(doc, 25, 25, 25);
  doc.text('Garud Research & Tech Pvt. Ltd.', margin + 10, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setColor(doc, brand.r, brand.g, brand.b);
  doc.text(brand.tagline, margin + 10, y);
  y += 10;

  const contactItems = [
    ['Phone', '+91 9901 938 800'],
    ['WhatsApp', 'wa.me/919901938800'],
    ['Website', 'grosint.in'],
    ['Email', 'contact@grosint.in'],
  ];

  contactItems.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setColor(doc, 120, 120, 120);
    doc.text(label.toUpperCase(), margin + 10, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(doc, 40, 40, 40);
    doc.text(value, margin + 40, y);
    y += 6;
  });

  y += 15;

  // Three product boxes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setColor(doc, 25, 25, 25);
  doc.text('The Grosint Suite', margin, y);
  y += 8;

  const products = [
    { name: 'Grosint SMINT', desc: 'Identifier to Intelligence', color: [0, 200, 255] },
    { name: 'Anveshak', desc: 'AI-Powered OSINT Analysis', color: [232, 125, 20] },
    { name: 'Drishti', desc: 'Sovereign Intelligence Fusion', color: [123, 47, 190] },
  ];

  const boxW = (contentW - 8) / 3;
  products.forEach((p, i) => {
    const bx = margin + i * (boxW + 4);
    doc.setFillColor(250, 250, 252);
    doc.roundedRect(bx, y, boxW, 22, 2, 2, 'F');
    drawLine(doc, bx, y, bx + boxW, y, p.color[0], p.color[1], p.color[2], 1.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, p.color[0], p.color[1], p.color[2]);
    doc.text(p.name, bx + 5, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setColor(doc, 100, 100, 100);
    doc.text(p.desc, bx + 5, y + 16);
  });

  y += 35;

  // Disclaimer
  doc.setFillColor(255, 248, 240);
  doc.roundedRect(margin, y, contentW, 20, 2, 2, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  setColor(doc, 140, 120, 80);
  wrapText(doc, 'DISCLAIMER: This case study presents a hypothetical operational scenario designed to illustrate the capabilities of the platform. All operational details, timelines, and outcomes are illustrative. Actual performance may vary based on deployment configuration, data source availability, and operational context.', margin + 6, y + 5, contentW - 12, 3.5);

  // Bottom branding
  y += 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setColor(doc, 180, 180, 180);
  doc.text('Made in Bharat. For Bharat.', pw / 2, y, { align: 'center' });
}

/* ─── Main Generator ────────────────────────────────────────── */

async function generateCaseStudyPDF(productKey, caseKey, casesData) {
  const data = casesData[caseKey];
  if (!data) { alert('Case study not found.'); return; }

  const brand = BRAND[productKey];
  if (!brand) { alert('Unknown product.'); return; }

  let JsPDF;
  try {
    JsPDF = await loadJsPDF();
  } catch (e) {
    alert('Failed to load PDF library. Please check your internet connection and try again.');
    console.error(e);
    return;
  }

  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const pw = 210;
  const margin = 18;
  const contentW = pw - margin * 2;

  // ── Cover / Metrics
  let y = drawCoverPage(doc, data, brand, pw, margin, contentW);

  // ── Situation
  y = drawSituation(doc, data, y, margin, contentW, brand);

  // ── Timeline
  y = drawTimeline(doc, data, y, margin, contentW, brand);

  // ── Impact
  y = drawImpact(doc, data, y, margin, contentW, brand);

  // ── Contact page (last page)
  drawContactPage(doc, brand, pw, margin, contentW);

  // ── Apply headers & footers to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    if (p > 1) drawHeader(doc, brand, pw, margin);
    drawFooter(doc, brand, pw, margin, p, totalPages);
  }

  // Save
  const filename = `${brand.name.replace(/\s+/g, '_')}_CaseStudy_${data.agency.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}

/* ─── Export for each product ───────────────────────────────── */

window.__generateCaseStudyPDF = generateCaseStudyPDF;
