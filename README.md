# MediKiosk — AI-Powered Multimodal Clinical History-Taking & Document Digitization Platform for OPDs

**Smart India Hackathon 2026 — SIH26047: Patient Case-Taking Software**

> **Core Philosophy**: *"AI assists. Physician decides."*
> MediKiosk is strictly an **assistive clinical history-taking and document-digitization platform**. It does NOT provide autonomous medical diagnosis, treatment recommendations, or prescriptions. All AI-generated outputs are assistive drafts requiring physician review and verification prior to clinical use.

---

## 1. System Architecture

```text
                                 +-------------------------------------+
                                 |         Patient Kiosk UI            |
                                 |    (React 18 + TS + Tailwind CSS)   |
                                 +------------------+------------------+
                                                    |
                   +--------------------------------+--------------------------------+
                   |                                |                                |
       [Voice Mode / Touch Mode]         [Prescription / Doc OCR]          [Consent & ABHA Check]
                   |                                |                                |
                   v                                v                                v
     +-----------------------------------------------------------------------------------------+
     |                              Express.js REST API Layer                                 |
     |         /api/v1/sessions, /api/v1/conversation, /api/v1/ocr, /api/v1/summary...         |
     +------------------------------------------+----------------------------------------------+
                                                |
                 +------------------------------+-------------------------------+
                 |                                                              |
    [AI / Multimodal Providers]                                     [Storage & Cache Layer]
  - ASR Provider (Primary / Bhashini / Demo)                         - MongoDB (with In-Memory Fallback)
  - OCR Provider (Tesseract / Mock OCR)                              - Redis (with In-Memory Fallback)
  - LLM Provider (Gemini / Rule-Based Conservative Assist)
                 |
                 v
   +----------------------------+        +----------------------------+        +----------------------------+
   |  Physician Review Portal   | -----> |     FHIR / ABDM-Ready      | -----> |      AYUSH Dashavidha      |
   | (Edit, Verify, & Finalize) |        |    Interoperability View   |        |      Pariksha Intake       |
   +----------------------------+        +----------------------------+        +----------------------------+
```

---

## 2. Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router DOM v6, Lucide React icons
- **Backend**: Node.js, Express.js, TypeScript (`tsx` runtime)
- **Database**: MongoDB (via Mongoose) with automated in-memory repository fallback (zero crash guarantee)
- **Cache**: Redis (via `ioredis`) with automated in-memory cache fallback
- **File Uploads**: Multer with size limits and file-type validation
- **Interoperability**: HL7 FHIR R4 standard JSON Bundle generation (Patient, Encounter, Condition)
- **AYUSH Framework**: Ayurvedic Dashavidha Pariksha (10-fold assessment) + Trividha & Ashtavidha modules

---

## 3. Directory Structure

```text
C:\Medikiosk\
├── package.json               # Root monorepo orchestrator (concurrent dev runners)
├── .env                       # Active environment configuration (DEMO_MODE=true)
├── .env.example               # Environment variables specification
├── README.md                  # System documentation & Jury Demo script
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── config/            # env.ts, database.ts, redis.ts (with zero-crash fallbacks)
│       ├── controllers/       # session, conversation, asr, ocr, summary, physician, fhir, ayush
│       ├── models/            # Patient, Session, Conversation, Document, ClinicalHistory, AyushRecord
│       ├── repositories/      # MongoDB + InMemoryStore dual-mode persistence
│       ├── routes/            # REST API route handlers (/api/v1)
│       ├── seed/              # Demo dataset seeder (PAT-DEMO-1 / MK-DEMO-001)
│       ├── services/
│       │   ├── ai/            # LLMProvider, SummaryService
│       │   ├── asr/           # ASRProvider, DemoASR, PrimaryASR, BhashiniASR
│       │   ├── ayush/         # AyushService (Dashavidha Pariksha)
│       │   ├── cache/         # CacheService (Redis + Memory)
│       │   ├── fhir/          # FHIRService (HL7 FHIR R4 Bundle)
│       │   └── ocr/           # OCRProvider, MockOCR
│       └── server.ts          # Express application entrypoint
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── api/               # Typed client services (Axios)
        ├── components/        # Layout, DoctorLayout, Badge, Button, Card, WarningBanner, DemoBadge
        ├── pages/             # All 11 Kiosk, Doctor, Interoperability, and AYUSH views
        └── App.tsx            # Application router & DemoContext provider
```

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js v18+ (tested on Node.js v24)
- npm v9+

### Quick Start (Both Backend & Frontend)
From the root directory (`C:\Medikiosk`):
```bash
# 1. Install root, backend, and frontend dependencies
npm run install:all

# 2. Start both backend and frontend concurrently
npm run dev
```

The frontend will run at: **`http://localhost:5173`**  
The backend API will run at: **`http://localhost:5000/api/v1`**

### Running Components Individually
**Backend:**
```bash
cd C:\Medikiosk\backend
npm install
npm run dev
```

**Frontend:**
```bash
cd C:\Medikiosk\frontend
npm install
npm run dev
```

---

## 5. Environment Variables (`.env`)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | Backend API port |
| `NODE_ENV` | `development` | Runtime environment |
| `MONGODB_URI` | `mongodb://localhost:27017/medikiosk` | MongoDB connection string (falls back to In-Memory if offline) |
| `REDIS_URL` | `redis://localhost:6379` | Redis cache connection string (falls back to In-Memory if offline) |
| `DEMO_MODE` | `true` | Enables deterministic, offline-ready jury demo data |
| `AI_PROVIDER` | `gemini` | LLM provider for live mode |
| `AI_API_KEY` | *(empty)* | Optional API key for live LLM mode |
| `ASR_PROVIDER` | `webspeech` | Primary ASR provider |
| `BHASHINI_API_KEY`| *(empty)* | Bhashini fallback credentials |
| `OCR_PROVIDER` | `tesseract` | OCR provider for live document parsing |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |

---

## 6. Zero-Crash Fallback Architecture

MediKiosk is engineered so a jury demonstration will **never freeze or fail**, even if external databases or APIs are unavailable on the evaluator's machine:
1. **MongoDB Offline?** Automatically activates `InMemoryStore` for Patients, Sessions, and Clinical Records.
2. **Redis Offline?** Automatically activates `InMemoryCache` with TTL support.
3. **External ASR/OCR Offline?** When `DEMO_MODE=true`, provides simulated Hindi/Hinglish speech interactions and prescription document extraction with confidence scores.
4. **Voice Failure at Kiosk?** Patients can seamlessly switch to **Touch Mode** at any moment.

---

## 7. 5–10 Minute Jury Demonstration Script

Follow this exact sequence during the live presentation:

1. **00:00 — Welcome Screen (`/`)**:
   - Introduce MediKiosk: *"MediKiosk is a pre-consultation assistive platform that captures multimodal clinical history and digitizes paper documents before the doctor consultation."*
   - Click **Start Patient Session**.

2. **00:30 — Consent Screen (`/patient/consent`)**:
   - Highlight the accessible consent notice designed for elderly and low-literacy patients.
   - Check **"I understand and give my consent"** (timestamp is recorded) and click **Give Consent & Continue**.

3. **01:00 — Language Selection (`/patient/language`)**:
   - Show multilingual support (English, Hindi, Hinglish).
   - Point out the pluggable ASR provider architecture with Bhashini fallback support.
   - Select **हिन्दी (Hindi)**.

4. **01:15 — Patient Intake & ABHA Flow (`/patient/start`)**:
   - Demonstrate the **ABHA-less flow**: *"What if the patient does not have an ABHA ID?"*
   - Select **Continue without ABHA**; enter Name ("Demo Patient"), Age (42), Gender (Male). A temporary session ID (`MK-2026-XXXXXX`) is generated for later reconciliation.

5. **02:00 — Multimodal Voice History Mode (`/patient/history`)**:
   - Click the circular microphone button to simulate real conversational interaction:
     - AI: *"Namaste. Aapko sabse zyada kis problem ki wajah se doctor se milna hai?"*
     - Patient: *"Mujhe pichhle teen din se bukhar hai."*
     - AI: *"Bukhar kab se hai?"*
     - Patient: *"Teen din se."*
   - Click **Touch Mode** tab to show the tile-based alternative for low-literacy patients.
   - Click **Finish & Continue**.

6. **03:00 — Document Upload & OCR (`/patient/documents`)**:
   - Upload or drag a sample prescription image.
   - Show OCR scanning with confidence score (85%), extracted medication fields, raw text, and the prominent disclaimer: *"OCR output may contain errors. Please verify against original document."*
   - Click **Continue**.

7. **03:45 — Patient Review (`/patient/review`)**:
   - Show pre-consultation summary card.
   - Click **Submit for Doctor Review**. Kiosk confirms submission with Session ID.

8. **04:15 — Physician Dashboard (`/doctor/dashboard`)**:
   - Switch to Doctor Portal view.
   - Show the OPD Queue displaying `MK-DEMO-001` with status **Pending Review**.
   - Click **Review**.

9. **05:00 — Clinical Review & Verification (`/doctor/review/MK-DEMO-001`)**:
   - Point out the warning banner: *"AI-assisted draft — Physician verification required before clinical use."*
   - Note the **AI Generated (Draft)** badges on chief complaints, duration, and medications.
   - Hover over a field, click the **Pencil icon**, edit the value (e.g., change duration to "4 Days"), and save. Badge updates to **Physician Modified**.
   - Click **Approve & Finalize**. Badges transition to **Physician Verified (Approved)**.

10. **06:00 — Interoperability & FHIR View (`/interoperability/MK-DEMO-001`)**:
    - Show the HL7 FHIR R4 Bundle generator with Patient, Encounter, and Condition resources.
    - Highlight the **Mock HIS Adapter** label (honest prototype representation).

11. **07:00 — AYUSH Dashavidha Mode (`/ayush`)**:
    - Demonstrate the 10-fold Ayurvedic assessment framework (Prakriti, Vikriti, Sara, Samhanana, etc.) alongside Trividha and Ashtavidha Pariksha.

12. **07:45 — Conclusion**:
    - Reiterate the core principle: **"AI assists. Physician decides."**

---

---

## 8. Feature Status Matrix (Truthful Engineering Disclosure)

To maintain absolute academic and professional integrity during SIH 2026 evaluations, all capabilities are explicitly categorized:

| Feature Area | Status | Implementation Details |
|---|---|---|
| **Patient Case-Taking Kiosk** | **Implemented** | Touch-first responsive interface with dual input modes (Speech + Touch tiles), multilingual UI (Hindi/English/Hinglish), and mandatory consent gate. |
| **Assistive History Drafting** | **Implemented** | Conservative LLM summarization (Gemini API with safety rules & offline conservative rule-based fallback). Outputs tagged with clear assistive provenance. |
| **Physician Review & Audit Trail** | **Implemented** | Complete web portal for OPD doctors: inline editing, change provenance tracking (`physicianEdits`), approval workflow, and status lifecycle. |
| **Document OCR Engine** | **Implemented** | Provider architecture (`OCRProvider`) with single-source confidence reporting (78%), document-mention attribution, and physical verification notices. |
| **FHIR R4 Bundle Generation** | **Implemented** | Standard HL7 FHIR R4 JSON bundles (Patient, Encounter, Condition, DocumentReference) reflecting verified physician edits. |
| **AYUSH Dashavidha Pariksha** | **Implemented** | Complete 10-fold Ayurvedic clinical intake schema with dedicated storage and UI. |
| **Resilient Fallback Layer** | **Implemented** | Dual-mode repositories (MongoDB / InMemoryStore) and cache (Redis / InMemoryCache) ensuring smooth demonstration without service dependencies. |
| **Mock HIS Adapter** | **Demo-Only** | Simulated ABDM/HIS adapter for demonstration. Connects to internal mock sink rather than live production hospital EHR. |
| **Bhashini ASR Integration** | **Integration-Ready** | Interface and fallback cascade implemented in `services/asr/ASRProvider.ts`. Activates automatically when `BHASHINI_API_KEY` is provided. |
| **Live ABHA Sandbox Gateway** | **Integration-Ready** | Supports manual ABHA input & auto-generated temporary patient IDs. Production NHA M1/M2/M3 OAuth exchange requires government sandbox whitelisting. |
| **Autonomous Medical Diagnosis** | **Not Implemented** | **Intentionally Excluded By Design**. MediKiosk strictly follows the clinical principle: *"AI assists. Physician decides."* |

---

## 9. Truthful Prototype Disclosure & Known Limitations

- **Assistive Scope**: MediKiosk does NOT provide clinical diagnoses or drug prescriptions.
- **Interoperability**: FHIR R4 Bundles are generated strictly adhering to HL7 FHIR R4 structure; integration is marked as **Mock HIS Adapter** to truthfully reflect prototype sandbox status.
- **OCR Accuracy**: OCR is assistive (confidence: 78%); physical prescription verification by the physician remains mandatory.
- **ABHA Creation**: Live ABHA creation via OTP/Aadhaar requires government sandbox whitelisting; prototype seamlessly supports ABHA input and temporary session IDs (`MK-2026-XXXXXX`).
