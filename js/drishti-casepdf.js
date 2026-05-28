/**
 * Drishti — Case Study PDF Generator
 * Generates branded PDFs with purple (#7B2FBE) theme using jsPDF from CDN.
 */

const CASES = {
  navy: {
    agency: 'INDIAN NAVY',
    title: 'Operation Dark Waters',
    subtitle: 'Dark Vessel Detection & Sanctions-Linked Network Exposure',
    situation: 'A foreign-flagged bulk carrier turns off its AIS transponder for 6 hours while transiting the Indian EEZ near the Andaman Sea. When AIS resumes, the vessel is 40nm from its expected course.',
    timeline: [
      ['T+2 hrs', 'Dark gap engine detects AIS blackout at 2-hour threshold. Vessel flagged for continuous monitoring. Alert status: HIGH.'],
      ['T+2.5 hrs', 'Vessel ownership traced through 3 shell companies using procurement and MCA registry data. Ultimate beneficial owner identified.'],
      ['T+3 hrs', 'Sanctions screening reveals beneficial owner is on EU sanctions list. Cross-reference with procurement records shows same entity won a port services contract in a strategic harbour.'],
      ['T+3.1 hrs', 'CRITICAL alert fires: "Sanctions-linked vessel dark in EEZ + connected to sensitive port contract." Alert requires 2+ independent domains — maritime + sanctions + procurement confirmed.'],
      ['T+3.5 hrs', 'Navy patrol vessel dispatched. Board inspection reveals undeclared cargo. Evidence bundle generated with full chain: AIS gap record, ownership graph, sanctions match, procurement link. All SHA-256 signed.'],
    ],
    impact: 'Navy patrol vessel dispatched within 30 minutes of CRITICAL alert. Board inspection reveals undeclared cargo. Evidence bundle generated with full chain: AIS gap record, ownership graph, sanctions match, procurement link. All SHA-256 signed and court-admissible.',
    metrics: { 'Dark Gap': '6 hrs', 'Shell Companies': '3', 'Sanctions Match': '1', 'Response Time': '30 min' },
  },
  raw: {
    agency: 'RAW',
    title: 'Operation Phantom Procurement',
    subtitle: 'Shell Company Network Mapping via Entity Resolution',
    situation: 'Intelligence analysis suspects a network of shell companies is systematically winning defence procurement contracts. Manual investigation has identified 2 companies but suspects there are more.',
    timeline: [
      ['Phase 1', 'Entity resolution traces the 2 known companies through phone numbers, director names, and registered addresses. 5 additional companies discovered sharing directors.'],
      ['Phase 2', 'Procurement records show all 7 companies won contracts at 4 sensitive defence facilities. Systematic access pattern detected.'],
      ['Phase 3', 'Financial domain reveals crypto transactions between 3 of the companies. Transaction patterns flagged by automated rule evaluation.'],
      ['Phase 4', 'Ownership graph shows ultimate beneficial owner is a foreign national. Complete network mapped: 7 companies, 12 directors, 4 facilities, 1 foreign beneficial owner.'],
      ['Phase 5', 'Prosecution-ready evidence bundle generated. Full entity graph, ownership chains, procurement links, financial transactions. All SHA-256 signed.'],
    ],
    impact: 'Complete shell network mapped in under 2 hours — manual investigation had taken 4 months for the first 2 companies. Evidence bundle links 7 companies, 12 directors, 4 facilities, and 1 foreign beneficial owner. Prosecution-ready with full chain of custody.',
    metrics: { 'Shell Companies': '7', 'Directors': '12', 'Facilities': '4', 'Time': '2 hrs vs 4 months' },
  },
  coastguard: {
    agency: 'INDIAN COAST GUARD',
    title: 'Operation Sea Shield',
    subtitle: 'Ship-to-Ship Transfer Network Documentation',
    situation: 'Repeated suspected ship-to-ship transfers in a specific zone of the Arabian Sea. The Coast Guard has satellite imagery showing two vessels in proximity but cannot confirm the pattern or identify the network.',
    timeline: [
      ['Day 1', 'STS detection rule identifies 4 suspected transfer events in the past 90 days. Vessel identifiers resolved against IMO registry.'],
      ['Day 2', 'Ownership chains traced. 2 of 4 vessels linked by common beneficial ownership. Shell company layers identified.'],
      ['Day 3', 'Sanctions screening flags one vessel\'s previous port calls at sanctioned ports. Strategic port pattern rule fires.'],
      ['Day 4', 'Social media monitoring finds crew\'s Telegram group with location-tagged photos confirming proximity during one of the suspected transfer events.'],
      ['Day 5', 'Entire STS network documented. Coast Guard interdicts the next scheduled transfer. Evidence bundle covers maritime, sanctions, ownership, and social domains.'],
    ],
    impact: 'Entire STS transfer network documented with 4 events, 6 vessels, 3 ownership chains, 1 sanctions link, and social media confirmation. Coast Guard interdicts the next scheduled transfer with prosecution-ready evidence.',
    metrics: { 'STS Events': '4', 'Vessels': '6', 'Pattern Period': '90 days', 'Domains': '4' },
  },
  ntro: {
    agency: 'NTRO',
    title: 'Operation Digital Fortress',
    subtitle: 'Rogue UAV Operator Identification via Multi-Domain Fusion',
    situation: 'A rogue UAV is detected operating near a sensitive research facility without a transponder or filed flight plan. Physical security reports visual sighting but cannot identify the operator.',
    timeline: [
      ['T+0', 'Geofence violation rule fires immediately. Aviation registry queried for nearby registered UAVs — no match found.'],
      ['T+5 min', 'Procurement records show a company purchased commercial UAVs matching the visual description. Company details retrieved from MCA registry.'],
      ['T+10 min', 'Company director\'s phone number matches a Telegram account in a technology discussion group. Account clustering reveals connection to surveillance equipment discussions.'],
      ['T+15 min', 'Social media monitoring reveals posts with geotagged photos near 3 other sensitive facilities over the past 6 months. 4-facility surveillance pattern established.'],
      ['T+20 min', 'UAV operator identified. Evidence bundle covers aviation, procurement, social media, and geo domains. 6-month pattern documented.'],
    ],
    impact: 'UAV operator identified and linked to a company conducting unauthorized surveillance of 4 sensitive facilities. 6-month pattern established through multi-domain fusion. Evidence bundle covers aviation, procurement, social media, and geo domains.',
    metrics: { 'UAV': '1', 'Facilities': '4', 'Pattern': '6 months', 'Domains': '4' },
  },
  mea: {
    agency: 'MEA',
    title: 'Operation Sanctions Web',
    subtitle: 'Joint Venture Sanctions Exposure Assessment',
    situation: 'India\'s delegation to a multilateral forum needs to verify whether a proposed joint venture partner has sanctions exposure. The entity operates across maritime shipping, procurement, and financial services in the Indo-Pacific.',
    timeline: [
      ['Hour 1', 'Entity name entered into Drishti. Entity resolver finds matches across maritime registry (3 vessels), procurement filings (2 contracts in Indian ports), and financial domain.'],
      ['Hour 2', 'Financial domain reveals crypto transactions flagged by partner agencies. Sanctions screening identifies the entity\'s parent company on EU sanctions list.'],
      ['Hour 3', 'Ownership chain shows 2 layers of shell companies between the sanctioned parent and the proposed JV partner. Complete exposure map generated.'],
      ['Hour 4', 'Complete sanctions exposure report delivered. The proposed JV is rejected. Evidence bundle shared as diplomatic dossier with ownership chain, sanctions match, and all source references.'],
    ],
    impact: 'MEA delegation receives a complete sanctions exposure report within 4 hours. The proposed JV is rejected. The evidence bundle — with ownership chain, sanctions match, and all source references — is shared as a diplomatic dossier. Without Drishti, this analysis would require coordination across 4 ministries and 2+ weeks.',
    metrics: { 'Vessels': '3', 'Contracts': '2', 'Shell Layers': '2', 'Time': '4 hrs vs 2 weeks' },
  },
};

async function loadJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function wrapText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach(line => {
    if (y > 270) {
      doc.addPage();
      y = 25;
    }
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

async function downloadDrishtiCaseStudy(key) {
  const data = CASES[key];
  if (!data) return;

  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const pw = 210;
  const margin = 20;
  const contentW = pw - margin * 2;

  // Purple header bar
  doc.setFillColor(123, 47, 190);
  doc.rect(0, 0, pw, 8, 'F');

  // Classification bar
  doc.setFillColor(13, 17, 23);
  doc.rect(0, 8, pw, 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(167, 139, 250);
  doc.text('DRISHTI CASE STUDY', margin, 20);
  doc.setTextColor(139, 148, 158);
  doc.text(`${data.agency}`, pw - margin, 20, { align: 'right' });

  // Title
  doc.setTextColor(33, 33, 33);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  let y = 50;
  y = wrapText(doc, data.title, margin, y, contentW, 10);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  y = wrapText(doc, data.subtitle, margin, y + 4, contentW, 6);

  // Metrics bar
  y += 10;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, 'F');

  const metricKeys = Object.keys(data.metrics);
  const metricW = contentW / metricKeys.length;
  metricKeys.forEach((k, i) => {
    const mx = margin + i * metricW + metricW / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(123, 47, 190);
    doc.text(data.metrics[k], mx, y + 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(k.toUpperCase(), mx, y + 16, { align: 'center' });
  });

  y += 32;

  // Situation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(123, 47, 190);
  doc.text('THE SITUATION', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  y = wrapText(doc, data.situation, margin, y, contentW, 5);

  y += 8;

  // Timeline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 200, 255);
  doc.text('OPERATIONAL TIMELINE', margin, y);
  y += 7;

  data.timeline.forEach(([time, desc]) => {
    if (y > 260) {
      doc.addPage();
      doc.setFillColor(123, 47, 190);
      doc.rect(0, 0, pw, 4, 'F');
      y = 20;
    }

    // Time badge
    doc.setFillColor(123, 47, 190);
    const timeW = doc.getStringUnitWidth(time) * 8 / doc.internal.scaleFactor + 6;
    doc.roundedRect(margin, y - 3.5, timeW, 5.5, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(time, margin + 3, y);

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    y = wrapText(doc, desc, margin + timeW + 4, y, contentW - timeW - 4, 4.5);
    y += 4;
  });

  y += 6;

  // Impact
  if (y > 240) {
    doc.addPage();
    doc.setFillColor(123, 47, 190);
    doc.rect(0, 0, pw, 4, 'F');
    y = 20;
  }

  doc.setFillColor(248, 245, 255);
  const impactLines = doc.splitTextToSize(data.impact, contentW - 16);
  const impactH = impactLines.length * 5 + 16;
  doc.roundedRect(margin, y, contentW, impactH, 3, 3, 'F');
  doc.setDrawColor(123, 47, 190);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin, y + impactH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(123, 47, 190);
  doc.text('OPERATIONAL IMPACT', margin + 8, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 60, 60);
  wrapText(doc, data.impact, margin + 8, y + 14, contentW - 16, 5);

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text('DRISHTI by Garud Research & Tech Pvt. Ltd.  |  grosint.in  |  CONFIDENTIAL', pw / 2, 290, { align: 'center' });
    doc.text(`Page ${p} of ${pageCount}`, pw - margin, 290, { align: 'right' });
  }

  // Save
  const filename = `Drishti_CaseStudy_${data.agency.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}

// Expose globally for onclick handlers
window.__downloadDrishtiCaseStudy = downloadDrishtiCaseStudy;
