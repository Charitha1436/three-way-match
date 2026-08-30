import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditStep {
  step: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  message: string;
  at: Date;
}

export interface IMatchAudit extends Document {
  poNumber: string;
  documentType: 'PO' | 'GRN' | 'INVOICE';
  documentNumber?: string;
  steps: IAuditStep[];
  createdAt: Date;
}

const AuditStepSchema = new Schema(
  {
    step: { type: String, required: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'WARNING'], required: true },
    message: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const MatchAuditSchema: Schema = new Schema(
  {
    poNumber: { type: String, required: true, trim: true },
    documentType: { type: String, enum: ['PO', 'GRN', 'INVOICE'], required: true },
    documentNumber: { type: String },
    steps: [AuditStepSchema],
  },
  { timestamps: true }
);

export const MatchAudit = mongoose.model<IMatchAudit>('MatchAudit', MatchAuditSchema);
