const express = require('express');

const router = express.Router();

const {
  createInvoice,
  getAllInvoices,
  getSingleInvoice,
  payInvoiceDebt,
  deleteInvoice,
  payInvoice,
} = require('../controllers/invoice.controller');

router.get('/', getAllInvoices);
router.get('/:id', getSingleInvoice);
router.post('/', createInvoice);
router.put('/pay/:invoice_id', payInvoice);
router.put('/debt-pay/:invoice_id', payInvoiceDebt);
router.delete('/', deleteInvoice);

module.exports = router;
