const { Schema, model } = require('mongoose');

const invoiceSchema = new Schema(
  {
    meter_number: {
      type: String,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    required_amount: {
      type: String,
      required: true,
    },
    unit_consumed: {
      type: Number,
      required: true,
    },
    paid_amount: {
      type: String,
      required: true,
    },
    remain_amount: {
      type: String,
      required: true,
    },
    reading_day: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new model('Invoice', invoiceSchema);
