import mongoose, { Schema, Document } from 'mongoose';

export interface ISkuMaster extends Document {
  skuErpCode: string;
  name: string;
  eanCode?: string;
  hsnCode?: string;
  uom: string;
  agreedRate: number;
  mrp: number;
  priceTolerance: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkuMasterSchema: Schema = new Schema(
  {
    skuErpCode: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    eanCode: { type: String, trim: true, default: null },
    hsnCode: { type: String, trim: true, default: null },
    uom: { type: String, required: true, default: 'PKT' },
    agreedRate: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    priceTolerance: { type: Number, required: true, default: 0.05 },
  },
  { timestamps: true }
);

export const SkuMaster = mongoose.model<ISkuMaster>('SkuMaster', SkuMasterSchema);
