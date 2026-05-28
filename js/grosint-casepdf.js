/**
 * Grosint SMINT — Case Study Data + PDF Download Trigger
 * Uses casepdf-shared.js for the actual PDF generation.
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
    metrics: { 'Phone Input': '1', 'Data Points': '47', 'Suspects': '4', 'Time': '4 min' },
  },
  nia: {
    agency: 'NATIONAL INVESTIGATION AGENCY',
    title: 'Operation Shadow Network',
    subtitle: 'Burner SIM to Watch-Listed Entity in 6 Minutes',
    situation: 'NIA intercepts a burner SIM number from a hawala transaction. The number appears clean — no obvious social media presence, no caller ID registration. Traditional investigative tools return nothing. The number appears to be a dead end.',
    timeline: [
      ['T+0s', 'Burner SIM number entered. Parallel lookups initiated across all available data sources.'],
      ['T+3s', 'HLR query reveals the operator, activation circle, and SIM activation date. The number was activated 72 hours ago — consistent with a burner pattern.'],
      ['T+12s', 'Breach database returns a hit: this number appeared in a 2022 data exposure linked to an email address.'],
      ['T+30s', 'Email pivot on the discovered address reveals a VoIP account registered under a different name — a second identity layer.'],
      ['T+1min', 'Messaging app search finds the number registered in 3 private groups. Group names and membership patterns suggest coordination activity.'],
      ['T+4min', 'Social graph analysis connects the discovered identities to 2 entities on watch lists.'],
      ['T+6min', 'Complete intelligence package generated with full evidence chain from burner SIM to watch-listed entities.'],
    ],
    impact: 'A "clean" burner number led to identification of the end user and their network in under 6 minutes. The breach intelligence connection — invisible to traditional tools — was the critical pivot point. Three identity layers were uncovered, leading to 2 watch-list matches. The evidence chain was used to escalate the investigation to a formal case.',
    metrics: { 'Burner SIM': '1', 'ID Layers': '3', 'Watch-List': '2', 'Time': '6 min' },
  },
  border: {
    agency: 'BORDER FORCE',
    title: 'Operation Gateway',
    subtitle: 'Fraudulent Identity Detected at International Checkpoint',
    situation: 'A traveller at an international checkpoint presents documents that pass visual inspection. The border officer wants a rapid digital footprint check on the passport number and declared phone number before clearance. The queue is growing — the officer has less than 2 minutes for a decision.',
    timeline: [
      ['T+0s', 'Phone number and passport details entered. Both lookups fire simultaneously.'],
      ['T+3s', 'Telecom intelligence confirms operator data matches declared nationality. Initial check appears clean.'],
      ['T+8s', 'Caller ID lookup returns a different name than the passport. First discrepancy flagged.'],
      ['T+15s', 'Messaging app profile photo does not match passport photo. Second discrepancy.'],
      ['T+45s', 'Breach database reveals the phone number was previously linked to a flagged email address associated with document fraud. Third discrepancy.'],
      ['T+90s', 'Alert presented: 3 identity discrepancies detected with source attribution. Traveller referred for secondary screening.'],
    ],
    impact: 'Identity discrepancy detected in 90 seconds. Secondary screening confirmed the documents were fraudulent. Without Grosint, the traveller would have been cleared — the documents passed visual inspection. The digital footprint told a different story. One fraudulent entry prevented.',
    metrics: { 'Identifiers': '2', 'Discrepancies': '3', 'Detection': '90s', 'Fraud Stopped': '1' },
  },
  cyber: {
    agency: 'CYBER CRIME CELL',
    title: 'Operation Phish Net',
    subtitle: '12 Rotating Numbers Traced to a Single Phishing Operator',
    situation: 'A phishing campaign targeting Indian banks uses rotating phone numbers for OTP collection. The cyber crime cell has extracted 12 phone numbers from phishing kits. Each number appears unrelated. Manual investigation of each would take weeks.',
    timeline: [
      ['T+0s', 'All 12 numbers entered for batch lookup. Over 100 individual lookups fire simultaneously.'],
      ['T+30s', '7 of 12 numbers share the same breach history pattern — all appeared in the same data exposure.'],
      ['T+2min', 'Messaging app analysis reveals 4 numbers registered under similar naming conventions — sequential patterns suggesting automated registration.'],
      ['T+5min', 'Email pivot from breach data reveals a common recovery email shared across 5 accounts.'],
      ['T+10min', 'Social graph maps all 12 numbers to a single operator cluster. The operator\'s real identity surfaces through a UPI registration linked to the recovery email.'],
      ['T+15min', 'Complete evidence package generated with full connection map and source attribution.'],
    ],
    impact: '12 seemingly unrelated numbers traced to a single operator within 15 minutes. The breach intelligence cross-reference was the critical breakthrough. A prosecution-ready evidence package was generated. The operator was arrested within 48 hours.',
    metrics: { 'Numbers': '12', 'Operator': '1', 'Time': '15 min', 'Evidence': 'Court-Ready' },
  },
  ci: {
    agency: 'COUNTER-INTELLIGENCE',
    title: 'Operation Mirror',
    subtitle: 'Foreign Contact Network Mapped from a Single International Number',
    situation: 'A defence establishment employee is suspected of unauthorized contact with a foreign national. Counter-Intelligence has the foreign number but no other leads. The employee denies any such contact.',
    timeline: [
      ['T+0s', 'International number entered. Lookups adjusted for foreign carrier and registration country.'],
      ['T+5s', 'Telecom intelligence reveals carrier and country of registration.'],
      ['T+20s', 'Messaging app search finds the number in 2 groups related to defence procurement. Group membership lists provide additional identifiers.'],
      ['T+1min', 'Breach database reveals the number\'s associated email appeared in a diplomatic contact list exposure — revealing institutional affiliation.'],
      ['T+3min', 'Email pivot discovers registration on 3 messaging platforms. Profile data collected across all three.'],
      ['T+5min', 'Social graph reveals mutual connections between the foreign contact\'s network and the suspect employee\'s known contacts. Two mutual connections confirmed.'],
      ['T+8min', 'Complete intelligence package with digital identity, institutional affiliation, group memberships, and mutual connections.'],
    ],
    impact: 'The foreign contact\'s digital identity and network were fully mapped from a single international phone number. Mutual connections confirmed the unauthorized relationship. The breach intelligence pivot — revealing institutional affiliation — was invisible to any other tool. All evidence timestamped and source-attributed for court-admissible CI reporting.',
    metrics: { 'Int\'l Number': '1', 'Mutual Links': '2', 'Network': 'Full Map', 'Evidence': 'Court-Ready' },
  },
};

window.__downloadGrosintCaseStudy = function(key) {
  if (!window.__generateCaseStudyPDF) {
    alert('PDF generator loading... please try again in a moment.');
    return;
  }
  window.__generateCaseStudyPDF('grosint', key, GROSINT_CASES);
};
