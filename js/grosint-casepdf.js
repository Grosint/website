/**
 * Grosint SMINT — Case Study PDF Generator
 * Generates branded PDFs using jsPDF loaded from CDN.
 */

const GROSINT_CASES = {
  police: {
    agency: 'STATE POLICE',
    title: 'Operation Digital Trail',
    subtitle: 'Kidnapping Suspect Network Mapped from a Single Phone Number',
    situation: 'A suspect in a kidnapping case has abandoned their primary phone. Police have only a secondary number found on a scrap of paper at the suspect\'s last known location. The cyber cell has been tasked with building the suspect\'s digital profile, but manual OSINT would take 2-3 days.',
    timeline: [
      ['T+0s', 'Number entered into Grosint. Parallel queries fire across telecom, social, and breach databases simultaneously.'],
      ['T+3s', 'Telecom intelligence reveals the registered name and activation circle. Caller ID services return a profile photo and associated tags.'],
      ['T+8s', 'Messaging app search discovers an active account with a display name and profile photo. Social enumeration reveals the number is registered on 6 platforms.'],
      ['T+15s', 'Breach database returns an email address associated with the number from a 2021 data exposure incident.'],
      ['T+30s', 'Email pivot triggered on the discovered email. Service enumeration discovers 3 more linked social accounts with different display names.'],
      ['T+2min', 'Social graph analysis maps connections between the suspect\'s accounts and reveals associations with 4 other individuals through group memberships and shared contacts.'],
      ['T+4min', 'Complete suspect network mapped. Full evidence package generated with source attribution for every data point.'],
    ],
    impact: 'Complete suspect network mapped in 4 minutes from a single phone number. The cyber cell would have taken 2-3 days of manual OSINT to achieve the same result. 47 data points recovered, 4 linked suspects identified, and a prosecution-ready evidence chain generated with full source attribution. The kidnapping victim was recovered within 6 hours using the network intelligence.',
    metrics: { 'Phone Input': '1', 'Data Points': '47', 'Linked Suspects': '4', 'Total Time': '4 min' },
  },
  nia: {
    agency: 'NATIONAL INVESTIGATION AGENCY',
    title: 'Operation Shadow Network',
    subtitle: 'Burner SIM to Watch-Listed Entity in 6 Minutes',
    situation: 'NIA intercepts a burner SIM number from a hawala transaction. The number appears clean — no obvious social media presence, no caller ID registration. Traditional investigative tools return nothing. The number appears to be a dead end.',
    timeline: [
      ['T+0s', 'Burner SIM number entered. Parallel lookups initiated across all available data sources.'],
      ['T+3s', 'HLR query reveals the operator, activation circle, and SIM activation date. The number was activated 72 hours ago — consistent with a burner pattern.'],
      ['T+12s', 'Breach database returns a hit: this number appeared in a 2022 data exposure linked to an email address. The email was not registered under the same name as the SIM.'],
      ['T+30s', 'Email pivot on the discovered address reveals a VoIP account registered under a different name — a second identity layer.'],
      ['T+1min', 'Messaging app search finds the number registered in 3 private groups. Group names and membership patterns suggest coordination activity.'],
      ['T+4min', 'Social graph analysis connects the discovered identities to 2 entities on watch lists. The connection path traverses 3 identity layers that would have been invisible to manual investigation.'],
      ['T+6min', 'Complete intelligence package generated with full evidence chain from burner SIM to watch-listed entities.'],
    ],
    impact: 'A "clean" burner number led to identification of the end user and their network in under 6 minutes. The breach intelligence connection — invisible to traditional tools — was the critical pivot point. Three identity layers were uncovered, leading to 2 watch-list matches. The evidence chain, with full source attribution and timestamps, was used to escalate the investigation to a formal case.',
    metrics: { 'Burner SIM': '1', 'Identity Layers': '3', 'Watch-List Matches': '2', 'Total Time': '6 min' },
  },
  border: {
    agency: 'BORDER FORCE',
    title: 'Operation Gateway',
    subtitle: 'Fraudulent Identity Detected at International Checkpoint',
    situation: 'A traveller at an international checkpoint presents documents that pass visual inspection. The border officer wants a rapid digital footprint check on the passport number and declared phone number before clearance. The queue is growing — the officer has less than 2 minutes for a decision.',
    timeline: [
      ['T+0s', 'Phone number and passport details entered into Grosint. Both lookups fire simultaneously.'],
      ['T+3s', 'Telecom intelligence confirms the number\'s operator data matches the declared nationality. Initial check appears clean.'],
      ['T+8s', 'Caller ID lookup returns a different name than the one on the passport. First discrepancy flagged.'],
      ['T+15s', 'Messaging app profile photo does not match the passport photo. Second discrepancy flagged automatically by the system.'],
      ['T+45s', 'Breach database check reveals the phone number was previously linked to a flagged email address associated with document fraud. Third discrepancy.'],
      ['T+90s', 'Grosint presents the border officer with a concise alert: 3 identity discrepancies detected, with source attribution for each. Traveller referred for secondary screening.'],
    ],
    impact: 'Identity discrepancy detected in 90 seconds. The traveller was referred for secondary screening, which confirmed the documents were fraudulent. Without Grosint, the traveller would have been cleared — the documents passed visual inspection and the name on the passport matched the boarding pass. The digital footprint told a different story. One fraudulent entry prevented.',
    metrics: { 'Identifiers': '2', 'Discrepancies': '3', 'Detection Time': '90s', 'Fraud Prevented': '1' },
  },
  cyber: {
    agency: 'CYBER CRIME CELL',
    title: 'Operation Phish Net',
    subtitle: '12 Rotating Numbers Traced to a Single Phishing Operator',
    situation: 'A phishing campaign targeting Indian banks uses rotating phone numbers for OTP collection. The cyber crime cell has extracted a list of 12 phone numbers from phishing kits. Each number appears unrelated to the others. Manual investigation of each would take the team weeks.',
    timeline: [
      ['T+0s', 'All 12 phone numbers entered for batch lookup. 12 parallel query sets fire simultaneously — over 100 individual lookups in total.'],
      ['T+30s', 'Initial results arrive. 7 of the 12 numbers share the same breach history pattern — all appeared in the same data exposure incident from the same source.'],
      ['T+2min', 'Messaging app analysis reveals 4 of the numbers are registered under similar naming conventions — sequential alphanumeric patterns suggesting automated registration.'],
      ['T+5min', 'Email pivot from breach data reveals a common recovery email address shared across 5 of the accounts. This email becomes the primary identifier for the operator.'],
      ['T+10min', 'Social graph analysis maps all 12 numbers to a single operator cluster. The operator\'s real identity surfaces through a UPI registration linked to the recovery email.'],
      ['T+15min', 'Complete evidence package generated. Every connection between the 12 numbers, the shared breach history, the common email, and the operator\'s identity is documented with source attribution.'],
    ],
    impact: '12 seemingly unrelated numbers traced to a single operator within 15 minutes. The breach intelligence cross-reference was the critical breakthrough — it revealed a shared digital history invisible to telecom-only analysis. A prosecution-ready evidence package was generated with full source attribution for every data point. The operator was arrested within 48 hours.',
    metrics: { 'Numbers Input': '12', 'Operator Found': '1', 'Total Time': '15 min', 'Evidence': 'Court-Ready' },
  },
  ci: {
    agency: 'COUNTER-INTELLIGENCE',
    title: 'Operation Mirror',
    subtitle: 'Foreign Contact Network Mapped from a Single International Number',
    situation: 'A defence establishment employee is suspected of unauthorized contact with a foreign national. Counter-Intelligence has the foreign number but no other leads. The employee denies any such contact. CI needs to establish the relationship and map the foreign contact\'s identity — without alerting either party.',
    timeline: [
      ['T+0s', 'International number entered. Grosint initiates lookups adjusted for the foreign carrier and registration country.'],
      ['T+5s', 'Telecom intelligence reveals the carrier and country of registration. The activation pattern is consistent with the declared nationality.'],
      ['T+20s', 'Messaging app search finds the number registered in 2 groups with themes related to defence procurement. Group membership lists provide additional identifiers.'],
      ['T+1min', 'Breach database reveals the number\'s associated email appeared in a diplomatic contact list exposure. The email is linked to a specific institutional affiliation.'],
      ['T+3min', 'Email pivot discovers the foreign contact is registered on 3 messaging platforms. Profile data and display names are collected across all three.'],
      ['T+5min', 'Social graph analysis reveals mutual connections between the foreign contact\'s network and the suspect employee\'s known digital contacts. Two mutual connections confirmed.'],
      ['T+8min', 'Complete intelligence package: foreign contact\'s digital identity, institutional affiliation, group memberships, and mutual connections with the suspect. All evidence timestamped and source-attributed for CI reporting.'],
    ],
    impact: 'The foreign contact\'s digital identity and network were fully mapped from a single international phone number. Mutual connections confirmed the unauthorized relationship that the employee had denied. The breach intelligence pivot — revealing institutional affiliation through a diplomatic contact list exposure — was invisible to any other investigative tool. All evidence was timestamped and source-attributed, creating a court-admissible evidence chain for CI reporting.',
    metrics: { 'Int\'l Number': '1', 'Mutual Links': '2', 'Network': 'Full Map', 'Evidence': 'Court-Ready' },
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

async function downloadGrosintCaseStudy(key) {
  const data = GROSINT_CASES[key];
  if (!data) return;

  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const pw = 210;
  const margin = 20;
  const contentW = pw - margin * 2;

  // ── Page 1: Cover ──
  // Cyan header bar
  doc.setFillColor(0, 200, 255);
  doc.rect(0, 0, pw, 8, 'F');

  // Classification bar
  doc.setFillColor(13, 17, 23);
  doc.rect(0, 8, pw, 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 200, 255);
  doc.text('GROSINT SMINT CASE STUDY', margin, 20);
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
    doc.setTextColor(0, 200, 255);
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
  doc.setTextColor(0, 200, 255);
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
      doc.setFillColor(0, 200, 255);
      doc.rect(0, 0, pw, 4, 'F');
      y = 20;
    }

    // Time badge
    doc.setFillColor(0, 200, 255);
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
    doc.setFillColor(0, 200, 255);
    doc.rect(0, 0, pw, 4, 'F');
    y = 20;
  }

  doc.setFillColor(240, 250, 255);
  const impactLines = doc.splitTextToSize(data.impact, contentW - 16);
  const impactH = impactLines.length * 5 + 16;
  doc.roundedRect(margin, y, contentW, impactH, 3, 3, 'F');
  doc.setDrawColor(0, 200, 255);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin, y + impactH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 200, 255);
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
    doc.text('GROSINT SMINT by Garud Research & Tech Pvt. Ltd.  |  grosint.in  |  CONFIDENTIAL', pw / 2, 290, { align: 'center' });
    doc.text(`Page ${p} of ${pageCount}`, pw - margin, 290, { align: 'right' });
  }

  // Save
  const filename = `Grosint_CaseStudy_${data.agency.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}

// Expose globally for onclick handlers
window.__downloadGrosintCaseStudy = downloadGrosintCaseStudy;
