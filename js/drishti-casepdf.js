/**
 * Drishti — Case Study Data + PDF Download Trigger
 * Uses casepdf-shared.js for the actual PDF generation.
 */

const DRISHTI_CASES = {
  navy: {
    agency: 'INDIAN NAVY',
    title: 'Operation Dark Waters',
    subtitle: 'Dark Vessel Detection & Sanctions-Linked Network Exposure',
    situation: 'A foreign-flagged bulk carrier turns off its AIS transponder for 6 hours while transiting the Indian EEZ near the Andaman Sea. When AIS resumes, the vessel is 40nm from its expected course.',
    timeline: [
      ['T+2 hrs', 'Dark gap engine detects AIS blackout at 2-hour threshold. Vessel flagged for continuous monitoring. Alert status: HIGH.'],
      ['T+2.5 hrs', 'Vessel ownership traced through 3 shell companies using procurement and registry data. Ultimate beneficial owner identified.'],
      ['T+3 hrs', 'Sanctions screening reveals beneficial owner is on EU sanctions list. Cross-reference with procurement records shows same entity won a port services contract in a strategic harbour.'],
      ['T+3.1 hrs', 'CRITICAL alert fires: "Sanctions-linked vessel dark in EEZ + connected to sensitive port contract." Alert confirmed by 3 independent domains — maritime + sanctions + procurement.'],
      ['T+3.5 hrs', 'Navy patrol vessel dispatched. Board inspection reveals undeclared cargo. Evidence bundle generated with full chain: AIS gap, ownership graph, sanctions match, procurement link. All SHA-256 signed.'],
    ],
    impact: 'Navy patrol vessel dispatched within 30 minutes of CRITICAL alert. Board inspection reveals undeclared cargo. Evidence bundle generated with full chain: AIS gap record, ownership graph, sanctions match, procurement link. All SHA-256 signed and court-admissible under Indian Evidence Act Section 65B.',
    metrics: { 'Dark Gap': '6 hrs', 'Shell Cos': '3', 'Sanctions': '1', 'Response': '30 min' },
  },
  raw: {
    agency: 'RAW',
    title: 'Operation Phantom Procurement',
    subtitle: 'Shell Company Network Mapping via Entity Resolution',
    situation: 'Intelligence analysis suspects a network of shell companies is systematically winning defence procurement contracts. Manual investigation has identified 2 companies but suspects there are more.',
    timeline: [
      ['Phase 1', 'Entity resolution traces the 2 known companies through phone numbers, director names, and registered addresses. 5 additional companies discovered sharing directors.'],
      ['Phase 2', 'Procurement records show all 7 companies won contracts at 4 sensitive defence facilities. Systematic access pattern detected.'],
      ['Phase 3', 'Financial domain reveals crypto transactions between 3 companies. Transaction patterns flagged by automated rule evaluation.'],
      ['Phase 4', 'Ownership graph shows ultimate beneficial owner is a foreign national. Complete network: 7 companies, 12 directors, 4 facilities, 1 foreign beneficial owner.'],
      ['Phase 5', 'Prosecution-ready evidence bundle generated. Full entity graph, ownership chains, procurement links, financial transactions. All SHA-256 signed.'],
    ],
    impact: 'Complete shell network mapped in under 2 hours — manual investigation had taken 4 months for the first 2 companies. Evidence bundle links 7 companies, 12 directors, 4 facilities, and 1 foreign beneficial owner. Prosecution-ready with full chain of custody.',
    metrics: { 'Shell Cos': '7', 'Directors': '12', 'Facilities': '4', 'Time': '2 hrs vs 4 mo' },
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
      ['Day 4', 'Social media monitoring finds crew\'s Telegram group with location-tagged photos confirming proximity during one suspected transfer event.'],
      ['Day 5', 'Entire STS network documented. Coast Guard interdicts the next scheduled transfer. Evidence bundle covers maritime, sanctions, ownership, and social domains.'],
    ],
    impact: 'Entire STS transfer network documented with 4 events, 6 vessels, 3 ownership chains, 1 sanctions link, and social media confirmation. Coast Guard interdicts the next scheduled transfer with prosecution-ready evidence.',
    metrics: { 'STS Events': '4', 'Vessels': '6', 'Pattern': '90 days', 'Domains': '4' },
  },
  ntro: {
    agency: 'NTRO',
    title: 'Operation Digital Fortress',
    subtitle: 'Rogue UAV Operator Identification via Multi-Domain Fusion',
    situation: 'A rogue UAV is detected operating near a sensitive research facility without a transponder or filed flight plan. Physical security reports visual sighting but cannot identify the operator.',
    timeline: [
      ['T+0', 'Geofence violation rule fires immediately. Aviation registry queried for nearby registered UAVs — no match found.'],
      ['T+5 min', 'Procurement records show a company purchased commercial UAVs matching the description. Company details from registry.'],
      ['T+10 min', 'Company director\'s phone number matches a Telegram account in a technology discussion group. Account clustering reveals surveillance equipment connections.'],
      ['T+15 min', 'Social media monitoring reveals geotagged photos near 3 other sensitive facilities over 6 months. 4-facility surveillance pattern.'],
      ['T+20 min', 'UAV operator identified. Evidence bundle covers aviation, procurement, social media, and geo domains. 6-month pattern documented.'],
    ],
    impact: 'UAV operator identified and linked to a company conducting unauthorized surveillance of 4 sensitive facilities. 6-month pattern established through multi-domain fusion. Evidence bundle covers 4 intelligence domains.',
    metrics: { 'UAV': '1', 'Facilities': '4', 'Pattern': '6 months', 'Domains': '4' },
  },
  mea: {
    agency: 'MEA',
    title: 'Operation Sanctions Web',
    subtitle: 'Joint Venture Sanctions Exposure Assessment',
    situation: 'India\'s delegation to a multilateral forum needs to verify whether a proposed joint venture partner has sanctions exposure. The entity operates across maritime shipping, procurement, and financial services in the Indo-Pacific.',
    timeline: [
      ['Hour 1', 'Entity name entered. Entity resolver finds matches across maritime registry (3 vessels), procurement filings (2 contracts in Indian ports), and financial domain.'],
      ['Hour 2', 'Financial domain reveals flagged crypto transactions. Sanctions screening identifies parent company on EU sanctions list.'],
      ['Hour 3', 'Ownership chain shows 2 layers of shell companies between sanctioned parent and proposed JV partner. Complete exposure map generated.'],
      ['Hour 4', 'Complete sanctions exposure report delivered. JV rejected. Evidence bundle shared as diplomatic dossier.'],
    ],
    impact: 'MEA delegation receives a complete sanctions exposure report within 4 hours. The proposed JV is rejected. The evidence bundle — with ownership chain, sanctions match, and all source references — is shared as a diplomatic dossier. Without Drishti, this analysis would require coordination across 4 ministries and 2+ weeks.',
    metrics: { 'Vessels': '3', 'Contracts': '2', 'Shell Layers': '2', 'Time': '4 hrs vs 2 wks' },
  },
};

window.__downloadDrishtiCaseStudy = function(key) {
  if (!window.__generateCaseStudyPDF) {
    alert('PDF generator loading... please try again in a moment.');
    return;
  }
  window.__generateCaseStudyPDF('drishti', key, DRISHTI_CASES);
};
