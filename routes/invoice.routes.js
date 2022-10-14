const express = require('express');

const router = express.Router();

const {
  createInvoice,
  getAllInvoices,
  getSingleInvoice,
  updateInvoice,
  deleteInvoice,
  payInvoice,
} = require('../controllers/invoice.controller');

router.get('/', getAllInvoices);
router.get('/:id', getSingleInvoice);
router.post('/', createInvoice);
router.put('/', updateInvoice);
router.put('/pay/:invoice_id', payInvoice);
router.delete('/', deleteInvoice);

module.exports = router;
