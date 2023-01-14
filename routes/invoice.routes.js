const express = require('express');

const router = express.Router();

const invoiceController = require('../controllers/invoice.controller');

router.get('/', invoiceController.getAllInvoices);
router.post('/', invoiceController.createInvoice);
router.get('/:id', invoiceController.getSingleInvoice);
router.get('/statistics/:month', invoiceController.getUnitsStatistics);
router.put('/pay/:invoice_id', invoiceController.payInvoice);
router.put('/debt-pay/:invoice_id', invoiceController.payInvoiceDebt);

module.exports = router;
