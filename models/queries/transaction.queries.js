const Transaction = require('../transaction.model');

// -> get transaction by id
const getById = (transaction_id) => {
  return Transaction.findById(transaction_id)
    .populate('invoice')
    .populate('customer');
};

// -> get transaction by customer id
const getByCustomerId = (customer_id) => {
  return Transaction.find({ customer: customer_id })
    .populate('customer')
    .populate('invoice');
};

module.exports = {
  getById,
  getByCustomerId,
};
