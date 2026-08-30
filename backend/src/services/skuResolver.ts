import { SkuMaster } from '../models/SkuMaster';

export interface ExtractedItem {
  itemCode?: string;
  description?: string;
  quantity?: number;
  receivedQuantity?: number;
  unitPrice?: number;
  unitRate?: number;
  mrp?: number;
}

export async function resolveLineItems(items: ExtractedItem[]): Promise<any[]> {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  const allSkus = await SkuMaster.find({});

  return items.map((item) => {
    const rawCode = (item.itemCode || '').trim().toLowerCase();
    const rawDesc = (item.description || '').trim().toLowerCase();

    // 1. Exact or Case-insensitive match on itemCode
    let matchedSku = allSkus.find(
      (s) => s.itemCode && s.itemCode.trim().toLowerCase() === rawCode
    );

    // 2. Exact or Case-insensitive match on skuName / description
    if (!matchedSku && rawDesc) {
      matchedSku = allSkus.find(
        (s) =>
          (s.skuName && s.skuName.trim().toLowerCase() === rawDesc) ||
          (s.description && s.description.trim().toLowerCase() === rawDesc)
      );
    }

    // 3. Fallback partial substring match
    if (!matchedSku && rawDesc) {
      matchedSku = allSkus.find(
        (s) =>
          (s.skuName && rawDesc.includes(s.skuName.trim().toLowerCase())) ||
          (s.itemCode && rawDesc.includes(s.itemCode.trim().toLowerCase()))
      );
    }

    return {
      ...item,
      skuMaster: matchedSku ? matchedSku._id : null,
      resolvedSkuCode: matchedSku ? matchedSku.itemCode : item.itemCode || 'UNRESOLVED',
      isResolved: !!matchedSku,
    };
  });
}

export default resolveLineItems;