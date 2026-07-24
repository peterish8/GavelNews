import type { PublishedStory } from "@/lib/types";

// ────────────────────────────────────────────────────────────────────
// 12 mock stories, 3 editions × 4 stories each, over the last week.
// Topics mix Constitutional / Criminal / Current Affairs / Bare Acts.
// All case citations are generic — no fabricated facts about real
// ongoing matters. These are stand-ins for the engine's daily output.
// ────────────────────────────────────────────────────────────────────

export const MOCK_STORIES: PublishedStory[] = [
  // ── Edition 1: 22 July 2026 ──
  {
    id: "s-001",
    editionDate: "2026-07-22",
    slug: "governor-article-200-pocket-veto",
    title: "Governor's Pocket Veto: Reading Article 200 in 2026",
    category: "constitutional-law",
    examTags: ["UG", "PG"],
    readingTimeMin: 4,
    summary:
      "Supreme Court holds that indefinite delay by a Governor on a re-passed Bill is unconstitutional.",
    whatHappened:
      "A three-judge bench of the Supreme Court last week held that the Governor's delay in acting on a re-passed Bill — sitting on it for over four months without assent, veto, or reservation — violates the constitutional scheme of Article 200. The Court set a one-month outer limit in ordinary cases and three months where the Bill is reserved for the President's consideration.",
    background:
      "Article 200 gives the Governor four options on a Bill: assent, withhold assent, reserve for the President, or return for reconsideration. Once a Bill is re-passed by the Legislature, the Governor is constitutionally expected to act on it. Several state Governments had complained of inordinate delay — what commentators call a 'pocket veto' — when a Governor simply did not act at all.",
    whatCourtHeld:
      "The bench reasoned that indefinite inaction collapses the four enumerated choices into a fifth, unnamed option that the Constitution does not provide. Drawing on the doctrine of constitutional silence (the Constitution enumerates what the Governor must do, and silence cannot enlarge that), the Court read a reasonable-time limit into Article 200. It directed that if the Governor does not act within the stipulated period, the Bill shall be deemed to have been assented to.",
    whyItMatters:
      "Article 200 is a CLAT UG and PG staple. Pocket veto by constitutional functionaries is a recurring theme in polity and constitutional-law questions, especially in the context of Centre–State relations and the debate over Article 200 vs Article 201.",
    keyPoints: [
      { text: "Governor must act within 1 month (3 months if reserved) — silence is not a constitutional option." },
      { text: "Pocket veto by constitutional authorities is constitutionally impermissible." },
      { text: "Deemed-assent doctrine applies if the Governor does not act within the prescribed period." },
      { text: "Article 200 is read with Article 142 to issue consequential directions to state Governments." },
    ],
    sources: [
      {
        name: "LiveLaw — Supreme Court Constitution Bench",
        url: "https://www.livelaw.in",
        type: "legal_website",
      },
      {
        name: "The Hindu — Article 200 ruling",
        url: "https://www.thehindu.com",
        type: "newspaper",
      },
    ],
    pyqKeyword: "Governor Article 200",
    decision: "must_cover",
    publishedAt: "2026-07-22T07:30:00Z",
    status: "published",
    // Gated content for UI testing
    whatActuallyHappening: "Governors were simply sitting on Bills indefinitely, effectively vetoing them without saying no. The Supreme Court stepped in to say this silent approach is unconstitutional.",
    whyDidThisHappen: "Several state governments complained about Governors blocking legislation through inaction, creating tension between the executive and legislative branches at the state level.",
    importantTerms: [
      {
        term: "Pocket Veto",
        whatIsIt: "A constitutional functionary's refusal to act on a bill, neither assenting nor rejecting it",
        whyItMatters: "Undermines legislative process and is now ruled unconstitutional in this context"
      },
      {
        term: "Deemed Assent",
        whatIsIt: "When a bill is considered approved automatically after a specified time period",
        whyItMatters: "Prevents constitutional functionaries from blocking legislation through inaction"
      }
    ],
    lawBehindIt: "Article 200 of the Constitution of India",
    analogy: "Like a referee who never blows the whistle - the game can't proceed and everyone is stuck waiting indefinitely.",
    friendExplanation: "Think of it as your professor promising to grade your paper but never doing it. You can't move forward, and they never actually said no, but you're still stuck.",
    commonConfusions: [
      {
        a: "Governor's pocket veto",
        b: "President's pocket veto",
        explanation: "Article 200 (Governor) vs Article 111 (President) - different time limits and procedures apply"
      }
    ],
    examLens: {
      fiveThings: ["Article 200", "Governor's powers", "Deemed assent", "Pocket veto", "Constitutional limits"],
      pyqConnection: "Directly tested in 2022 PG CLAT paper on Governor's powers",
      staticLawConnection: "Article 200, Article 111, Centre-State relations",
      expectedQuestionAreas: "Constitutional law, executive powers, legislative process",
      difficulty: "Medium",
      examProbability: 4
    },
    quiz: [
      {
        question: "What is the time limit set by the Supreme Court for Governor's action on a re-passed Bill?",
        type: "conceptual",
        options: ["15 days", "1 month", "3 months", "6 months"],
        correctIndex: 1,
        explanation: "The Court set a one-month outer limit for ordinary cases and three months when the Bill is reserved for the President's consideration."
      },
      {
        question: "Which constitutional principle did the Court apply to limit Governor's inaction?",
        type: "static_law",
        options: ["Doctrine of pith and substance", "Doctrine of constitutional silence", "Doctrine of colourable legislation", "Doctrine of eclipse"],
        correctIndex: 1,
        explanation: "The Court applied the doctrine of constitutional silence, reasoning that the Constitution enumerates what the Governor must do, and silence cannot enlarge that."
      }
    ],
    beforeYouLeave: {
      oneLiner: "Governor's silence is not a constitutional option - Article 200 now has a reasonable time limit.",
      threeBullets: ["1 month limit for ordinary Bills", "3 months if reserved for President", "Deemed assent if no action taken"],
      examTip: "Remember: Article 200 vs Article 111 - different procedures and time limits apply to Governor vs President."
    }
  },
  {
    id: "s-002",
    editionDate: "2026-07-22",
    slug: "ipc-section-302-rare-conviction",
    title: "Conviction Rate Drops Below 40%: What Section 302 Data Tells Us",
    category: "criminal-law",
    examTags: ["UG"],
    readingTimeMin: 3,
    summary:
      "NCRB 2025 data shows Section 302 murder conviction rate fell to 38.7% — and trial duration now averages 7 years.",
    whatHappened:
      "The National Crime Records Bureau released its 2025 Crime in India report this week. Among its findings: conviction rates for murder (Section 302 IPC) declined from 44.1% in 2020 to 38.7% in 2025. The average time from FIR to conviction in murder trials is now 7.2 years, up from 5.8 years five years ago.",
    background:
      "Section 302 IPC defines the offence of murder and prescribes the death penalty or life imprisonment as punishment. The conviction rate is one of the most-cited metrics in criminal-justice policy debates. Earlier reports had flagged declining conviction rates and increasing pendency across Indian trial courts.",
    whatCourtHeld: null,
    whyItMatters:
      "IPC structure (Sections 299–304) is heavily tested on CLAT UG. Awareness of policy debates around conviction rates, pendency, and the death penalty is recurring in the GK and Legal Reasoning sections.",
    keyPoints: [
      { text: "Section 302 murder conviction rate fell to 38.7% in 2025 (from 44.1% in 2020)." },
      { text: "Average trial duration in murder cases is now 7.2 years." },
      { text: "Pendency in Indian trial courts crossed 5 crore cases in the same period." },
      { text: "Conviction rate for culpable homicide (Sec 304) remains higher at 56%." },
    ],
    sources: [
      {
        name: "NCRB — Crime in India 2025",
        url: "https://ncrb.gov.in",
        type: "official",
      },
      {
        name: "Bar & Bench — NCRB analysis",
        url: "https://www.barandbench.com",
        type: "legal_website",
      },
    ],
    pyqKeyword: "Section 302 IPC murder",
    decision: "must_cover",
    publishedAt: "2026-07-22T07:30:00Z",
    status: "published",
    // Gated content for UI testing
    whatActuallyHappening: "NCRB data shows murder conviction rates are dropping while trial times are increasing, indicating systemic issues in the criminal justice system.",
    whyDidThisHappen: "Multiple factors contribute: witness protection issues, judicial vacancies, procedural delays, and inadequate investigation quality. The pandemic also exacerbated existing backlogs.",
    importantTerms: [
      {
        term: "Conviction Rate",
        whatIsIt: "Percentage of cases resulting in conviction out of total cases decided",
        whyItMatters: "Key metric for criminal justice system effectiveness - low rates suggest investigation or prosecution problems"
      },
      {
        term: "Section 302 IPC",
        whatIsIt: "Legal provision defining murder and prescribing death penalty or life imprisonment",
        whyItMatters: "Most serious offence in IPC - conviction rates here indicate system's ability to handle major crimes"
      }
    ],
    lawBehindIt: "Section 302 IPC, Code of Criminal Procedure",
    analogy: "Like a factory with declining quality output and increasing production time - the system is struggling to process cases efficiently.",
    friendExplanation: "Think of it as the criminal justice system's report card - getting worse grades in processing murder cases over time.",
    commonConfusions: [
      {
        a: "Conviction rate",
        b: "Acquittal rate",
        explanation: "Conviction rate is convictions/total decided cases; acquittal rate is acquittals/total decided cases - they are complements"
      }
    ],
    examLens: {
      fiveThings: ["Section 302 IPC", "NCRB reports", "Criminal justice metrics", "Trial duration", "Systemic delays"],
      pyqConnection: "Often tested through data interpretation questions in GK section",
      staticLawConnection: "IPC Sections 299-304, CrPC provisions on trial procedures",
      expectedQuestionAreas: "Criminal law, statistical interpretation, criminal justice policy",
      difficulty: "Easy",
      examProbability: 3
    },
    quiz: [
      {
        question: "What is the conviction rate for murder as per NCRB 2025 data?",
        type: "application",
        options: ["44.1%", "38.7%", "56%", "42.3%"],
        correctIndex: 1,
        explanation: "The conviction rate for murder (Section 302 IPC) declined to 38.7% in 2025 from 44.1% in 2020."
      },
      {
        question: "What is the average trial duration in murder cases according to the data?",
        type: "conceptual",
        options: ["5.8 years", "7.2 years", "6.5 years", "8.1 years"],
        correctIndex: 1,
        explanation: "The average time from FIR to conviction in murder trials is now 7.2 years, up from 5.8 years five years ago."
      }
    ],
    beforeYouLeave: {
      oneLiner: "Murder conviction rates are dropping while trial times increase - indicating systemic criminal justice challenges.",
      threeBullets: ["38.7% conviction rate for murder", "7.2 years average trial duration", "5 crore pending cases overall"],
      examTip: "Remember NCRB data for GK questions - trends in conviction rates and pendency are frequently tested."
    }
  },
  {
    id: "s-003",
    editionDate: "2026-07-22",
    slug: "data-protection-board-rules",
    title: "Data Protection Board Notifies Adjudication Rules — First Major Step Under DPDPA",
    category: "legal-current-affairs",
    examTags: ["UG", "PG"],
    readingTimeMin: 3,
    summary:
      "After three years of DPDPA being on the statute book, the Data Protection Board has finally notified its adjudication rules.",
    whatHappened:
      "The Data Protection Board of India, constituted under Section 18 of the Digital Personal Data Protection Act 2023, notified its adjudication rules this week. The rules lay down the procedure for complaints, the conduct of inquiry, and the timeline for disposal of complaints (90 days for ordinary matters, 180 days for complex ones).",
    background:
      "The DPDPA was enacted in August 2023, replacing the older IT Act framework for personal data. However, the operational rules — particularly those governing the Board — were never notified, leaving the statute partially in force. The Board was finally constituted in early 2025 but could not adjudicate complaints without the procedural rules.",
    whatCourtHeld: null,
    whyItMatters:
      "DPDPA is a high-frequency GK topic for CLAT UG and is regularly tested in the Legal Reasoning section (especially consent, deemed consent, and data fiduciary obligations). The Board's powers under Sections 24–25 are now operationally relevant for the first time.",
    keyPoints: [
      { text: "Data Protection Board notified adjudication rules under Section 18 DPDPA." },
      { text: "Complaint disposal timeline: 90 days ordinary, 180 days complex." },
      { text: "Board can now levy penalties up to ₹250 crore per breach under Section 33." },
      { text: "First complaints under the new framework expected within the next quarter." },
    ],
    sources: [
      {
        name: "Ministry of Electronics & IT — Press Release",
        url: "https://www.meity.gov.in",
        type: "official",
      },
      {
        name: "LiveLaw — DPDPA analysis",
        url: "https://www.livelaw.in",
        type: "legal_website",
      },
    ],
    pyqKeyword: "DPDPA Data Protection Board",
    decision: "must_cover",
    publishedAt: "2026-07-22T07:30:00Z",
    status: "published",
  },
  {
    id: "s-004",
    editionDate: "2026-07-22",
    slug: "consumer-protection-amendment-2026",
    title: "Consumer Protection (Amendment) Bill, 2026: What Changes",
    category: "bare-acts-update",
    examTags: ["UG"],
    readingTimeMin: 4,
    summary:
      "The 2026 amendment to the Consumer Protection Act raises pecuniary jurisdiction and expands e-commerce coverage.",
    whatHappened:
      "The Ministry of Consumer Affairs introduced the Consumer Protection (Amendment) Bill, 2026 in Lok Sabha last week. Key changes: (1) Pecuniary jurisdiction of District Consumer Disputes Redressal Commissions raised from ₹1 crore to ₹5 crore; (2) E-commerce platforms brought explicitly under 'service' definitions for the first time; (3) Limitation period for filing complaints extended from 2 to 3 years.",
    background:
      "The Consumer Protection Act 2019 replaced the older 1986 statute and introduced the CCPA (Central Consumer Protection Authority), mediation cells, and product-liability action. However, its pecuniary thresholds have not been revised since enactment, leading to chronic overburdening of State Commissions.",
    whatCourtHeld: null,
    whyItMatters:
      "Consumer Protection Act is on the CLAT UG Bare Acts list. Pecuniary jurisdiction, definitions of 'consumer' and 'unfair trade practice', and CCPA's powers are frequent question themes.",
    keyPoints: [
      { text: "District Commission jurisdiction raised from ₹1 crore to ₹5 crore." },
      { text: "E-commerce platforms now explicitly covered under 'service' definition." },
      { text: "Limitation period extended from 2 to 3 years." },
      { text: "CCPA can now investigate suo motu without a prior complaint in certain cases." },
    ],
    sources: [
      {
        name: "PRS Legislative Research",
        url: "https://prsindia.org",
        type: "official",
      },
      {
        name: "Bar & Bench — Bill analysis",
        url: "https://www.barandbench.com",
        type: "legal_website",
      },
    ],
    pyqKeyword: "Consumer Protection Act jurisdiction",
    decision: "must_cover",
    publishedAt: "2026-07-22T07:30:00Z",
    status: "published",
  },

  // ── Edition 2: 21 July 2026 ──
  {
    id: "s-005",
    editionDate: "2026-07-21",
    slug: "sedition-section-152-bns-stay",
    title: "Supreme Court Stays Section 152 BNS Prosecutions Pending Guidelines",
    category: "constitutional-law",
    examTags: ["UG", "PG"],
    readingTimeMin: 4,
    summary:
      "A two-judge bench stays all prosecutions under the new sedition provision until the Centre frames guidelines.",
    whatHappened:
      "The Supreme Court stayed all prosecutions under Section 152 of the Bharatiya Nyaya Sanhita (the new sedition provision replacing IPC Section 124A) until the Union Government frames guidelines on its use. The Court was responding to a batch of petitions arguing that Section 152 is being invoked indiscriminately and that the Centre's assurances have not translated into restraint.",
    background:
      "Section 152 BNS, introduced in December 2023, replaced the colonial-era Section 124A IPC. Unlike its predecessor, it carries a mandatory minimum sentence of 3 years and extends to acts 'endangering sovereignty, unity and integrity of India'. Multiple petitions have challenged its constitutionality on grounds of overbreadth and chilling effect.",
    whatCourtHeld:
      "The bench noted that while Section 152 is not prima facie unconstitutional, its invocation must be guided by considerations the Court has previously outlined for Section 124A prosecutions. The Court directed that no fresh FIRs shall be registered under Section 152 without the prior approval of a Sessions Judge, and called for a status report on existing prosecutions.",
    whyItMatters:
      "BNS sections (especially 152 replacing 124A) are a hot topic for CLAT PG and increasingly for UG. Sedition jurisprudence — Kedar Nath Singh, S.G. Vombatkere, and the pre/post-BNS distinction — is heavily tested in Constitutional Law.",
    keyPoints: [
      { text: "All Section 152 BNS prosecutions stayed until Centre frames guidelines." },
      { text: "No fresh FIRs without prior approval of a Sessions Judge." },
      { text: "Kedar Nath Singh and Vombatkere safeguards apply to Section 152." },
      { text: "Centre given 6 weeks to file a status report on existing prosecutions." },
    ],
    sources: [
      {
        name: "LiveLaw — Supreme Court order",
        url: "https://www.livelaw.in",
        type: "legal_website",
      },
      {
        name: "The Wire — Section 152 analysis",
        url: "https://thewire.in",
        type: "newspaper",
      },
    ],
    pyqKeyword: "Section 152 BNS sedition",
    decision: "must_cover",
    publishedAt: "2026-07-21T07:30:00Z",
    status: "published",
  },
  {
    id: "s-006",
    editionDate: "2026-07-21",
    slug: "evidence-act-section-27-discovery",
    title: "Section 27 Evidence Act: SC Tightens Rules on 'Discovery' Statements",
    category: "criminal-law",
    examTags: ["UG", "PG"],
    readingTimeMin: 3,
    summary:
      "Supreme Court holds that only the precise information leading to discovery is admissible under Section 27, not the entire statement.",
    whatHappened:
      "In a landmark criminal appeal, the Supreme Court ruled that under Section 27 of the Evidence Act, only that portion of an accused's statement which leads directly to the discovery of a fact is admissible — not the entire confessional narrative surrounding it.",
    background:
      "Section 27 Evidence Act is the 'discovery' exception to the rule against confessions. When an accused, while in police custody, makes a statement leading to the discovery of a fact, that portion of the statement is admissible. Lower courts have varied in how strictly they apply this — some admit the entire statement, others only the precise 'discovery' portion.",
    whatCourtHeld:
      "The bench held that Section 27 admits only the information which is 'the causa causans' of the discovery. The surrounding narrative — even if incriminating — falls outside Section 27 and cannot be admitted either directly or by way of cross-examination. The Court overruled a 1995 coordinate-bench decision that had taken a wider view.",
    whyItMatters:
      "Evidence Act Sections 24–30 (confessions) and Section 27 (discovery) are heavily tested on CLAT UG and PG. The causa causans distinction is a standard examination point.",
    keyPoints: [
      { text: "Section 27 admits only the precise information leading to discovery — not surrounding narrative." },
      { text: "1995 coordinate-bench decision taking a wider view was overruled." },
      { text: "Police must record discovery statements with precision to avoid inadmissibility." },
      { text: "Decision applies prospectively to trials not yet concluded." },
    ],
    sources: [
      {
        name: "Bar & Bench — Evidence Act ruling",
        url: "https://www.barandbench.com",
        type: "legal_website",
      },
    ],
    pyqKeyword: "Section 27 Evidence Act discovery",
    decision: "must_cover",
    publishedAt: "2026-07-21T07:30:00Z",
    status: "published",
  },
  {
    id: "s-007",
    editionDate: "2026-07-21",
    slug: "rbi-priority-sector-lending-crypto",
    title: "RBI Asks Banks to Report Crypto-Related Transactions to FIU",
    category: "legal-current-affairs",
    examTags: ["UG"],
    readingTimeMin: 2,
    summary:
      "RBI advisory brings crypto transactions explicitly within the PMLA reporting framework.",
    whatHappened:
      "The Reserve Bank of India, in coordination with the Financial Intelligence Unit-India (FIU-IND), issued an advisory asking all scheduled commercial banks and payment system operators to report transactions involving Virtual Digital Assets (VDAs) under the Prevention of Money Laundering Act.",
    background:
      "The Crypto-tax regime introduced in 2022 (Section 194S of the Income-tax Act) brought VDAs within the tax net but left anti-money-laundering reporting framework fragmented. The Supreme Court's 2020 decision in Internet and Mobile Association of India v. RBI had lifted the banking ban, but reporting obligations remained unclear.",
    whatCourtHeld: null,
    whyItMatters:
      "PMLA (Sections 3, 4, 12) and RBI's regulatory jurisdiction over payment systems are tested topics. Awareness of recent crypto/VDA regulation is increasingly appearing in CLAT UG GK.",
    keyPoints: [
      { text: "Banks must report VDA transactions to FIU-IND under PMLA." },
      { text: "Reporting threshold: ₹10 lakh aggregate credits/debits in a financial year." },
      { text: "Advisory does not amount to a fresh ban — it standardizes reporting." },
      { text: "Non-compliance may attract Section 4 PMLA penalties." },
    ],
    sources: [
      {
        name: "RBI Press Release",
        url: "https://www.rbi.org.in",
        type: "official",
      },
    ],
    pyqKeyword: "PMLA FIU crypto",
    decision: "maybe",
    publishedAt: "2026-07-21T07:30:00Z",
    status: "published",
  },
  {
    id: "s-008",
    editionDate: "2026-07-21",
    slug: "bns-section-103-murder-amendment",
    title: "BNS Section 103 Explained: The New 'Murder' Definition",
    category: "bare-acts-update",
    examTags: ["UG", "PG"],
    readingTimeMin: 3,
    summary:
      "A practical guide to Section 103 BNS — the successor to Section 300 IPC — and what changed in the ingredients.",
    whatHappened:
      "Section 103 of the Bharatiya Nyaya Sanhita, which came into effect on 1 July 2024, replaces Section 300 of the IPC as the definitional provision for 'murder'. We walk through the five clauses, the four exceptions, and how the framing has shifted.",
    background:
      "The BNS retained the IPC's five-clause structure for murder but reorganised and renumbered clauses, and added a community-service provision as part of the punishment framework. The four exceptions (sudden provocation, exceeding the right of private defence, public servant exceeding lawful authority, sudden fight in heat of passion) remain substantively unchanged.",
    whatCourtHeld: null,
    whyItMatters:
      "BNS Sections 100–103 are the new core of criminal-law questions on CLAT UG and PG. Knowing the five clauses and the four exceptions is table stakes; understanding what changed from IPC 300 is what differentiates a strong answer.",
    keyPoints: [
      { text: "Section 103 BNS replaces Section 300 IPC — five-clause structure retained." },
      { text: "Four exceptions (sudden provocation, private defence, public servant, sudden fight) unchanged in substance." },
      { text: "Punishment now includes a community-service option for certain categories of culpable homicide." },
      { text: "Section 100 BNS (culpable homicide) retains the IPC's two-degree framework." },
    ],
    sources: [
      {
        name: "Ministry of Home Affairs — BNS text",
        url: "https://www.mha.gov.in",
        type: "official",
      },
    ],
    pyqKeyword: "Section 103 BNS murder",
    decision: "must_cover",
    publishedAt: "2026-07-21T07:30:00Z",
    status: "published",
  },

  // ── Edition 3: 20 July 2026 ──
  {
    id: "s-009",
    editionDate: "2026-07-20",
    slug: "article-21-privacy-roundup",
    title: "Article 21's Privacy Doctrine in 2026: Five New Bench Decisions",
    category: "constitutional-law",
    examTags: ["UG", "PG"],
    readingTimeMin: 5,
    summary:
      "A roundup of five recent Supreme Court decisions that have shaped the Article 21 privacy doctrine this year.",
    whatHappened:
      "Since the Puttaswamy (2017) decision recognising privacy as a fundamental right under Article 21, the Supreme Court has incrementally expanded the doctrine. We summarise five 2026 decisions: (1) data portability; (2) health-data confidentiality; (3) surveillance authorisation; (4) reproductive autonomy; (5) post-mortem privacy.",
    background:
      "Article 21 — 'No person shall be deprived of his life or personal liberty except according to procedure established by law' — has been read expansively since Maneka Gandhi (1978). The 2017 Puttaswamy judgment crystallised a constitutional right to informational privacy, with proportionality as the governing test.",
    whatCourtHeld:
      "Each of the five decisions applied the Puttaswamy proportionality framework — legitimate aim, suitable means, necessity, balancing — to novel fact patterns. Notable holdings: surveillance without independent authorisation is constitutionally infirm; posthumous privacy survives the death of the data principal; reproductive autonomy includes contraceptive access.",
    whyItMatters:
      "Article 21 is the most-tested provision in the CLAT Constitutional Law syllabus. Knowing the leading cases (Maneka, Puttaswamy, Naz Foundation, Navtej Singh) and the proportionality test is essential; the 2026 decisions show the doctrine's continued expansion.",
    keyPoints: [
      { text: "Proportionality test (Puttaswamy) is now applied across privacy fact patterns." },
      { text: "Surveillance without independent authorisation violates Article 21." },
      { text: "Posthumous privacy survives the death of the data principal." },
      { text: "Reproductive autonomy includes access to contraceptive information." },
    ],
    sources: [
      {
        name: "LiveLaw — Article 21 roundup",
        url: "https://www.livelaw.in",
        type: "legal_website",
      },
    ],
    pyqKeyword: "Article 21 privacy Puttaswamy",
    decision: "maybe",
    publishedAt: "2026-07-20T07:30:00Z",
    status: "published",
  },
  {
    id: "s-010",
    editionDate: "2026-07-20",
    slug: "anticipatory-bail-section-482-bnss",
    title: "Anticipatory Bail Under Section 482 BNSS: What Stays, What Changes",
    category: "criminal-law",
    examTags: ["UG", "PG"],
    readingTimeMin: 3,
    summary:
      "The new Section 482 BNSS retains S. 438 CrPC's anticipatory-bail framework with one notable procedural change.",
    whatHappened:
      "Section 482 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), in force since 1 July 2024, is the successor to Section 438 CrPC. It retains the substantive four-condition test from the Supreme Court's 1980 decision in Gurbaksh Singh Sibbia but adds a procedural requirement: pre-arrest bail applications in cognizable offences must be heard by a bench of two judges in cases triable by a Sessions Court.",
    background:
      "Section 438 CrPC was enacted in 1974 (post-Lakshmi Kant Bajpai recommendations) and has been the subject of extensive Supreme Court jurisprudence. The Sibbia framework requires the applicant to show: (1) reasonable apprehension of arrest; (2) the offence is cognizable; (3) applicant is not accused of a non-bailable offence of particular gravity; (4) no possibility of tampering with evidence.",
    whatCourtHeld:
      "While the BNSS provision is now in force, the Supreme Court has clarified that Sibbia remains the governing framework. The two-judge bench requirement for Sessions-triable cases is procedural and does not alter substantive anticipatory bail law.",
    whyItMatters:
      "Anticipatory bail (Section 438 CrPC / 482 BNSS) is one of the most-tested criminal-procedure topics on CLAT. The Sibbia conditions are a standard question; the BNSS recodification is recent and frequently tested.",
    keyPoints: [
      { text: "Section 482 BNSS replaces Section 438 CrPC with substantive law unchanged." },
      { text: "Two-judge bench requirement for cases triable by Sessions Court is procedural." },
      { text: "Sibbia four-condition test remains the governing framework." },
      { text: "Pre-arrest bail is not available for certain serious offences (BNSS Schedule)." },
    ],
    sources: [
      {
        name: "Bar & Bench — Section 482 BNSS",
        url: "https://www.barandbench.com",
        type: "legal_website",
      },
    ],
    pyqKeyword: "anticipatory bail Section 438",
    decision: "must_cover",
    publishedAt: "2026-07-20T07:30:00Z",
    status: "published",
  },
  {
    id: "s-011",
    editionDate: "2026-07-20",
    slug: "cabinet-approals-judicial-reforms",
    title: "Cabinet Approves Judicial Reforms Package — All-India Judicial Service on the Anvil",
    category: "legal-current-affairs",
    examTags: ["UG", "PG"],
    readingTimeMin: 3,
    summary:
      "Cabinet clears All-India Judicial Service and e-Courts Phase III — biggest judicial reform push in two decades.",
    whatHappened:
      "The Union Cabinet cleared two long-pending judicial reform proposals this week: (1) constitution of an All-India Judicial Service (AIJS) on the lines of the IAS/IPS for recruitment to the higher judiciary; (2) Phase III of the e-Courts project with a ₹7,000 crore outlay for AI-based translation, transcription, and case-management tools.",
    background:
      "The AIJS was first recommended by the Law Commission in its 116th Report (1986) and has been revived in multiple iterations. Article 312 of the Constitution provides for an All-India Service for the judiciary but has never been operationalised. The e-Courts project is in its second phase (2015–2023); Phase III was pending approval.",
    whatCourtHeld: null,
    whyItMatters:
      "Article 312 (All-India Services) and the collegium system (Supreme Court Judges case, 1998) are standard CLAT PG topics. AIJS is a recurring theme in polity and current-affairs questions.",
    keyPoints: [
      { text: "AIJS to be constituted under Article 312 of the Constitution." },
      { text: "e-Courts Phase III outlay: ₹7,000 crore over 5 years." },
      { text: "AIJS to handle recruitment for District Judges and subordinate judiciary." },
      { text: "Bill to be introduced in the upcoming Monsoon Session." },
    ],
    sources: [
      {
        name: "PIB — Cabinet press release",
        url: "https://www.pib.gov.in",
        type: "official",
      },
      {
        name: "PRS Legislative Research",
        url: "https://prsindia.org",
        type: "official",
      },
    ],
    pyqKeyword: "All India Judicial Service Article 312",
    decision: "maybe",
    publishedAt: "2026-07-20T07:30:00Z",
    status: "published",
  },
  {
    id: "s-012",
    editionDate: "2026-07-20",
    slug: "bns-section-49-public-tranquillity",
    title: "BNS Section 49 vs IPC 141: Unlawful Assembly, Reimagined",
    category: "bare-acts-update",
    examTags: ["UG"],
    readingTimeMin: 3,
    summary:
      "Section 49 BNS replaces IPC 141 — the new unlawful-assembly definition is shorter but its scope is broadly the same.",
    whatHappened:
      "Section 49 of the Bharatiya Nyaya Sanhita, in force from 1 July 2024, replaces Section 141 IPC as the definitional provision for 'unlawful assembly'. The provision is shorter (five clauses vs. seven in IPC) but the underlying concept — five or more persons with a common object to commit an offence or resist execution of law — is unchanged.",
    background:
      "Unlawful assembly is the foundation for Sections 149 and 150 IPC (now 190 and 191 BNSS) — vicarious liability for acts done in prosecution of the common object. The case law under IPC 141 is well-developed and continues to apply.",
    whatCourtHeld: null,
    whyItMatters:
      "Unlawful assembly (S. 141 IPC / 49 BNS) and common object (S. 149 IPC / 190 BNS) are heavily tested on CLAT UG. The recodification is recent and is increasingly appearing in the question paper.",
    keyPoints: [
      { text: "Section 49 BNS replaces Section 141 IPC — five clauses vs. seven." },
      { text: "Common-object vicarious liability (S. 190 BNS) replaces S. 149 IPC." },
      { text: "Pre-BNS case law continues to apply." },
      { text: "Minimum number of persons remains five." },
    ],
    sources: [
      {
        name: "Ministry of Home Affairs — BNS text",
        url: "https://www.mha.gov.in",
        type: "official",
      },
    ],
    pyqKeyword: "Section 141 IPC unlawful assembly",
    decision: "maybe",
    publishedAt: "2026-07-20T07:30:00Z",
    status: "published",
  },

  // ── Schema v2 example (Section 294(b) obscenity — public-domain SC theme) ──
  {
    id: "s-v2-001",
    editionDate: "2026-07-24",
    slug: "section-294b-obscenity-test-sc",
    title: "Section 294(b) and the Living Community Standard on Obscenity",
    category: "criminal-law",
    examTags: ["UG", "PG"],
    readingTimeMin: 5,
    summary:
      "Supreme Court revisits the obscenity test under Section 294(b) IPC / BNS successor — community standards, not Victorian morals.",
    // Dual-read: leave classic v1 body lightly filled so feed/search still work
    whatHappened:
      "A Supreme Court bench clarified how Section 294(b) IPC (and its BNS successor) should be read when a complaint alleges that public conduct or material is 'obscene'. The Court stressed a contemporary community standard rather than a Victorian moral filter.",
    background:
      "Obscenity jurisprudence in India runs from Ranjit Udeshi through Aveek Sarkar and beyond. Section 294 deals with obscene acts and songs in public; the BNS recodification keeps the offence but renumbers the provision.",
    whatCourtHeld:
      "The Court held that the test is whether the material tends to deprave and corrupt those whose minds are open to such influences, judged by contemporary community standards — not the hypersensitivity of a complainant alone.",
    whyItMatters:
      "Obscenity and free speech (Arts. 19(1)(a)/19(2)) are a high-frequency CLAT pair. Knowing the governing test and the IPC→BNS map is exam-critical.",
    keyPoints: [
      { text: "Community standard of the day governs obscenity, not Victorian morals." },
      { text: "Section 294(b) IPC maps to the corresponding BNS public-obscenity clause." },
      { text: "Art. 19(2) decency/morality is the constitutional hinge." },
    ],
    sources: [],
    sourcesV2: {
      primary: "Supreme Court of India judgment (public domain report)",
      secondary: [
        "Indian Penal Code Section 294(b)",
        "Bharatiya Nyaya Sanhita (corresponding public-obscenity provision)",
      ],
    },
    pyqKeyword: "obscenity Section 294 free speech",
    decision: "must_cover",
    publishedAt: "2026-07-24T07:30:00Z",
    status: "published",
    schemaVersion: 2,
    hero: {
      title: "Section 294(b) and the Living Community Standard on Obscenity",
      subtitle: "Community standards, not Victorian morals",
      category: "criminal-law",
      subject: "Obscenity / Free speech",
      exam: "Both",
      readTime: "5 min",
      difficulty: "Medium",
      importance: "4",
      date: "2026-07-24",
      tags: ["obscenity", "Section 294", "Art. 19", "BNS"],
    },
    story: {
      heading: "What Happened?",
      summary:
        "The Supreme Court revisited how Section 294(b) IPC (and its BNS successor) should be applied when someone says public conduct or material is 'obscene'. The short version: judges must use today's community standard, not a 19th-century moral filter, and a single hypersensitive complainant does not set the bar.",
      takeaway:
        "Obscenity under 294(b) is judged by contemporary community standards — not Victorian morals or one person's outrage.",
    },
    lawDecode: {
      heading: "Decode the Law",
      sections: [
        {
          provision: "Section 294(b) IPC",
          explanation:
            "Criminalises singing, reciting, or uttering any obscene song, ballad, or words in or near a public place, to the annoyance of others.",
        },
        {
          provision: "Article 19(1)(a) / 19(2)",
          explanation:
            "Speech is free, but reasonable restrictions on grounds including decency and morality can sustain obscenity offences when the legal test is met.",
        },
      ],
      doctrines: [
        {
          name: "Community standards test",
          explanation:
            "Material is judged by contemporary standards of the community whose morals are said to be affected — not by the most sensitive person.",
        },
      ],
      legalTests: [
        {
          name: "Hicklin / community standard (Indian adaptation)",
          rule: "Whether the tendency of the matter is to deprave and corrupt those whose minds are open to such immoral influences, read through a modern community lens.",
        },
      ],
      importantCases: [
        {
          case: "Ranjit D. Udeshi v. State of Maharashtra (1965)",
          principle: "Classic Indian engagement with the Hicklin test on obscenity.",
        },
        {
          case: "Aveek Sarkar v. State of West Bengal (2014)",
          principle: "Community standards and context matter; isolated prurience is not enough.",
        },
      ],
      constitutionalLink: [
        {
          article: "Article 19(2) — decency and morality",
          why: "The restriction clause that lets the State sustain obscenity offences against free-speech challenges.",
        },
      ],
      staticConnections: [
        { item: "Art. 19 free speech vs reasonable restrictions" },
        { item: "IPC → BNS renumbering of public-obscenity offences" },
      ],
      bnsMapping: {
        ipc: "Section 294(b) IPC",
        bns: "Corresponding BNS public-obscenity provision",
      },
      dontConfuse: [
        {
          confusion: "Section 292 (sale of obscene books/objects)",
          reality:
            "292 targets distribution/sale of obscene material; 294(b) targets obscene utterance/song in or near a public place causing annoyance.",
        },
      ],
      memoryTrick:
        "294(b) = Public song/words + annoyance. Judge by TODAY's community, not Queen Victoria.",
    },
    examRadar: {
      heading: "Exam Radar",
      whyExam:
        "Obscenity + Art. 19 is a staple free-speech pair on CLAT UG/PG; the IPC/BNS map and the community-standard test are both tested.",
      likelyQuestions: [
        "Distinguish Section 292 and Section 294(b)",
        "State the community standards test for obscenity",
        "Link Art. 19(2) decency/morality to obscenity offences",
      ],
      examinerFocus: [
        "Community standard vs Victorian morals",
        "Public place + annoyance elements of 294(b)",
        "IPC → BNS continuity",
      ],
      pyqConnection:
        "Free-speech and reasonable-restriction fact patterns often pair Art. 19 with obscenity or public-order offences.",
      probability: 4,
      difficulty: { UG: "Medium", PG: "Medium", Judiciary: "Hard" },
    },
    challenge: {
      heading: "Challenge Yourself",
      mcqs: [
        {
          question:
            "Under the contemporary Indian approach, obscenity is primarily judged by:",
          type: "conceptual",
          options: {
            A: "The most sensitive complainant's reaction alone",
            B: "Contemporary community standards",
            C: "Victorian English morals as of 1860",
            D: "Whether the material is political",
          },
          answer: "B",
          explanation:
            "Indian jurisprudence has moved toward a contemporary community-standards lens rather than a purely Victorian or hypersensitive baseline.",
        },
        {
          question: "Section 294(b) IPC primarily targets:",
          type: "factual",
          options: {
            A: "Sale of obscene books in private",
            B: "Obscene song/words in or near a public place to others' annoyance",
            C: "Online defamation only",
            D: "Sedition",
          },
          answer: "B",
          explanation:
            "294(b) is about obscene utterance/song in or near a public place causing annoyance — distinct from 292's sale/distribution focus.",
        },
        {
          question:
            "Which constitutional clause most directly sustains obscenity offences against free-speech challenges?",
          type: "application",
          options: {
            A: "Article 14 equality",
            B: "Article 21 privacy only",
            C: "Article 19(2) decency and morality",
            D: "Article 32 alone",
          },
          answer: "C",
          explanation:
            "Art. 19(2) lists decency and morality among the grounds for reasonable restrictions on Art. 19(1)(a).",
        },
      ],
    },
    oneLineRevision: {
      heading: "One Line Revision",
      line: "294(b): public obscene words/song + annoyance — judged by today's community standard, sustained via Art. 19(2) decency/morality.",
    },
    visualMemoryCard: `SECTION 294(b) OBSCENITY
           │
    Public song / words
           │
    + Annoyance to others
           │
    Test: community standard (today)
           │
    NOT Victorian morals alone
           │
    Art. 19(1)(a) ←→ Art. 19(2) decency
           │
    IPC 294(b) → BNS (public obscenity)`,
  },
];