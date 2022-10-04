const express = require('express');

const router = express.Router();

const {
  createCustomer,
  getAllCustomers,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customer.controller');

router.get('/', getAllCustomers);
router.get('/:id', getSingleCustomer);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;
