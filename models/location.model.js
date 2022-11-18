const { Schema, model } = require('mongoose');

const locationSchema = new Schema(
  {
    location_name: {
      type: String,
      required: true,
      lowecase: true,
    },
    total_customers: {
      type: String,
      required: false,
      default: 0,
    },
    total_debt: {
      type: String,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new model('Location', locationSchema);
