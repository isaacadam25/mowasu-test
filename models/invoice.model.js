const { Schema, model } = require('mongoose');

const invoiceSchema = new Schema(
  {
    invoice_number: {
      type: String,
      required: true,
      default: null,
    },
    previous_count: {
      type: Number,
      required: true,
      default: 0,
    },
    current_count: {
      type: Number,
      required: true,
      default: 0,
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    day: {
      type: Number,
      required: true,
    },
    required_amount: {
      type: Number,
      required: true,
      default: 0,
    },
    debt: {
      type: Number,
      required: false,
      default: 0,
    },
    isComplete: {
      type: Boolean,
      required: false,
      default: 0,
    },
    receipt_number: {
      type: String,
      required: false,
      default: null,
    },
    paid_amount: {
      type: Number,
      required: false,
      default: 0,
    },
    balance: {
      type: Number,
      required: false,
      default: 0,
    },
    customer_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new model('Invoice', invoiceSchema);
