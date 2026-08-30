import mongoose, { Schema, Document } from 'mongoose';

export interface IGrnItem {
  itemCode: string;
  description: string;
  receivedQuantity: number;
  mrp?: number;
  unitPrice?: number;
  skuMaster?: mongoose.Types.ObjectId | null;
}

export interface IGrn extends Document {
  grnNumber: string;
  poNumber: string;
  grnDate: string;
  filePath?: string;
  items: IGrnItem[];
  rawParsed: any;
  createdAt: Date;
}

const GrnItemSchema = new Schema(
  {
    itemCode: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    receivedQuantity: { type: Number, required: true, min: 0 },
    mrp: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    skuMaster: { type: Schema.Types.ObjectId, ref: 'SkuMaster', default: null },
  },
  { _id: false }
);

const GrnSchema: Schema = new Schema(
  {
    grnNumber: { type: String, required: true, trim: true },
    poNumber: { type: String, required: true, trim: true },
    grnDate: { type: String, required: true },
    filePath: { type: String },
    items: [GrnItemSchema],
    rawParsed: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

GrnSchema.index({ poNumber: 1, grnNumber: 1 });

export const Grn = mongoose.model<IGrn>('Grn', GrnSchema);
