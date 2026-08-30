# Enterprise 3-Way Match Reconciliation Engine

An automated 3-Way Matching system for enterprise procurement reconciliation. The engine reconciles **Purchase Orders (PO)**, **Goods Receipt Notes (GRN)**, and **Invoices (Fulfillment)**, resolves line items against a central **SKU Master Catalogue**, detects unit rate and quantity variances across multiple delivery challans, and surfaces results via an ERP-style dashboard.

---

## 📸 UI & Output Deliverables

All sample outputs and UI screenshots are documented below and preserved in the repository:

### 1. Summary Dashboard & 3-Way Reconciliation Grid
Three metric summary cards, multi-version document ledger, and line-item reconciliation table with status badges:
![Summary Dashboard](./screenshots/summary_view.png)
![Reconciliation Grid](./screenshots/reconciliation_grid.png)

### 2. Purchase Order Detail Split View
Dual-column split layout with left-hand metadata card and right-hand document preview canvas:
![Purchase Order View](./screenshots/po_view.png)

### 3. SKU Master Catalog Management
CRUD interface for mapping ERP item codes, EAN barcodes, and contract rates:
![SKU Master View](./screenshots/sku_master_view.png)

### 4. Reconciliation Audit Trail
Immutable audit trail tracking document events, parse counts, and validation checks:
![Audit Trail View](./screenshots/audit_trail_view.png)

---

## 🛠️ Architecture & Technology Stack

```
three-way-match/
├── backend/                  # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── controllers/      # Route controllers (upload, match, summary, sku)
│   │   ├── models/           # Mongoose schemas (PO, GRN, Invoice, SkuMaster, Audit)
│   │   ├── routes/           # REST API endpoints
│   │   ├── services/         # Gemini parsing engine & 3-way matching algorithms
│   │   └── index.ts          # Express server entry point & in-memory fallback
│   ├── uploads/              # Local disk storage for uploaded PDFs/images
│   └── .cache_parsed/        # SHA-256 hash extraction cache
│
├── frontend/                 # Next.js 15+ (App Router) + Tailwind CSS
│   ├── src/
│   │   ├── app/              # App routing & main dashboard shell
│   │   ├── components/
│   │   │   ├── reconciliation/ # Summary, DocumentDetailView, ItemGrid, AuditTrail
│   │   │   ├── masters/      # SKU Master catalog CRUD interface
│   │   │   └── modals/       # Multipart file upload modal
│   │   └── lib/              # Axios client instance
│
├── screenshots/              # UI verification screenshots
└── outputs/                  # Exported API JSON samples (Match, Summary, Parsed)
```

### Stack Components
- **Backend:** Node.js, Express, TypeScript, Mongoose.
- **Database:** MongoDB with dual compatibility (MongoDB Atlas cloud connection with automatic failover to embedded `MongoMemoryServer` for local offline evaluation).
- **AI Extraction:** Gemini API (`gemini-1.5-flash`) with structured schema output and SHA-256 buffer hash caching.
- **Frontend:** Next.js (App Router), Tailwind CSS, Lucide React, TanStack Query (`@tanstack/react-query`).

#### TanStack Query Rationale
TanStack Query was chosen as the frontend state management solution because the backend functions as the source of truth for reconciliation computations. TanStack Query handles cache invalidation on upload, query deduping, and background updates, while component state (tab switching, modal toggles, document zoom) remains scoped to React hooks.

---

## ⚙️ Local Setup & Run Guide

### Prerequisites
- Node.js (v18.x or v20.x+)
- npm

### 1. Configure Environment Files

**`backend/.env`**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/three-way-match
GEMINI_API_KEY=your_gemini_api_key_here
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Start the Backend
```powershell
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`.*

### 3. Start the Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 🧠 Core Engineering & Business Logic

### 1. Document Parsing & Caching Pipeline
- Files (PDF or images) are uploaded via multipart form data.
- A **SHA-256 checksum** is calculated on the raw buffer before dispatching to the Gemini API.
- If a hash match exists in `.cache_parsed/`, the cached JSON is returned immediately to eliminate redundant API calls.
- Returned JSON is validated against strict Zod schemas (`POExtractionSchema`, `GRNExtractionSchema`, `InvoiceExtractionSchema`).

### 2. Master SKU Resolution & Item Matching Rationale
- **Resolution Strategy:** Matches line items across documents using normalized ERP codes, digit extraction, and description tokens.
- **Unmapped SKU Policy:** If an item cannot be mapped against the SKU Master catalogue, it is **never silently dropped**. It remains visible in the reconciliation table and is flagged as `unmapped_master_sku` (triggering a soft variance warning) to ensure procurement visibility.

### 3. Out-of-Order Document Ingestion
Documents are keyed and linked by the string identifier `poNumber` (e.g. `CI4PO05788`) rather than strict relational foreign keys. Invoices or GRNs can arrive before the PO exists. The matching engine derives state dynamically on every read request from whichever documents currently exist in the database.

### 4. Multi-Delivery & Version Deduplication
- **Multiple POs:** Stored and tagged with version markers (`v1`, `v2`, `v3`) while flagging `duplicate_po`.
- **Split Shipments (GRNs / Invoices):** GRNs and Invoices are deduplicated using compound keys (`grnNumber_grnDate` and `invoiceNumber_invoiceDate`). Delivery quantities are aggregated across partial deliveries while preserving sub-document selector pills in the UI.

---

## 📊 Matching Rules & Status Resolution

| Reason Code | Trigger Rule | Impact |
| :--- | :--- | :--- |
| `grn_qty_exceeds_po_qty` | Received GRN quantity exceeds PO authorized quantity | Hard Discrepancy |
| `invoice_qty_exceeds_grn_qty` | Invoiced quantity exceeds physical received GRN quantity | Hard Discrepancy |
| `invoice_qty_exceeds_po_qty` | Invoiced quantity exceeds PO ordered quantity | Hard Discrepancy |
| `price_mismatch` | Invoiced unit rate differs from PO/agreed rate (>5% tolerance) | Discrepancy / Warning |
| `duplicate_po` | Multiple PO versions detected for same `poNumber` | Soft Warning |
| `unmapped_master_sku` | Line item unresolved against SKU Master | Soft Warning |

### Overall PO Status States:
- **`INSUFFICIENT_DOCUMENTS`**: Full set of PO, GRN, and Invoice is incomplete.
- **`MISMATCH`**: Hard violations or price/quantity discrepancies exist across documents.
- **`PARTIALLY_MATCHED`**: Quantities reconcile but soft warnings (e.g. slight price variances or unmapped master codes) are present.
- **`MATCHED`**: Fully reconciled with zero discrepancies across all 3 documents.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Mock authentication endpoint returning static Bearer token |
| `POST` | `/api/documents/upload` | Multipart file upload and automatic parser trigger |
| `GET` | `/api/match/:poNumber` | Recomputes 3-way match, discrepancies, item totals, and SKU status |
| `GET` | `/api/summary/:poNumber` | Computes metric card values and associated document ledger |
| `GET` | `/api/masters/sku` | Lists SKU Master catalogue |
| `POST` | `/api/masters/sku` | Creates a new SKU Master record |
| `DELETE`| `/api/masters/sku/:id` | Deletes a record from the SKU Master catalogue |

---

## 🤖 AI Disclosure & Engineering Notes
- **Gemini API:** Used for unstructured text extraction from PDFs/images into JSON schemas.
- **AI Coding Assistant:** Used as a pair-programmer for boilerplate generation and interface scaffolding. All matching rules, deduplication pipelines, and currency aggregations were verified independently.

---

## ⚖️ Tradeoffs & Assumptions
1. **Unit of Measure (UOM):** Standard comparable units across documents are assumed (UOM conversion logic omitted).
2. **Local Storage:** Raw uploaded documents are stored on local disk under `backend/uploads/` rather than cloud object storage.
