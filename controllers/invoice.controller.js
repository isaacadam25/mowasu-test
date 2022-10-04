const Invoice = require('../models/invoice.model');
// TODO: when user creates invoice must send text message
const createInvoice = async (req, res) => {
  return res.status(200).json({
    success: 1,
    data: 'Invoice created',
  });
};

const getAllInvoices = async (req, res) => {
  return res.status(200).json({
    success: 1,
    data: 'Customer created',
  });
};

const getSingleInvoice = async (req, res) => {
  return res.status(200).json({
    success: 1,
    data: 'Invoice created',
  });
};

const updateInvoice = async (req, res) => {
  return res.status(200).json({
    success: 1,
    data: 'Invoice created',
  });
};

const deleteInvoice = async (req, res) => {
  return res.status(200).json({
    success: 1,
    data: 'Invoice created',
  });
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getSingleInvoice,
  updateInvoice,
  deleteInvoice,
};
