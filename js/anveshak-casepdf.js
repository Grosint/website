/**
 * Anveshak — Case Study PDF Generator
 * Generates branded PDFs using jsPDF loaded from CDN.
 */

const CASES = {
  mi: {
    agency: 'MILITARY INTELLIGENCE',
    title: 'Operation Sentinel Eye',
    subtitle: 'LAC Troop Movement Detection',
    situation: 'January, Eastern Ladakh sector. An MI unit at a forward post needs to monitor PLA activity along a 200km stretch of the LAC. Their current method: an analyst manually checking 12 news websites, 3 Telegram channels, and Twitter every 2 hours. Chinese-language sources are ignored — no translator available. By the time a report reaches the commanding officer, it\'s already 6–8 hours old.',
    timeline: [
      ['07:00 hrs', 'Anveshak ingests overnight content from 17 sources including Chinese military blogs, Weibo posts (auto-translated), Indian defence RSS feeds, and monitored Telegram channels. 340 articles processed.'],
      ['07:02 hrs', 'Entity extraction identifies mentions of "PLA Western Theatre Command", "Aksai Chin Highway", and "Type 15 Tank" across 9 independent articles in 3 languages.'],
      ['07:03 hrs', 'Narrative clustering groups these into a single cluster: "PLA armoured vehicle movement near Depsang Plains". Independent source count reaches 4.'],
      ['07:03 hrs', 'Intelligence alert fires. The MI analyst receives a real-time push notification on their workstation.'],
      ['07:05 hrs', 'The commanding officer receives a one-page auto-generated brief with a map overlay showing mentioned locations. The report is timestamped and immutable.'],
    ],
    impact: 'The MI unit detected PLA forward positioning 4 hours before mainstream Indian media reported it and 6 hours before the unit would have caught it manually. The Chinese-language sources — previously invisible to the unit — provided the earliest indicators. All from a single laptop running Anveshak, with no internet dependency for the AI analysis.',
    metrics: { 'Sources Monitored': '17', 'Languages': '3', 'Early Warning': '4 hrs', 'Machines Required': '1' },
  },
  iaf: {
    agency: 'INDIAN AIR FORCE',
    title: 'Operation Vayu Shield',
    subtitle: 'Deepfake Detection During Airspace Incident',
    situation: 'Following a border airspace incident, social media is flooded with images claiming to show a downed IAF aircraft. Pakistani Telegram channels share "satellite imagery" of wreckage. Indian TV channels are preparing to broadcast. The IAF PRO needs to know within minutes: are these images real or fabricated?',
    timeline: [
      ['T+0 min', 'Anveshak\'s social monitoring detects a surge of images across 4 Telegram channels and X/Twitter. 47 images and 3 videos collected in the first wave.'],
      ['T+2 min', 'Visual intelligence pipeline analyses every image. 23 out of 47 images flagged with deepfake probability scores above 0.7. Metadata forensics reveals EXIF data inconsistencies — timestamps predate the incident by 3 days.'],
      ['T+3 min', 'Perceptual fingerprinting matches 8 images to a 2019 drone crash in a different country. The "satellite imagery" is a digitally altered version of commercially available imagery.'],
      ['T+5 min', 'An immutable report is generated: "23 fabricated images detected. 8 traceable to prior incidents. 3 videos show frame-level manipulation artefacts."'],
      ['T+8 min', 'The IAF PRO issues a press statement citing the analysis. TV channels that were about to broadcast retract their coverage.'],
    ],
    impact: 'The IAF countered a coordinated disinformation campaign within 8 minutes of the first fake image appearing — 45 minutes before any TV channel would have aired it. The immutable, timestamped report with forensic evidence was later used in a diplomatic demarche.',
    metrics: { 'Deepfake Accuracy': '92%', 'Fake Images Flagged': '23', 'Response Time': '8 min', 'Before TV Media': '45 min' },
  },
  police: {
    agency: 'STATE POLICE',
    title: 'Operation Rumour Net',
    subtitle: 'Communal Tension Defused Through Early Detection',
    situation: 'A minor traffic accident between members of two communities in a sensitive district leads to localised tension. Within hours, Telegram groups begin sharing a doctored video of the incident, reframed as a targeted communal attack. The SP needs to know: is this organic outrage or a coordinated amplification campaign?',
    timeline: [
      ['14:30 hrs', 'Anveshak detects the doctored video appearing simultaneously in 6 Telegram channels within a 20-minute window. Narrative clustering groups all posts into a single cluster.'],
      ['14:32 hrs', 'Deepfake analysis scores the video at 0.83 probability of manipulation. Frame analysis reveals a spliced audio track that doesn\'t match lip movements.'],
      ['14:33 hrs', 'Sentiment analysis shows a sharp spike in negative tone. The system identifies 3 accounts coordinating the amplification — posting identical text within seconds of each other.'],
      ['14:34 hrs', 'Intelligence alert fires. The SP receives a real-time notification: "Coordinated amplification of manipulated video detected. 6 channels, 3 probable coordination accounts."'],
      ['14:45 hrs', 'The SP deploys additional forces and instructs the cyber cell to pursue the coordination accounts. A counter-narrative is prepared using the forensic analysis as evidence.'],
    ],
    impact: 'The police identified and responded to the coordinated disinformation campaign 3 hours before it could escalate into street violence. The forensic evidence — timestamped, immutable, and court-admissible — was later used in an FIR against the coordination accounts.',
    metrics: { 'Alert Latency': '~10s', 'Platforms': '4', 'Before Escalation': '3 hrs', 'Evidence': 'Court-Ready' },
  },
  cyber: {
    agency: 'CYBER COMMAND',
    title: 'Operation Dark Nexus',
    subtitle: 'Connecting Dark Web Chatter to Active Cyber Attack',
    situation: 'A cyber command unit monitors two separate watch topics: "Critical Infrastructure Threats" (tracking dark web forums) and "CERT-In Advisories" (tracking official vulnerability disclosures). The analysts working these topics don\'t typically cross-reference each other\'s intelligence — they\'re in different teams covering different source pools.',
    timeline: [
      ['Monday', 'Topic 1 (Dark Web) picks up forum posts discussing a specific vulnerability in SCADA systems used by Indian power grid operators. The posts mention "PowerGrid Corp", "NTPC", and a CVE identifier. These are clustered into a narrative.'],
      ['Wednesday', 'Topic 2 (CERT-In) ingests an official advisory mentioning the same CVE, the same organisations, and recommends patching. This forms its own cluster under a different topic.'],
      ['Wednesday +15m', 'Cross-topic convergence engine detects that cluster centroids from both topics are semantically converging. Despite completely different vocabularies, the shared entities trigger the blended similarity match.'],
      ['Wednesday +15m', 'A HIGH severity convergence alert fires to both teams: "Dark web activity predates the official advisory by 48 hours — suggesting active threat actor interest before public disclosure."'],
    ],
    impact: 'The convergence alert revealed that threat actors were discussing the vulnerability 48 hours before CERT-In\'s public advisory — indicating active pre-exploitation reconnaissance. The cyber command escalated the patching timeline from "routine" to "emergency", protecting critical infrastructure.',
    metrics: { 'Topics Converged': '2', 'Advance Warning': '48 hrs', 'Alert Severity': 'HIGH', 'Infra Protected': 'Power Grid' },
  },
  mea: {
    agency: 'MINISTRY OF EXTERNAL AFFAIRS',
    title: 'Operation Narrative Shield',
    subtitle: 'Countering a Coordinated Anti-India Influence Campaign',
    situation: 'Ahead of a critical UN General Assembly vote, the MEA\'s intelligence desk notices a spike in anti-India articles across Turkish, Arabic, and Malay-language media. The desk suspects a coordinated influence operation but lacks the linguistic capacity to confirm it. Currently, only English and French media are systematically monitored. The Foreign Secretary needs a comprehensive assessment within 48 hours.',
    timeline: [
      ['Day 1, 09:00', 'Three watch topics configured covering global media in 8 languages, social media, and diaspora channels. Anveshak begins ingesting from 42 sources.'],
      ['Day 1, 14:00', '1,200+ articles processed across 8 languages. Translation engine converts everything to unified semantic space. 3 core anti-India narratives identified simultaneously across all languages.'],
      ['Day 1, 14:30', 'Cross-topic convergence fires: same narrative cluster appearing in diplomatic media, social channels, AND diaspora forums. Entity extraction reveals 4 think-tanks and 2 PR firms cited across languages. This is coordinated.'],
      ['Day 2', 'Sentiment trending shows anti-India narrative peaked in Turkish media first (14 hours before others), suggesting campaign origin. 6 outlets identified with coordinated publishing patterns.'],
      ['Day 3, 08:00', 'Immutable intelligence package generated: narrative timeline, source network map, entity relationships, sentiment trends, and forensic evidence. Every claim backed by frozen source snapshots.'],
    ],
    impact: 'The Foreign Secretary\'s delegation arrived at UNGA with a comprehensive, evidence-backed counter-narrative package identifying the campaign\'s origin, amplification network, and coordination timeline. Indian missions in 14 countries received tailored talking points in local languages. The immutable evidence package was shared with friendly delegations as diplomatic evidence. The vote passed in India\'s favour. Without Anveshak, this campaign would have been invisible — the MEA had no capacity to monitor Turkish, Arabic, or Malay-language media at the speed required.',
    metrics: { 'Languages': '200+', 'Countries Covered': '14', 'Campaign Mapped': '72 hrs', 'Evidence': 'Immutable' },
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

async function downloadCaseStudy(key) {
  const data = CASES[key];
  if (!data) return;

  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const pw = 210; // page width
  const margin = 20;
  const contentW = pw - margin * 2;

  // ── Page 1: Cover ──
  // Dark background effect (amber header bar)
  doc.setFillColor(232, 125, 20);
  doc.rect(0, 0, pw, 8, 'F');

  // Classification bar
  doc.setFillColor(13, 17, 23);
  doc.rect(0, 8, pw, 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(232, 125, 20);
  doc.text('ANVESHAK CASE STUDY', margin, 20);
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
    doc.setTextColor(232, 125, 20);
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
  doc.setTextColor(232, 125, 20);
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
      // Repeat header bar on new page
      doc.setFillColor(232, 125, 20);
      doc.rect(0, 0, pw, 4, 'F');
      y = 20;
    }

    // Time badge
    doc.setFillColor(232, 125, 20);
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
    doc.setFillColor(232, 125, 20);
    doc.rect(0, 0, pw, 4, 'F');
    y = 20;
  }

  doc.setFillColor(255, 248, 240);
  const impactLines = doc.splitTextToSize(data.impact, contentW - 16);
  const impactH = impactLines.length * 5 + 16;
  doc.roundedRect(margin, y, contentW, impactH, 3, 3, 'F');
  doc.setDrawColor(232, 125, 20);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin, y + impactH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(232, 125, 20);
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
    doc.text('ANVESHAK by Garud Research & Tech Pvt. Ltd.  |  grosint.in  |  CONFIDENTIAL', pw / 2, 290, { align: 'center' });
    doc.text(`Page ${p} of ${pageCount}`, pw - margin, 290, { align: 'right' });
  }

  // Save
  const filename = `Anveshak_CaseStudy_${data.agency.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}

// Expose globally for onclick handlers
window.__downloadCaseStudy = downloadCaseStudy;
