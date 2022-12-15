const express = require('express');

const router = express.Router();

const transactionRoute = require('../controllers/transaction.controller');

router.route('/:customer_id').get(transactionRoute.getCustomeTransactions);

module.exports = router;
