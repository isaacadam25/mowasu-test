const { Schema, model } = require('mongoose');

const invoiceSchema = new Schema(
  {
    meter_number: {
      type: String,
      required: true,
    },
    receipt_number: {
      type: String,
      required: false,
      default: null,
    },
    isComplete: {
      type: Boolean,
      required: false,
      default: 0,
    },
    phone_number: {
      type: String,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    required_amount: {
      type: Number,
      required: true,
    },
    unit_consumed: {
      type: Number,
      required: true,
    },
    paid_amount: {
      type: Number,
      required: false,
      default: 0,
    },
    debt: {
      type: Number,
      required: true,
      default: 0,
    },
    reading_day: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new model('Invoice', invoiceSchema);
