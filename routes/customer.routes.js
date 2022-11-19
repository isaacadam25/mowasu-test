const express = require('express');

const router = express.Router();

const customerController = require('../controllers/customer.controller');

router.get('/', customerController.getAllCustomers);
router.get('/invoiced', customerController.getInvoicedCustomers);
router.get('/un-invoiced', customerController.getUnInvoicedCustomers);
router.get('/:id', customerController.getSingleCustomer);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
