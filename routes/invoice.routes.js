const express = require('express');

const router = express.Router();

const {
  createInvoice,
  getAllInvoices,
  getSingleInvoice,
  updateInvoice,
  deleteInvoice,
} = require('../controllers/invoice.controller');

router.get('/', getAllInvoices);
router.get('/:id', getSingleInvoice);
router.post('/', createInvoice);
router.put('/', updateInvoice);
router.delete('/', deleteInvoice);

module.exports = router;
