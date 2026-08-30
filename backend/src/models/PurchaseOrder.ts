import mongoose, { Schema, Document } from 'mongoose';

export interface IPOItem {
  itemCode: string;
  description: string;
  quantity: number;
  unitPrice?: number;
  mrp?: number;
  skuMaster?: mongoose.Types.ObjectId | null;
}

export interface IPurchaseOrder extends Document {
  poNumber: string;
  poDate: string;
  vendorName: string;
  filePath?: string;
  items: IPOItem[];
  rawParsed: any;
  createdAt: Date;
}

const POItemSchema = new Schema(
  {
    itemCode: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    skuMaster: { type: Schema.Types.ObjectId, ref: 'SkuMaster', default: null },
  },
  { _id: false }
);

const PurchaseOrderSchema: Schema = new Schema(
  {
    poNumber: { type: String, required: true, trim: true },
    poDate: { type: String, required: true },
    vendorName: { type: String, required: true },
    filePath: { type: String },
    items: [POItemSchema],
    rawParsed: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

PurchaseOrderSchema.index({ poNumber: 1 });

export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
