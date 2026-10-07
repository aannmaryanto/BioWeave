import axios from 'axios';

// Base URL for BioWeave API backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to headers if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bioweave_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Service Methods
export const authService = {
  /**
   * Register a new user
   */
  async register(name, email, password) {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
  },

  /**
   * Login user
   */
  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// Dashboard Service Methods
export const dashboardService = {
  /**
   * Get authenticated user dashboard stats
   */
  async getStats() {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },

  /**
   * Get recent documents for dashboard
   */
  async getRecentDocuments() {
    const response = await api.get('/api/dashboard/recent');
    return response.data;
  },
};

// Document Service Methods
export const documentService = {
  /**
   * Get documents belonging to authenticated user
   */
  async getDocuments(params = {}) {
    const response = await api.get('/api/documents', { params });
    return response.data;
  },

  /**
   * Get single document by ID
   */
  async getDocument(id) {
    const response = await api.get(`/api/documents/${id}`);
    return response.data;
  },

  /**
   * Create new document metadata
   */
  async createDocument(data) {
    const response = await api.post('/api/documents', data);
    return response.data;
  },

  /**
   * Update existing document metadata
   */
  async updateDocument(id, data) {
    const response = await api.put(`/api/documents/${id}`, data);
    return response.data;
  },

  /**
   * Delete document
   */
  async deleteDocument(id) {
    const response = await api.delete(`/api/documents/${id}`);
    return response.data;
  },

  /**
   * Upload a document file with metadata (multipart/form-data)
   */
  async uploadDocument(formData) {
    const response = await api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Existing Mock Data & Documents Service (Retained for UI display)
export const MOCK_DOCUMENTS = [
  {
    id: "doc-1",
    title: "Optimizing Lipid Nanoparticle Formulations for mRNA Delivery to Primary Hepatocytes",
    type: "Research Paper",
    category: "Lipid Nanoparticles",
    authors: "Dr. Aris Thorne, Dr. Elena Rostova",
    journal: "Nature Biotechnology (2025)",
    date: "2026-02-14",
    status: "Processed",
    fileSize: "4.2 MB",
    pageCount: 14,
    doi: "10.1038/s41587-025-02104-x",
    relevance: 98,
    tags: ["LNP", "mRNA", "Hepatocytes", "Drug Delivery"],
    snippet: "Ionizable cationic lipids were synthesized to evaluate liver-targeted transfection efficiency. Formulations containing 50 mol% ionizable lipid exhibited a 12-fold increase in luciferase expression with minimal cellular toxicity.",
    extractedText: `Abstract: mRNA therapeutics rely heavily on lipid nanoparticle (LNP) vectors for systemic cellular delivery. Here, we systematically screened a library of novel ionizable amino lipids to determine optimal molar ratios for hepatic cell uptake.

Methods & Materials:
1. Lipid Mix: Cationic lipid / DSPC / Cholesterol / PEG-lipid at molar ratio 50:10:38.5:1.5.
2. Microfluidic Formulation: Formulated using NanoAssemblr at a total flow rate of 12 mL/min.
3. In vitro Transfection: Primary mouse hepatocytes were incubated for 24h prior to luminescence readout.

Results & Discussion:
Optimal formulation LNP-89 produced >94% encapsulation efficiency with average hydrodynamic diameter of 78.4 nm (PDI < 0.08). Systemic administration demonstrated 88% liver tropism.`,
    aiInsights: [
      "Key finding: 50:10:38.5:1.5 molar ratio yielded highest transfection with <5% cytotoxicity.",
      "LNP-89 maintains stability for over 60 days at -80°C with no particle size aggregation.",
      "Synergistic effect observed when combining DLin-MC3-DMA derivatives with helper phospholipid DSPC."
    ],
    entities: {
      genes: ["APOE", "LDLR", "LUC"],
      molecules: ["DLin-MC3-DMA", "DSPC", "Cholesterol", "PEG2000-DMG"],
      organisms: ["Mus musculus", "Homo sapiens"]
    }
  },
  {
    id: "doc-2",
    title: "High-Fidelity CRISPR-Cas12a Cleavage Protocol for Targeted Plant Genome Editing",
    type: "Protocol",
    category: "Gene Editing",
    authors: "Lab Protocol Team",
    journal: "BioWeave Standard Operating Protocols",
    date: "2026-03-01",
    status: "Processed",
    fileSize: "1.8 MB",
    pageCount: 6,
    doi: "SOP-GEN-2026-08",
    relevance: 94,
    tags: ["CRISPR", "Cas12a", "Genome Editing", "Protocol"],
    snippet: "Standardized operating procedure for temperature-optimized Cas12a ribonucleoprotein (RNP) electroporation into Arabidopsis thaliana protoplasts.",
    extractedText: `Purpose: This protocol describes steps to reconstitute AsCas12a protein with synthetic crRNA guides for high-efficiency double-strand break induction.

Reagents Required:
- Recombinant AsCas12a Ultra (10 µg/µL)
- Custom crRNA (100 µM in TE buffer)
- Electroporation Buffer B (BioWeave formulation)

Step-by-step Procedure:
1. Incubate 2 µM Cas12a with 2.5 µM crRNA at 25°C for 15 minutes to form RNPs.
2. Prepare protoplast suspension (2x10^5 cells per 100 µL).
3. Mix RNPs with cell suspension and deliver single pulse at 160V, 15ms.
4. Incubate cells in dark at 23°C for 48 hours prior to genomic DNA extraction.`,
    aiInsights: [
      "Optimal RNP assembly temperature is strictly 25°C; temperatures above 30°C degrade crRNA complexes.",
      "Electroporation efficiency peaks at 78% indel formation when using 2.5:1 RNA-to-protein molar ratio.",
      "Cas12a staggered 5-nucleotide 5' overhang cleavage reduces off-target insertion events compared to Cas9."
    ],
    entities: {
      genes: ["PDS3", "ALS1", "Cas12a"],
      molecules: ["crRNA", "Polyethylene Glycol 4000"],
      organisms: ["Arabidopsis thaliana"]
    }
  },
  {
    id: "doc-3",
    title: "Lab Notebook Entry: Thermal Shift Assay of Engineered PETase Enzyme Variants",
    type: "Lab Note",
    category: "Enzymology",
    authors: "Dr. Maya Lin",
    journal: "BioWeave Internal Lab Bench 4",
    date: "2026-03-04",
    status: "Processed",
    fileSize: "850 KB",
    pageCount: 3,
    doi: "NOTE-2026-0304",
    relevance: 89,
    tags: ["PETase", "Thermal Shift", "Protein Engineering", "Depolymerization"],
    snippet: "Assayed double mutant S238F/W159H against wild-type PETase. Melting temperature (Tm) increased by +9.4°C in 50 mM Tris-HCl buffer.",
    extractedText: `Date: March 4, 2026
Objective: Evaluate thermostability of computationally designed PETase variants (BioWeave Fold v3.2 predictions).

Experimental Setup:
- Dye: SYPRO Orange (5x final concentration)
- Protein concentration: 0.5 mg/mL
- Temperature gradient: 25°C to 95°C at 1.0°C/min on qPCR instrument.

Observations:
- Wild-type PETase Tm: 48.2°C
- Variant EV-04 (S238F/W159H): 57.6°C
- Variant EV-09 (S238F/W159H/N241K): 62.1°C

Conclusion: EV-09 demonstrates exceptional thermostability compatible with industrial 60°C bioreactor conditions.`,
    aiInsights: [
      "Variant EV-09 increases melting temperature by +13.9°C over wild-type.",
      "Salt concentration in Tris buffer must remain below 150 mM NaCl to prevent early dye quenching.",
      "Predicted to retain >90% catalytic activity after 48h incubation at 55°C."
    ],
    entities: {
      genes: ["PETase", "IsPETase"],
      molecules: ["SYPRO Orange", "Tris-HCl", "Polyethylene terephthalate"],
      organisms: ["Ideonella sakaiensis"]
    }
  },
  {
    id: "doc-4",
    title: "Comparative Single-Cell Transcriptomics of Chimeric Antigen Receptor (CAR) T-Cell Exhaustion",
    type: "Research Paper",
    category: "Immunology",
    authors: "Dr. Samuel Vance, Dr. Elena Rostova",
    journal: "Cell Stem Cell (2025)",
    date: "2026-01-28",
    status: "Processed",
    fileSize: "6.8 MB",
    pageCount: 22,
    doi: "10.1016/j.stem.2025.11.009",
    relevance: 86,
    tags: ["CAR-T", "Single-Cell", "Immuno-oncology", "Exhaustion"],
    snippet: "Identified a novel TOX-dependent transcriptional circuit driving terminal exhaustion in 4-1BB co-stimulated CAR T-cells under chronic antigen stimulation.",
    extractedText: `Abstract: Long-term efficacy of CAR-T immunotherapy is frequently restricted by functional T-cell exhaustion. We performed single-cell RNA-seq and ATAC-seq on patient samples harvested at Days 7, 14, and 28 post-infusion.

Findings:
Subclusters expressing high levels of LAG3, HAVCR2 (TIM-3), and PDCD1 displayed epigenetic chromatin closing at effector cytokine locus IL2 and IFNG. Targeted knockdown of transcription factor TOX restored proliferative capacity in vitro.`,
    aiInsights: [
      "TOX gene ablation prevents chromatin remodeling into irreversible exhaustion states.",
      "4-1BB co-stimulatory domains show 35% lower exhaustion scores than CD28-based constructs.",
      "Identified 4 distinct cell state clusters during cellular expansion phase."
    ],
    entities: {
      genes: ["TOX", "PDCD1", "LAG3", "HAVCR2", "IL2", "IFNG"],
      molecules: ["Anti-CD19 CAR", "Interleukin-2"],
      organisms: ["Homo sapiens"]
    }
  },
  {
    id: "doc-5",
    title: "Standard Operating Procedure: Automated High-Throughput LC-MS Sample Preparation",
    type: "Protocol",
    category: "Analytical Chemistry",
    authors: "Analytical Core Facility",
    journal: "BioWeave SOP Catalog",
    date: "2026-02-20",
    status: "Processed",
    fileSize: "2.1 MB",
    pageCount: 8,
    doi: "SOP-ANA-2026-14",
    relevance: 81,
    tags: ["LC-MS", "Proteomics", "Automation", "Robotics"],
    snippet: "Protocol for liquid handling robot robotic extraction of peptide digests from plasma samples prior to Orbitrap LC-MS/MS run.",
    extractedText: `Scope: High-throughput plasma proteomics preparation utilizing Hamilton STAR liquid handler.

Protocol Summary:
1. Denaturation: 8 M Urea in 50 mM ammonium bicarbonate.
2. Reduction & Alkylation: DTT 10 mM (30 min at 56°C), iodoacetamide 20 mM (30 min in dark).
3. Trypsin Digestion: 1:50 enzyme-to-protein ratio at 37°C overnight.
4. C18 Solid Phase Extraction cleanup using 96-well filter plates.`,
    aiInsights: [
      "Hamilton automation reduces sample preparation coefficient of variation (CV) to <4.2%.",
      "Alkylation step must strictly avoid light exposure to prevent side-chain modifications.",
      "Yields >1,400 quantified plasma protein groups per 30-minute LC gradient."
    ],
    entities: {
      genes: ["ALB", "APOA1", "FBN1"],
      molecules: ["DTT", "Iodoacetamide", "Trypsin", "Formic Acid"],
      organisms: ["Homo sapiens"]
    }
  },
  {
    id: "doc-6",
    title: "Phase II Clinical Trial Data Summary: Small Molecule Inhibitor BW-409 in Solid Tumors",
    type: "Research Paper",
    category: "Oncology",
    authors: "Clinical Trials Steering Group",
    journal: "Journal of Clinical Oncology (2026)",
    date: "2026-03-02",
    status: "Pending",
    fileSize: "9.5 MB",
    pageCount: 36,
    doi: "10.1200/JCO.2026.44.112",
    relevance: 78,
    tags: ["Clinical Trial", "Small Molecule", "Oncology", "Phase II"],
    snippet: "Interim analysis of safety and efficacy for selective kinase inhibitor BW-409 in EGFR-mutant non-small cell lung carcinoma (NSCLC).",
    extractedText: `Background: BW-409 is a potent, irreversible covalent inhibitor targeting EGFR T790M and C797S mutations.

Study Design: Multicenter dose-escalation cohort (n=142). Primary endpoint: Objective Response Rate (ORR). Secondary endpoints: Progression-Free Survival (PFS) and safety profile.

Results: Confirmed ORR of 64.8% in T790M positive subjects. Grade 3 adverse events observed in 12% of patients, primarily manageable cutaneous rash.`,
    aiInsights: [
      "BW-409 demonstrates brain penetrance with 52% intracranial response rate.",
      "C797S mutation resistance overcome at daily dosage of 150 mg.",
      "Pending final validation from Central Pathology Lab."
    ],
    entities: {
      genes: ["EGFR", "KRAS", "BRAF"],
      molecules: ["BW-409 Inhibitor", "Osimertinib"],
      organisms: ["Homo sapiens"]
    }
  }
];

export const MOCK_STATS = {
  documentsCount: 1248,
  documentsGrowth: "+12% this month",
  protocolsCount: 342,
  protocolsGrowth: "48 active SOPs",
  labNotesCount: 589,
  labNotesGrowth: "+24 this week",
  publishedPapersCount: 317,
  publishedPapersGrowth: "14 high impact"
};

export const MOCK_RECENT_ACTIVITIES = [
  { id: "act-1", title: "LNP mRNA formulation synthesis parsed", time: "10 mins ago", type: "document" },
  { id: "act-2", title: "AI Assistant generated synthesis for Cas12a target", time: "1 hour ago", type: "ai" },
  { id: "act-3", title: "Thermal shift assay results uploaded by Dr. Lin", time: "3 hours ago", type: "upload" },
  { id: "act-4", title: "New knowledge search for 'CAR-T cell exhaustion'", time: "5 hours ago", type: "search" },
];

export const fetchDocuments = async () => {
  return MOCK_DOCUMENTS;
};

export const fetchDocumentById = async (id) => {
  return MOCK_DOCUMENTS.find(doc => doc.id === id || doc.id === `doc-${id}`) || MOCK_DOCUMENTS[0];
};

export const fetchStats = async () => {
  return MOCK_STATS;
};

export default api;
