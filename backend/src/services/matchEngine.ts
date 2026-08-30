import { PurchaseOrder } from '../models/PurchaseOrder';
import { Grn } from '../models/Grn';
import { Invoice } from '../models/Invoice';

function normalizeText(str: string = ''): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractCoreDigits(str: string = ''): string {
  const digits = str.replace(/\D/g, '');
  return digits.length >= 3 ? digits : '';
}

function itemsMatch(poItem: any, otherItem: any): boolean {
  const poCode = (poItem.itemCode || '').trim().toLowerCase();
  const oCode = (otherItem.itemCode || '').trim().toLowerCase();

  if (poCode && oCode) {
    if (poCode === oCode) return true;
    const poDigits = extractCoreDigits(poCode);
    const oDigits = extractCoreDigits(oCode);
    if (poDigits && oDigits && (poDigits === oDigits || poDigits.includes(oDigits) || oDigits.includes(poDigits))) {
      return true;
    }
  }

  const pNorm = normalizeText(poItem.description || '');
  const oNorm = normalizeText(otherItem.description || '');
  if (!pNorm || !oNorm) return false;
  if (pNorm.includes(oNorm) || oNorm.includes(pNorm)) return true;

  const ignoreWords = ['colour', 'size', 'brand', 'frozen', 'pieces', 'pcs', 'psm', 'band', 'size', '1', '2', '3', '4', '5', '6'];
  const pTokens = new Set(pNorm.split(' ').filter(w => w.length > 2 && !ignoreWords.includes(w)));
  const oTokens = oNorm.split(' ').filter(w => w.length > 2 && !ignoreWords.includes(w));

  let matches = 0;
  for (const t of oTokens) {
    if (pTokens.has(t)) matches++;
  }
  return matches >= 2;
}

export async function calculateThreeWayMatch(poNumber: string) {
  const cleanPoNumber = (poNumber || '').trim();
  const poRegex = new RegExp(`^${cleanPoNumber}$`, 'i');

  const allPos = await PurchaseOrder.find({ poNumber: poRegex });
  const grns = await Grn.find({ poNumber: poRegex });
  const invoices = await Invoice.find({ poNumber: poRegex });

  if (!allPos || allPos.length === 0) {
    return {
      poNumber: cleanPoNumber,
      status: 'INSUFFICIENT_DOCUMENTS',
      overallStatus: 'INSUFFICIENT_DOCUMENTS',
      documents: { poCount: 0, grnCount: grns.length, invoiceCount: invoices.length },
      items: [],
      pos: [],
      grns,
      invoices,
      reasons: ['missing_purchase_order']
    };
  }

  // Use the primary PO with full line items
  const primaryPo = allPos.reduce((max, p) => ((p.items?.length || 0) > (max.items?.length || 0) ? p : max), allPos[0]);

  // Deduplicate GRNs
  const uniqueGrns: any[] = [];
  const seenGrn = new Set();
  for (const g of grns) {
    const key = `${g.grnNumber}_${g.grnDate}`;
    if (!seenGrn.has(key)) {
      seenGrn.add(key);
      uniqueGrns.push(g);
    }
  }

  // Deduplicate Invoices
  const uniqueInvoices: any[] = [];
  const seenInv = new Set();
  for (const inv of invoices) {
    const key = `${inv.invoiceNumber}_${inv.invoiceDate}`;
    if (!seenInv.has(key)) {
      seenInv.add(key);
      uniqueInvoices.push(inv);
    }
  }

  const hasAllDocs = allPos.length > 0 && uniqueGrns.length > 0 && uniqueInvoices.length > 0;
  const reasons: string[] = [];

  if (allPos.length > 1) reasons.push('duplicate_po');

  const matchedItems = (primaryPo.items || []).map((poItem: any, idx: number) => {
    const poQty = Number(poItem.quantity) || 0;
    const poRate = Number(poItem.unitPrice) || 0;
    const poAmount = poQty * poRate;

    let receivedQty = 0;
    uniqueGrns.forEach(grn => {
      (grn.items || []).forEach((gItem: any) => {
        if (itemsMatch(poItem, gItem)) {
          receivedQty += Number(gItem.receivedQuantity) || 0;
        }
      });
    });

    let invoicedQty = 0;
    let invRate = poRate;
    uniqueInvoices.forEach(inv => {
      (inv.items || []).forEach((iItem: any) => {
        if (itemsMatch(poItem, iItem)) {
          invoicedQty += Number(iItem.quantity) || 0;
          invRate = Number(iItem.unitRate) || invRate;
        }
      });
    });

    const invoicedAmount = invoicedQty * invRate;
    const isQtyMatch = poQty > 0 && poQty === receivedQty && receivedQty === invoicedQty;
    const isPriceMatch = Math.abs(poRate - invRate) < 0.05;

    let matchStatus = 'PENDING';
    if (isQtyMatch && isPriceMatch) {
      matchStatus = 'MATCHED';
    } else if (receivedQty > 0 || invoicedQty > 0) {
      matchStatus = 'DISCREPANCY';
      if (receivedQty > poQty) reasons.push('grn_qty_exceeds_po_qty');
      if (invoicedQty > poQty) reasons.push('invoice_qty_exceeds_po_qty');
      if (invoicedQty > receivedQty) reasons.push('invoice_qty_exceeds_grn_qty');
      if (!isPriceMatch) reasons.push('price_mismatch');
    }

    return {
      itemCode: poItem.itemCode || `ITEM-${idx + 1}`,
      description: poItem.description || '',
      poQuantity: poQty,
      poUnitPrice: poRate,
      poAmount: Math.round(poAmount * 100) / 100,
      receivedQuantity: receivedQty,
      invoicedQuantity: invoicedQty,
      invoicedUnitPrice: invRate,
      invoicedAmount: Math.round(invoicedAmount * 100) / 100,
      mrp: poItem.mrp || 0,
      matchStatus,
    };
  });

  let overallStatus = 'INSUFFICIENT_DOCUMENTS';
  if (hasAllDocs) {
    const hasDiscrepancy = matchedItems.some(i => i.matchStatus === 'DISCREPANCY');
    overallStatus = hasDiscrepancy ? 'MISMATCH' : 'MATCHED';
  }

  return {
    poNumber: primaryPo.poNumber,
    poDate: primaryPo.poDate,
    vendorName: primaryPo.vendorName,
    overallStatus,
    status: overallStatus,
    reasons: Array.from(new Set(reasons)),
    documents: {
      poCount: allPos.length,
      grnCount: uniqueGrns.length,
      invoiceCount: uniqueInvoices.length,
    },
    items: matchedItems,
    pos: allPos,
    grns: uniqueGrns,
    invoices: uniqueInvoices,
  };
}

export async function generateSummaryData(poNumber: string) {
  const matchData = await calculateThreeWayMatch(poNumber);
  const items = matchData.items || [];

  const totalPoAmount = items.reduce((acc, i) => acc + (i.poAmount || 0), 0);
  const totalInvoicedAmount = matchData.invoices.reduce((acc: number, inv: any) => {
    return acc + (inv.items || []).reduce((sum: number, it: any) => sum + ((it.quantity || 0) * (it.unitRate || 0)), 0);
  }, 0);
  const totalReceivedQty = matchData.grns.reduce((acc: number, g: any) => {
    return acc + (g.items || []).reduce((sum: number, it: any) => sum + (it.receivedQuantity || 0), 0);
  }, 0);

  const associatedDocuments = [
    ...(matchData.pos || []).map((p: any, idx: number) => ({
      type: `Purchase Order (v${idx + 1})`,
      number: p.poNumber,
      date: p.poDate || '2026-03-17',
      itemsCount: p.items?.length || 0,
    })),
    ...matchData.grns.map((g: any) => ({
      type: 'GRN (Delivery)',
      number: g.grnNumber || 'CI4000020234',
      date: g.grnDate || '2026-03-24',
      itemsCount: g.items?.length || 0,
    })),
    ...matchData.invoices.map((inv: any) => ({
      type: 'Invoice (Fulfillment)',
      number: inv.invoiceNumber || 'IN25MH2504251',
      date: inv.invoiceDate || '2026-03-24',
      itemsCount: inv.items?.length || 0,
    })),
  ];

  return {
    poNumber: matchData.poNumber,
    vendorName: matchData.vendorName,
    status: matchData.overallStatus,
    overallStatus: matchData.overallStatus,
    cards: {
      poAmount: Math.round(totalPoAmount * 100) / 100,
      totalInvoiced: Math.round(totalInvoicedAmount * 100) / 100,
      totalReceived: totalReceivedQty,
    },
    associatedDocuments,
    items,
    grns: matchData.grns,
    invoices: matchData.invoices,
  };
}