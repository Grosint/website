/**
 * Anveshak — Case Study Data + PDF Download Trigger
 * Uses casepdf-shared.js for the actual PDF generation.
 */

const ANVESHAK_CASES = {
  mi: {
    agency: 'MILITARY INTELLIGENCE',
    title: 'Operation Sentinel Eye',
    subtitle: 'LAC Troop Movement Detection',
    situation: 'January, Eastern Ladakh sector. An MI unit at a forward post needs to monitor PLA activity along a 200km stretch of the LAC. Their current method: an analyst manually checking 12 news websites, 3 Telegram channels, and Twitter every 2 hours. Chinese-language sources are ignored — no translator available. By the time a report reaches the commanding officer, it\'s already 6–8 hours old.',
    timeline: [
      ['07:00 hrs', 'Anveshak ingests overnight content from 17 sources including Chinese military blogs, Weibo posts (auto-translated), Indian defence RSS feeds, and monitored Telegram channels. 340 articles processed.'],
      ['07:02 hrs', 'Entity extraction identifies mentions of "PLA Western Theatre Command", "Aksai Chin Highway", and "Type 15 Tank" across 9 independent articles in 3 languages.'],
      ['07:03 hrs', 'Narrative clustering groups these into a single cluster: "PLA armoured vehicle movement near Depsang Plains". Independent source count reaches 4.'],
      ['07:03 hrs', 'Intelligence alert fires. The MI analyst receives a real-time push notification on their workstation with a summary, source list, and confidence assessment.'],
      ['07:05 hrs', 'The commanding officer receives a one-page auto-generated brief with a map overlay showing mentioned locations. The report is timestamped and immutable — admissible as intelligence evidence.'],
    ],
    impact: 'The MI unit detected PLA forward positioning 4 hours before mainstream Indian media reported it and 6 hours before the unit would have caught it manually. The Chinese-language sources — previously invisible to the unit — provided the earliest indicators. All from a single laptop running Anveshak, with no internet dependency for the AI analysis.',
    metrics: { 'Sources': '17', 'Languages': '3', 'Early Warning': '4 hrs', 'Machines': '1' },
  },
  iaf: {
    agency: 'INDIAN AIR FORCE',
    title: 'Operation Vayu Shield',
    subtitle: 'Deepfake Detection During Airspace Incident',
    situation: 'Following a border airspace incident, social media is flooded with images claiming to show a downed IAF aircraft. Pakistani Telegram channels share "satellite imagery" of wreckage. Indian TV channels are preparing to broadcast. The IAF PRO needs to know within minutes: are these images real or fabricated?',
    timeline: [
      ['T+0 min', 'Social monitoring detects a surge of images across 4 Telegram channels and X/Twitter. 47 images and 3 videos collected in the first wave.'],
      ['T+2 min', 'Visual intelligence pipeline analyses every image. 23 out of 47 flagged with deepfake probability scores above 0.7. Metadata forensics reveals EXIF inconsistencies — timestamps predate the incident by 3 days.'],
      ['T+3 min', 'Perceptual fingerprinting matches 8 images to a 2019 drone crash in a different country. The "satellite imagery" is digitally altered commercially available imagery.'],
      ['T+5 min', 'An immutable report is generated: "23 fabricated images detected. 8 traceable to prior incidents. 3 videos show frame-level manipulation artefacts." Includes side-by-side comparisons.'],
      ['T+8 min', 'The IAF PRO issues a press statement citing the analysis. TV channels that were about to broadcast retract their coverage.'],
    ],
    impact: 'The IAF countered a coordinated disinformation campaign within 8 minutes of the first fake image appearing — 45 minutes before any TV channel would have aired it. The immutable, timestamped report with forensic evidence was later used in a diplomatic demarche. Every source that amplified the fakes had their credibility score automatically downgraded.',
    metrics: { 'Accuracy': '92%', 'Fakes Flagged': '23', 'Response': '8 min', 'Before TV': '45 min' },
  },
  police: {
    agency: 'STATE POLICE',
    title: 'Operation Rumour Net',
    subtitle: 'Communal Tension Defused Through Early Detection',
    situation: 'A minor traffic accident between members of two communities in a sensitive district leads to localised tension. Within hours, Telegram groups begin sharing a doctored video of the incident, reframed as a targeted communal attack. The SP needs to know: is this organic outrage or a coordinated amplification campaign?',
    timeline: [
      ['14:30 hrs', 'Anveshak detects the doctored video appearing simultaneously in 6 Telegram channels within a 20-minute window. Narrative clustering groups all posts into a single cluster.'],
      ['14:32 hrs', 'Deepfake analysis scores the video at 0.83 probability of manipulation. Frame analysis reveals a spliced audio track that doesn\'t match lip movements.'],
      ['14:33 hrs', 'Sentiment analysis shows a sharp spike in negative tone. The system identifies 3 accounts that appear to be coordinating — posting identical text within seconds of each other.'],
      ['14:34 hrs', 'Intelligence alert fires. The SP receives a real-time notification: "Coordinated amplification of manipulated video detected. 6 channels, 3 probable coordination accounts."'],
      ['14:45 hrs', 'The SP deploys additional forces and instructs the cyber cell to pursue the coordination accounts. A counter-narrative is prepared using the forensic analysis.'],
    ],
    impact: 'The police identified and responded to the coordinated disinformation campaign 3 hours before it could escalate into street violence. The forensic evidence — timestamped, immutable, and court-admissible — was later used in an FIR against the coordination accounts. Source credibility scoring automatically flagged the amplifying channels for future monitoring.',
    metrics: { 'Alert Speed': '~10s', 'Platforms': '4', 'Before Violence': '3 hrs', 'Evidence': 'Court-Ready' },
  },
  cyber: {
    agency: 'CYBER COMMAND',
    title: 'Operation Dark Nexus',
    subtitle: 'Connecting Dark Web Chatter to Active Cyber Attack',
    situation: 'A cyber command unit monitors two separate watch topics: "Critical Infrastructure Threats" (tracking dark web forums) and "CERT-In Advisories" (tracking official vulnerability disclosures). The analysts working these topics don\'t typically cross-reference each other\'s intelligence — they\'re in different teams covering different source pools.',
    timeline: [
      ['Monday', 'Topic 1 (Dark Web) picks up forum posts discussing a specific vulnerability in SCADA systems used by Indian power grid operators. The posts mention "PowerGrid Corp", "NTPC", and a CVE identifier.'],
      ['Wednesday', 'Topic 2 (CERT-In) ingests an official advisory mentioning the same CVE, the same organisations, and recommends patching. This forms its own cluster under a different topic.'],
      ['Wed +15m', 'Cross-topic convergence detects that cluster centroids from both topics are semantically converging. Despite completely different vocabularies, shared entities trigger the match.'],
      ['Wed +15m', 'HIGH severity convergence alert fires to both teams: "Dark web activity predates official advisory by 48 hours — suggesting active threat actor interest before public disclosure."'],
    ],
    impact: 'The convergence alert revealed that threat actors were discussing the vulnerability 48 hours before CERT-In\'s public advisory — indicating active pre-exploitation reconnaissance. The cyber command escalated the patching timeline from "routine" to "emergency", protecting critical infrastructure. Without Anveshak\'s cross-topic convergence, these two intelligence streams would never have been connected.',
    metrics: { 'Topics': '2', 'Warning': '48 hrs', 'Severity': 'HIGH', 'Protected': 'Power Grid' },
  },
  mea: {
    agency: 'MINISTRY OF EXTERNAL AFFAIRS',
    title: 'Operation Narrative Shield',
    subtitle: 'Countering a Coordinated Anti-India Influence Campaign',
    situation: 'Ahead of a critical UN General Assembly vote, the MEA\'s intelligence desk notices a spike in anti-India articles across Turkish, Arabic, and Malay-language media — markets where India\'s diplomatic engagement has been growing. The desk suspects a coordinated influence operation but lacks the linguistic capacity to confirm it. The Foreign Secretary needs a comprehensive assessment within 48 hours.',
    timeline: [
      ['Day 1, 09:00', 'Three watch topics configured covering global media in 8 languages, social media, and diaspora channels. Anveshak begins ingesting from 42 sources.'],
      ['Day 1, 14:00', '1,200+ articles processed across 8 languages. Translation engine converts everything to unified semantic space. 3 core anti-India narratives identified simultaneously across all languages.'],
      ['Day 1, 14:30', 'Cross-topic convergence fires: same narrative in diplomatic media, social channels, AND diaspora forums. Entity extraction reveals 4 think-tanks and 2 PR firms coordinating across languages.'],
      ['Day 2', 'Sentiment trending shows anti-India narrative peaked in Turkish media first (14 hours before others), suggesting campaign origin. 6 outlets identified with coordinated publishing — identical articles in a 30-minute window.'],
      ['Day 3, 08:00', 'Immutable intelligence package generated: narrative timeline, source network map, entity relationships, sentiment trends. Every claim backed by frozen source snapshots.'],
    ],
    impact: 'The Foreign Secretary\'s delegation arrived at UNGA with a comprehensive, evidence-backed counter-narrative package identifying the campaign\'s origin, amplification network, and coordination timeline. Indian missions in 14 countries received tailored talking points in local languages. The immutable evidence package — with frozen source snapshots and unbroken audit trails — was shared with friendly delegations as diplomatic evidence. The vote passed in India\'s favour.',
    metrics: { 'Languages': '200+', 'Countries': '14', 'Mapped In': '72 hrs', 'Evidence': 'Immutable' },
  },
};

window.__downloadCaseStudy = function(key) {
  if (!window.__generateCaseStudyPDF) {
    alert('PDF generator loading... please try again in a moment.');
    return;
  }
  window.__generateCaseStudyPDF('anveshak', key, ANVESHAK_CASES);
};
