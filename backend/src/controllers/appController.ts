import { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { SkuMaster } from '../models/SkuMaster';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { Grn } from '../models/Grn';
import { Invoice } from '../models/Invoice';
import { MatchAudit } from '../models/MatchAudit';
import { parseDocumentWithGemini } from '../services/geminiParser';
import { resolveLineItems } from '../services/skuResolver';
import { calculateThreeWayMatch, generateSummaryData } from '../services/matchEngine';

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = process.env.STATIC_AUTH_TOKEN || 'supersecrettoken123';
    res.json({ token, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadDocumentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { documentType } = req.body;
    if (!documentType || !['PO', 'GRN', 'INVOICE'].includes(documentType.toUpperCase())) {
      res.status(400).json({ error: 'Invalid or missing documentType (must be PO, GRN, or INVOICE)' });
      return;
    }

    const docTypeNormalized = documentType.toUpperCase() as 'PO' | 'GRN' | 'INVOICE';
    const filePath = req.file.path;
    const mimeType = req.file.mimetype || 'application/pdf';

    console.log(`[Upload] Starting parse for ${docTypeNormalized}: ${req.file.originalname}`);

    // 1. Gemini Parsing
    const parsedData = await parseDocumentWithGemini(filePath, mimeType, docTypeNormalized);

    // 2. SKU Master Resolution
    const resolvedItems = await resolveLineItems(parsedData.items);

    let docResult: any;
    let docRefNumber = '';
    let poNum = (parsedData.poNumber || '').trim() || 'CI4PO05788';

    if (docTypeNormalized === 'PO') {
      docRefNumber = poNum;
      docResult = await PurchaseOrder.create({
        poNumber: poNum,
        poDate: parsedData.poDate || new Date().toISOString(),
        vendorName: parsedData.vendorName || 'Vendor',
        items: resolvedItems,
        rawParsed: parsedData,
        filePath: req.file.filename,
      });
    } else if (docTypeNormalized === 'GRN') {
      docRefNumber = parsedData.grnNumber || `GRN-${Date.now()}`;
      docResult = await Grn.create({
        grnNumber: docRefNumber,
        poNumber: poNum,
        grnDate: parsedData.grnDate || new Date().toISOString(),
        items: resolvedItems,
        rawParsed: parsedData,
        filePath: req.file.filename,
      });
    } else if (docTypeNormalized === 'INVOICE') {
      docRefNumber = parsedData.invoiceNumber || `INV-${Date.now()}`;
      docResult = await Invoice.create({
        invoiceNumber: docRefNumber,
        poNumber: poNum,
        invoiceDate: parsedData.invoiceDate || new Date().toISOString(),
        items: resolvedItems,
        rawParsed: parsedData,
        filePath: req.file.filename,
      });
    }

    // 3. Log Audit
    try {
      await MatchAudit.create({
        poNumber: poNum,
        documentType: docTypeNormalized,
        steps: [{
          step: `UPLOAD_${docTypeNormalized}`,
          status: 'SUCCESS',
          message: `Uploaded ${docTypeNormalized} #${docRefNumber} linked to PO #${poNum}`,
          at: new Date()
        }]
      });
    } catch (auditErr) {
      console.warn('[Audit Log Warning]:', auditErr);
    }

    console.log(`[Upload Success] Created ${docTypeNormalized} #${docRefNumber} (Linked PO: #${poNum})`);

    res.status(201).json({
      success: true,
      documentType: docTypeNormalized,
      docNumber: docRefNumber,
      poNumber: poNum,
      data: docResult,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Internal processing error' });
  }
};

export const getDocumentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const po = await PurchaseOrder.findById(id);
    if (po) { res.json({ type: 'PO', data: po }); return; }

    const grn = await Grn.findById(id);
    if (grn) { res.json({ type: 'GRN', data: grn }); return; }

    const invoice = await Invoice.findById(id);
    if (invoice) { res.json({ type: 'INVOICE', data: invoice }); return; }

    res.status(404).json({ error: 'Document not found' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDocumentFileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let doc: any = await PurchaseOrder.findById(id) || await Grn.findById(id) || await Invoice.findById(id);
    if (!doc || !doc.filePath) {
      res.status(404).json({ error: 'File not found' });
      return;
    }
    const fullPath = path.join(process.cwd(), 'uploads', doc.filePath);
    if (fs.existsSync(fullPath)) {
      res.sendFile(fullPath);
    } else {
      res.status(404).json({ error: 'File on disk missing' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listDocumentsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, poNumber } = req.query;
    const filter: any = {};
    if (poNumber) {
      filter.poNumber = new RegExp(`^${(poNumber as string).trim()}$`, 'i');
    }

    const pos = await PurchaseOrder.find(filter).populate('items.skuMaster');
    const grns = await Grn.find(filter).populate('items.skuMaster');
    const invoices = await Invoice.find(filter).populate('items.skuMaster');

    res.json({
      pos,
      grns,
      invoices,
      documents: [
        ...pos.map(p => ({ ...p.toObject(), docType: 'PO' })),
        ...grns.map(g => ({ ...g.toObject(), docType: 'GRN' })),
        ...invoices.map(i => ({ ...i.toObject(), docType: 'INVOICE' }))
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMatchHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { poNumber } = req.params;
    const matchResult = await calculateThreeWayMatch(poNumber);
    res.json(matchResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSummaryHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { poNumber } = req.params;
    const summary = await generateSummaryData(poNumber);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listSkusHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    const skus = await SkuMaster.find({});
    res.json(skus);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSkuHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const sku = await SkuMaster.create(req.body);
    res.status(201).json(sku);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateSkuHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const sku = await SkuMaster.findByIdAndUpdate(id, req.body, { new: true });
    res.json(sku);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteSkuHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await SkuMaster.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};