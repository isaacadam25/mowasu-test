const { Schema, model } = require('mongoose');

const transactionSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
    invoice: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Invoice',
    },
    amount: {
      type: Number,
      required: true,
    },
    receipt_number: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new model('Transaction', transactionSchema);
