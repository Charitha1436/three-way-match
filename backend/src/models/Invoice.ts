import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  itemCode: string;
  description: string;
  quantity: number;
  unitRate: number;
  mrp?: number;
  skuMaster?: mongoose.Types.ObjectId | null;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  poNumber: string;
  invoiceDate: string;
  filePath?: string;
  items: IInvoiceItem[];
  rawParsed: any;
  createdAt: Date;
}

const InvoiceItemSchema = new Schema(
  {
    itemCode: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitRate: { type: Number, required: true, min: 0 },
    mrp: { type: Number, default: 0 },
    skuMaster: { type: Schema.Types.ObjectId, ref: 'SkuMaster', default: null },
  },
  { _id: false }
);

const InvoiceSchema: Schema = new Schema(
  {
    invoiceNumber: { type: String, required: true, trim: true },
    poNumber: { type: String, required: true, trim: true },
    invoiceDate: { type: String, required: true },
    filePath: { type: String },
    items: [InvoiceItemSchema],
    rawParsed: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

InvoiceSchema.index({ poNumber: 1, invoiceNumber: 1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
